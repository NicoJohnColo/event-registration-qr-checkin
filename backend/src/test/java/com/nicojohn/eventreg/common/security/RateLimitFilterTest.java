package com.nicojohn.eventreg.common.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.concurrent.atomic.AtomicInteger;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import tools.jackson.databind.json.JsonMapper;

class RateLimitFilterTest {

    private static final class MutableClock extends Clock {
        private Instant instant;
        private final ZoneId zone;

        private MutableClock(Instant instant, ZoneId zone) {
            this.instant = instant;
            this.zone = zone;
        }

        private void advanceSeconds(long seconds) {
            this.instant = this.instant.plusSeconds(seconds);
        }

        @Override
        public ZoneId getZone() { return zone; }

        @Override
        public Clock withZone(ZoneId zone) { return new MutableClock(instant, zone); }

        @Override
        public Instant instant() { return instant; }
    }

    @Test
    void throttlesTicketLookupAfter20RequestsAndResetsAfterWindow() throws Exception {
        MutableClock clock = new MutableClock(Instant.parse("2026-11-26T10:00:00Z"), ZoneOffset.UTC);
        RateLimitFilter filter = new RateLimitFilter(JsonMapper.builder().build(), clock, true);
        AtomicInteger passed = new AtomicInteger();

        for (int i = 0; i < 20; i++) {
            MockHttpServletRequest req = new MockHttpServletRequest("POST", "/api/tickets/lookup");
            req.setRemoteAddr("203.0.113.10");
            MockHttpServletResponse res = new MockHttpServletResponse();
            filter.doFilter(req, res, new MockFilterChain() {
                @Override
                public void doFilter(jakarta.servlet.ServletRequest request, jakarta.servlet.ServletResponse response) {
                    passed.incrementAndGet();
                }
            });
            assertEquals(200, res.getStatus());
        }
        assertEquals(20, passed.get());

        // 21st request from same IP must return HTTP 429
        MockHttpServletRequest blockedReq = new MockHttpServletRequest("POST", "/api/tickets/lookup");
        blockedReq.setRemoteAddr("203.0.113.10");
        MockHttpServletResponse blockedRes = new MockHttpServletResponse();
        filter.doFilter(blockedReq, blockedRes, new MockFilterChain());
        assertEquals(429, blockedRes.getStatus());
        assertTrue(blockedRes.getContentAsString().contains("Too many requests"));
        assertEquals("0", blockedRes.getHeader("X-RateLimit-Remaining"));

        // Separate client IP remains unaffected
        MockHttpServletRequest otherIpReq = new MockHttpServletRequest("POST", "/api/tickets/lookup");
        otherIpReq.setRemoteAddr("203.0.113.11");
        MockHttpServletResponse otherIpRes = new MockHttpServletResponse();
        filter.doFilter(otherIpReq, otherIpRes, new MockFilterChain());
        assertEquals(200, otherIpRes.getStatus());

        // Advancing past 60s window clears limit for original IP
        clock.advanceSeconds(61);
        MockHttpServletRequest resetReq = new MockHttpServletRequest("POST", "/api/tickets/lookup");
        resetReq.setRemoteAddr("203.0.113.10");
        MockHttpServletResponse resetRes = new MockHttpServletResponse();
        filter.doFilter(resetReq, resetRes, new MockFilterChain());
        assertEquals(200, resetRes.getStatus());
    }
}
