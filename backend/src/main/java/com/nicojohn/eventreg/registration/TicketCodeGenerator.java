package com.nicojohn.eventreg.registration;

import java.security.SecureRandom;

import org.springframework.stereotype.Component;

/**
 * Generates short, unambiguous random ticket codes (e.g. CDM-7K3P9Q).
 * Excludes 0/O and 1/I so manual entry at the door is never ambiguous.
 */
@Component
public class TicketCodeGenerator {

    private static final char[] ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ".toCharArray();
    private static final int CODE_LENGTH = 6;
    private static final SecureRandom RANDOM = new SecureRandom();

    public String generate(String prefix) {
        String cleanPrefix = prefix.trim().toUpperCase();
        StringBuilder sb = new StringBuilder(cleanPrefix.length() + 1 + CODE_LENGTH);
        sb.append(cleanPrefix).append('-');
        for (int i = 0; i < CODE_LENGTH; i++) {
            sb.append(ALPHABET[RANDOM.nextInt(ALPHABET.length)]);
        }
        return sb.toString();
    }
}
