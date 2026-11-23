package com.nicojohn.eventreg.common.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;

import org.junit.jupiter.api.Test;

import com.nicojohn.eventreg.staff.Role;
import com.nicojohn.eventreg.staff.StaffUser;

import tools.jackson.databind.json.JsonMapper;

class JwtServiceTest {

    private static final String TEST_SECRET = "eventreg-test-secret-key-with-at-least-32-chars";

    private StaffUser sampleStaff() {
        StaffUser user = mock(StaffUser.class);
        when(user.getId()).thenReturn(1L);
        when(user.getName()).thenReturn("Demo Organizer");
        when(user.getUsername()).thenReturn("organizer");
        when(user.getRole()).thenReturn(Role.ORGANIZER);
        return user;
    }

    @Test
    void issuesAndVerifiesValidToken() {
        Clock clock = Clock.fixed(Instant.parse("2026-11-23T10:00:00Z"), ZoneOffset.UTC);
        JwtService jwtService = new JwtService(TEST_SECRET, JsonMapper.builder().build(), clock, 12);

        JwtService.IssuedToken issued = jwtService.issueToken(sampleStaff());
        Optional<StaffPrincipal> parsed = jwtService.parseAndVerify(issued.token());

        assertTrue(parsed.isPresent());
        assertEquals(1L, parsed.get().id());
        assertEquals("organizer", parsed.get().username());
        assertEquals("Demo Organizer", parsed.get().name());
        assertEquals(Role.ORGANIZER, parsed.get().role());
    }

    @Test
    void rejectsTamperedAndMalformedTokens() {
        Clock clock = Clock.fixed(Instant.parse("2026-11-23T10:00:00Z"), ZoneOffset.UTC);
        JwtService jwtService = new JwtService(TEST_SECRET, JsonMapper.builder().build(), clock, 12);

        String valid = jwtService.issueToken(sampleStaff()).token();
        String tampered = valid.substring(0, valid.length() - 2) + "xx";

        assertTrue(jwtService.parseAndVerify(tampered).isEmpty());
        assertTrue(jwtService.parseAndVerify("not-a-jwt").isEmpty());
        assertTrue(jwtService.parseAndVerify("").isEmpty());
    }

    @Test
    void rejectsExpiredToken() {
        Instant issuedAt = Instant.parse("2026-11-23T10:00:00Z");
        JwtService issuer = new JwtService(
                TEST_SECRET, JsonMapper.builder().build(), Clock.fixed(issuedAt, ZoneOffset.UTC), 1);
        JwtService laterVerifier = new JwtService(
                TEST_SECRET,
                JsonMapper.builder().build(),
                Clock.fixed(issuedAt.plusSeconds(3601), ZoneOffset.UTC),
                1);

        String token = issuer.issueToken(sampleStaff()).token();
        assertTrue(laterVerifier.parseAndVerify(token).isEmpty());
    }

    @Test
    void rejectsWeakSecret() {
        Clock clock = Clock.fixed(Instant.parse("2026-11-23T10:00:00Z"), ZoneOffset.UTC);
        assertThrows(
                IllegalStateException.class,
                () -> new JwtService("too-short", JsonMapper.builder().build(), clock, 12));
    }
}
