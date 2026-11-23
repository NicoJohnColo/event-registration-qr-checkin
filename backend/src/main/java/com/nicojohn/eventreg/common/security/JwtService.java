package com.nicojohn.eventreg.common.security;

import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.time.Clock;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.nicojohn.eventreg.staff.Role;
import com.nicojohn.eventreg.staff.StaffUser;

import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

/**
 * Stateless HS256 JWT issuer and verifier built on JDK HmacSHA256 and Jackson 3.
 */
@Service
public class JwtService {

    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {};
    private static final Base64.Encoder URL_ENCODER = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder URL_DECODER = Base64.getUrlDecoder();

    private final byte[] secretBytes;
    private final ObjectMapper objectMapper;
    private final Clock clock;
    private final long expirationHours;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            ObjectMapper objectMapper,
            Clock clock,
            @Value("${app.jwt.expiration-hours:12}") long expirationHours) {
        if (secret == null || secret.trim().length() < 32) {
            throw new IllegalStateException("app.jwt.secret must be at least 32 characters.");
        }
        this.secretBytes = secret.trim().getBytes(StandardCharsets.UTF_8);
        this.objectMapper = objectMapper;
        this.clock = clock;
        this.expirationHours = expirationHours;
    }

    public record IssuedToken(String token, Instant expiresAt) {
    }

    public IssuedToken issueToken(StaffUser user) {
        Instant now = Instant.now(clock);
        Instant expiresAt = now.plusSeconds(expirationHours * 3600L);

        Map<String, Object> header = new LinkedHashMap<>();
        header.put("alg", "HS256");
        header.put("typ", "JWT");

        Map<String, Object> claims = new LinkedHashMap<>();
        claims.put("sub", user.getUsername());
        claims.put("uid", user.getId());
        claims.put("name", user.getName());
        claims.put("role", user.getRole().name());
        claims.put("iat", now.getEpochSecond());
        claims.put("exp", expiresAt.getEpochSecond());

        String encodedHeader = URL_ENCODER.encodeToString(objectMapper.writeValueAsBytes(header));
        String encodedPayload = URL_ENCODER.encodeToString(objectMapper.writeValueAsBytes(claims));
        String signingInput = encodedHeader + "." + encodedPayload;
        String encodedSignature = URL_ENCODER.encodeToString(sign(signingInput));

        return new IssuedToken(signingInput + "." + encodedSignature, expiresAt);
    }

    public Optional<StaffPrincipal> parseAndVerify(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            return Optional.empty();
        }

        try {
            String signingInput = parts[0] + "." + parts[1];
            byte[] providedSig = URL_DECODER.decode(parts[2]);
            byte[] expectedSig = sign(signingInput);
            if (!MessageDigest.isEqual(providedSig, expectedSig)) {
                return Optional.empty();
            }

            Map<String, Object> header = objectMapper.readValue(URL_DECODER.decode(parts[0]), MAP_TYPE);
            if (!"HS256".equals(header.get("alg"))) {
                return Optional.empty();
            }

            Map<String, Object> claims = objectMapper.readValue(URL_DECODER.decode(parts[1]), MAP_TYPE);
            Object expObj = claims.get("exp");
            Object uidObj = claims.get("uid");
            Object subObj = claims.get("sub");
            Object nameObj = claims.get("name");
            Object roleObj = claims.get("role");

            if (!(expObj instanceof Number expNum) || !(uidObj instanceof Number uidNum)
                    || !(subObj instanceof String username) || !(nameObj instanceof String name)
                    || !(roleObj instanceof String roleStr)) {
                return Optional.empty();
            }

            long nowEpoch = Instant.now(clock).getEpochSecond();
            if (expNum.longValue() <= nowEpoch) {
                return Optional.empty();
            }

            Role role = Role.valueOf(roleStr);
            return Optional.of(new StaffPrincipal(uidNum.longValue(), username, name, role));
        } catch (RuntimeException ex) {
            return Optional.empty();
        }
    }

    private byte[] sign(String input) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(new SecretKeySpec(secretBytes, HMAC_ALGORITHM));
            return mac.doFinal(input.getBytes(StandardCharsets.UTF_8));
        } catch (GeneralSecurityException ex) {
            throw new IllegalStateException("Failed to sign JWT", ex);
        }
    }
}
