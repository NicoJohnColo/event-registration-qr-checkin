package com.nicojohn.eventreg.common.security;

import java.io.IOException;
import java.time.Clock;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.filter.OncePerRequestFilter;

import com.nicojohn.eventreg.common.exception.ApiError;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import tools.jackson.databind.ObjectMapper;

/**
 * Sliding-minute fixed-window per-IP rate limiter protecting ticket lookup,
 * self-cancellation, registration, and door check-in endpoints from brute-force probing.
 */
public class RateLimitFilter extends OncePerRequestFilter {

    public record RatePolicy(String bucket, int maxRequests, long windowSeconds) {}

    private static final List<RateRule> RULES = List.of(
            new RateRule(HttpMethod.POST.name(), "/api/tickets/lookup", new RatePolicy("TICKET_LOOKUP", 20, 60)),
            new RateRule(HttpMethod.POST.name(), "/api/tickets/cancel", new RatePolicy("TICKET_LOOKUP", 20, 60)),
            new RateRule(HttpMethod.POST.name(), "/api/checkin", new RatePolicy("CHECK_IN", 60, 60)),
            new RateRule(HttpMethod.POST.name(), "/api/events/", new RatePolicy("REGISTER", 15, 60), "/register")
    );

    private static final int MAX_TRACKED_KEYS = 10_000;

    private final ConcurrentHashMap<String, WindowCounter> counters = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper;
    private final Clock clock;
    private final boolean enabled;

    public RateLimitFilter(ObjectMapper objectMapper, Clock clock, boolean enabled) {
        this.objectMapper = objectMapper;
        this.clock = clock;
        this.enabled = enabled;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        if (!enabled) {
            filterChain.doFilter(request, response);
            return;
        }

        RatePolicy policy = matchPolicy(request.getMethod(), request.getRequestURI());
        if (policy == null) {
            filterChain.doFilter(request, response);
            return;
        }

        long nowMillis = clock.millis();
        long windowMillis = policy.windowSeconds() * 1000L;
        String key = policy.bucket() + ":" + resolveClientIp(request);

        if (counters.size() > MAX_TRACKED_KEYS) {
            evictExpired(nowMillis, windowMillis);
        }

        WindowCounter counter = counters.compute(key, (k, existing) -> {
            if (existing == null || (nowMillis - existing.windowStartMillis) >= windowMillis) {
                return new WindowCounter(nowMillis, 1);
            }
            return new WindowCounter(existing.windowStartMillis, existing.count + 1);
        });

        int remaining = Math.max(0, policy.maxRequests() - counter.count);
        response.setHeader("X-RateLimit-Limit", String.valueOf(policy.maxRequests()));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(remaining));

        if (counter.count > policy.maxRequests()) {
            long elapsedSec = Math.max(0L, (nowMillis - counter.windowStartMillis) / 1000L);
            long retryAfter = Math.max(1L, policy.windowSeconds() - elapsedSec);
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setHeader("Retry-After", String.valueOf(retryAfter));
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            ApiError error = ApiError.of(
                    HttpStatus.TOO_MANY_REQUESTS.value(),
                    HttpStatus.TOO_MANY_REQUESTS.getReasonPhrase(),
                    "Too many requests. Please wait a moment and try again.");
            objectMapper.writeValue(response.getWriter(), error);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private RatePolicy matchPolicy(String method, String uri) {
        if (method == null || uri == null) {
            return null;
        }
        for (RateRule rule : RULES) {
            if (!rule.method.equalsIgnoreCase(method)) {
                continue;
            }
            if (rule.suffix == null && rule.prefix.equals(uri)) {
                return rule.policy;
            }
            if (rule.suffix != null && uri.startsWith(rule.prefix) && uri.endsWith(rule.suffix)) {
                return rule.policy;
            }
        }
        return null;
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            int comma = forwarded.indexOf(',');
            return (comma >= 0 ? forwarded.substring(0, comma) : forwarded).trim();
        }
        String remote = request.getRemoteAddr();
        return remote != null && !remote.isBlank() ? remote : "unknown";
    }

    private void evictExpired(long nowMillis, long windowMillis) {
        for (Map.Entry<String, WindowCounter> entry : counters.entrySet()) {
            if ((nowMillis - entry.getValue().windowStartMillis) >= windowMillis) {
                counters.remove(entry.getKey(), entry.getValue());
            }
        }
    }

    private record WindowCounter(long windowStartMillis, int count) {}

    private record RateRule(String method, String prefix, RatePolicy policy, String suffix) {
        RateRule(String method, String prefix, RatePolicy policy) {
            this(method, prefix, policy, null);
        }
    }
}
