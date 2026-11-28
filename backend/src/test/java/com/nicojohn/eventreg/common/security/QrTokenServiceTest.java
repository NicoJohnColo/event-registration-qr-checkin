package com.nicojohn.eventreg.common.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Optional;

import org.junit.jupiter.api.Test;

class QrTokenServiceTest {

    private final QrTokenService qrTokenService =
            new QrTokenService("eventreg-test-qr-hmac-secret-at-least-32chars");

    @Test
    void signsAndVerifiesCaseInsensitivePayloadForMatchingEvent() {
        String signed = qrTokenService.sign(1L, "CDM-7K3P9Q");
        assertTrue(signed.startsWith("ER1.CDM-7K3P9Q."));
        assertTrue(signed.length() <= 64);

        Optional<String> verified = qrTokenService.resolveCheckInInput("  " + signed.toLowerCase() + "  ", 1L);
        assertEquals(Optional.of("CDM-7K3P9Q"), verified);
    }

    @Test
    void rejectsTamperedOrCrossEventQrPayload() {
        String signedForEvent1 = qrTokenService.sign(1L, "CDM-7K3P9Q");
        char last = signedForEvent1.charAt(signedForEvent1.length() - 1);
        char tamperedLast = last == 'A' ? 'B' : 'A';
        String tampered = signedForEvent1.substring(0, signedForEvent1.length() - 1) + tamperedLast;

        assertTrue(qrTokenService.resolveCheckInInput(tampered, 1L).isEmpty());
        assertTrue(qrTokenService.resolveCheckInInput(signedForEvent1, 2L).isEmpty());
        assertFalse(qrTokenService.isValidTicketOrToken(tampered, 1L, "CDM-7K3P9Q"));
    }

    @Test
    void preservesManualShortCodeFallback() {
        assertEquals(Optional.of("CDM-7K3P9Q"), qrTokenService.resolveCheckInInput("cdm-7k3p9q", 1L));
        assertTrue(qrTokenService.isValidTicketOrToken("cdm-7k3p9q", 1L, "CDM-7K3P9Q"));
    }
}
