package com.nicojohn.eventreg.staff;

import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

class StaffSeedHashTest {

    @Test
    void demoStaffPasswordsMatchSeedHashes() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String organizerHash = "$2a$10$egNwOY1w/P.xOI1N4I/PXOyAQS9TEg6auvAmf1dE1PWI5D0p0v6.2";
        String doorStaffHash = "$2a$10$btND1kXv/2RzSlakhhzGkeomBg2KjE0kcI.8TXYNTd.DJRX3FmTTq";

        assertTrue(encoder.matches("Demo@Cebu2026", organizerHash));
        assertTrue(encoder.matches("Door@Cebu2026", doorStaffHash));
    }
}
