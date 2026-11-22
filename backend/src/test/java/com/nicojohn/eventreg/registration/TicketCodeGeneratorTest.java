package com.nicojohn.eventreg.registration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.HashSet;
import java.util.Set;

import org.junit.jupiter.api.Test;

class TicketCodeGeneratorTest {

    @Test
    void generatesUnambiguousPrefixedCodes() {
        TicketCodeGenerator generator = new TicketCodeGenerator();
        Set<String> seen = new HashSet<>();

        for (int i = 0; i < 200; i++) {
            String code = generator.generate("cdm");
            assertTrue(code.matches("^CDM-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$"), "Unexpected format: " + code);
            assertFalse(code.contains("0") || code.contains("O") || code.contains("1") || code.contains("I"));
            seen.add(code);
        }
        assertEquals(200, seen.size());
    }
}
