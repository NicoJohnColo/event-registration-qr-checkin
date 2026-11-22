package com.nicojohn.eventreg.staff;

import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

class StaffSeedHashTest {

    @Test
    void demoOrganizerPasswordMatchesSeedHash() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String seedHash = "$2a$10$egNwOY1w/P.xOI1N4I/PXOyAQS9TEg6auvAmf1dE1PWI5D0p0v6.2";
        assertTrue(encoder.matches("Demo@Cebu2026", seedHash));
    }
}
