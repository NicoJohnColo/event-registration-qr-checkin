package com.nicojohn.eventreg.common.security;

import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.Locale;
import java.util.Optional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Signs and verifies tamper-evident HMAC-SHA256 QR pass payloads (`ER1.<TICKET_CODE>.<HMAC24>`).
 * Scanned payloads are bound to both ticket code and event ID; forged or cross-event payloads are rejected.
 */
@Service
public class QrTokenService {

    public static final String TOKEN_PREFIX = "ER1.";
    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private static final int SIGNATURE_HEX_CHARS = 24; // 96-bit MAC tag
    private static final HexFormat UPPER_HEX = HexFormat.of().withUpperCase();

    private final byte[] secretBytes;

    public QrTokenService(@Value("${app.qr.hmac-secret:${app.jwt.secret}}") String secret) {
        if (secret == null || secret.trim().length() < 32) {
            throw new IllegalStateException("QR HMAC secret must be at least 32 characters.");
        }
        this.secretBytes = ("qr-pass-v1:" + secret.trim()).getBytes(StandardCharsets.UTF_8);
    }

    /** Generates a signed, case-insensitive QR payload bound to eventId and ticketCode. */
    public String sign(Long eventId, String ticketCode) {
        if (eventId == null || ticketCode == null || ticketCode.isBlank()) {
            return ticketCode;
        }
        String normalizedCode = ticketCode.trim().toUpperCase(Locale.ROOT);
        String sigHex = computeHmacHex(eventId, normalizedCode);
        return TOKEN_PREFIX + normalizedCode + "." + sigHex;
    }

    /**
     * Resolves door check-in input against expectedEventId:
     * - Signed payload (`ER1.<code>.<sig>`) -> verifies HMAC for expectedEventId; empty if forged/wrong event.
     * - Plain manual code (`CDM-7K3P9Q`) -> returns normalized code for database lookup fallback.
     */
    public Optional<String> resolveCheckInInput(String rawInput, Long expectedEventId) {
        if (rawInput == null || rawInput.isBlank()) {
            return Optional.empty();
        }
        String normalized = rawInput.trim().toUpperCase(Locale.ROOT);
        if (!normalized.startsWith(TOKEN_PREFIX)) {
            return Optional.of(normalized);
        }
        if (expectedEventId == null) {
            return Optional.empty();
        }
        return verifySignedToken(normalized, expectedEventId);
    }

    /** Parses either a plain code or verifies a signed payload against the matched eventId. */
    public boolean isValidTicketOrToken(String rawInput, Long matchedEventId, String expectedTicketCode) {
        if (rawInput == null || rawInput.isBlank()) {
            return false;
        }
        String normalized = rawInput.trim().toUpperCase(Locale.ROOT);
        if (!normalized.startsWith(TOKEN_PREFIX)) {
            return normalized.equals(expectedTicketCode.toUpperCase(Locale.ROOT));
        }
        return verifySignedToken(normalized, matchedEventId)
                .map(code -> code.equals(expectedTicketCode.toUpperCase(Locale.ROOT)))
                .orElse(false);
    }

    /** Extracts the raw ticket code portion if input uses `ER1.<code>.<sig>` format, otherwise returns normalized input. */
    public String extractCandidateCode(String rawInput) {
        if (rawInput == null) {
            return "";
        }
        String normalized = rawInput.trim().toUpperCase(Locale.ROOT);
        if (!normalized.startsWith(TOKEN_PREFIX)) {
            return normalized;
        }
        String[] parts = normalized.split("\\.", -1);
        return parts.length == 3 ? parts[1] : normalized;
    }

    private Optional<String> verifySignedToken(String normalizedToken, Long expectedEventId) {
        String[] parts = normalizedToken.split("\\.", -1);
        if (parts.length != 3 || !"ER1".equals(parts[0]) || parts[1].isBlank()) {
            return Optional.empty();
        }
        String candidateCode = parts[1];
        String candidateSig = parts[2];
        if (candidateSig.length() != SIGNATURE_HEX_CHARS) {
            return Optional.empty();
        }

        String expectedSig = computeHmacHex(expectedEventId, candidateCode);
        boolean matches = MessageDigest.isEqual(
                expectedSig.getBytes(StandardCharsets.US_ASCII),
                candidateSig.getBytes(StandardCharsets.US_ASCII));
        return matches ? Optional.of(candidateCode) : Optional.empty();
    }

    private String computeHmacHex(Long eventId, String normalizedCode) {
        String message = eventId + ":" + normalizedCode;
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(new SecretKeySpec(secretBytes, HMAC_ALGORITHM));
            byte[] fullDigest = mac.doFinal(message.getBytes(StandardCharsets.UTF_8));
            byte[] truncated = new byte[SIGNATURE_HEX_CHARS / 2];
            System.arraycopy(fullDigest, 0, truncated, 0, truncated.length);
            return UPPER_HEX.formatHex(truncated);
        } catch (GeneralSecurityException ex) {
            throw new IllegalStateException("HMAC-SHA256 unavailable.", ex);
        }
    }
}
