package com.nicojohn.eventreg.staff;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import com.nicojohn.eventreg.common.exception.ApiException;
import com.nicojohn.eventreg.common.security.JwtService;
import com.nicojohn.eventreg.common.security.StaffPrincipal;
import com.nicojohn.eventreg.staff.dto.LoginRequest;
import com.nicojohn.eventreg.staff.dto.LoginResponse;
import com.nicojohn.eventreg.staff.dto.StaffProfileResponse;

import tools.jackson.databind.json.JsonMapper;

class StaffAuthServiceTest {

    private StaffRepository staffRepository;
    private PasswordEncoder passwordEncoder;
    private JwtService jwtService;
    private StaffAuthService authService;

    @BeforeEach
    void setUp() {
        staffRepository = mock(StaffRepository.class);
        passwordEncoder = new BCryptPasswordEncoder();
        Clock clock = Clock.fixed(Instant.parse("2026-11-23T10:00:00Z"), ZoneOffset.UTC);
        jwtService = new JwtService(
                "eventreg-test-secret-key-with-at-least-32-chars",
                JsonMapper.builder().build(),
                clock,
                12);
        authService = new StaffAuthService(staffRepository, passwordEncoder, jwtService);
    }

    private StaffUser sampleOrganizer() {
        StaffUser user = new StaffUser();
        ReflectionTestUtils.setField(user, "id", 1L);
        ReflectionTestUtils.setField(user, "name", "Demo Organizer");
        ReflectionTestUtils.setField(user, "username", "organizer");
        ReflectionTestUtils.setField(
                user, "passwordHash", "$2a$10$egNwOY1w/P.xOI1N4I/PXOyAQS9TEg6auvAmf1dE1PWI5D0p0v6.2");
        ReflectionTestUtils.setField(user, "role", Role.ORGANIZER);
        return user;
    }

    @Test
    void logsInValidStaffAndIssuesJwt() {
        when(staffRepository.findByUsernameIgnoreCase("organizer")).thenReturn(Optional.of(sampleOrganizer()));

        LoginResponse response = authService.login(new LoginRequest("  organizer  ", "Demo@Cebu2026"));

        assertFalse(response.token().isBlank());
        assertEquals("organizer", response.staff().username());
        assertEquals(Role.ORGANIZER, response.staff().role());
        assertEquals("organizer", jwtService.parseAndVerify(response.token()).orElseThrow().username());
    }

    @Test
    void rejectsWrongPasswordAndUnknownUserWithIdentical401() {
        when(staffRepository.findByUsernameIgnoreCase("organizer")).thenReturn(Optional.of(sampleOrganizer()));
        when(staffRepository.findByUsernameIgnoreCase("unknown")).thenReturn(Optional.empty());

        ApiException wrongPassword = assertThrows(
                ApiException.class,
                () -> authService.login(new LoginRequest("organizer", "WrongPassword123")));
        ApiException unknownUser = assertThrows(
                ApiException.class,
                () -> authService.login(new LoginRequest("unknown", "Demo@Cebu2026")));

        assertEquals(HttpStatus.UNAUTHORIZED, wrongPassword.getStatus());
        assertEquals(HttpStatus.UNAUTHORIZED, unknownUser.getStatus());
        assertEquals("Invalid username or password.", wrongPassword.getMessage());
        assertEquals(wrongPassword.getMessage(), unknownUser.getMessage());
    }

    @Test
    void returnsCurrentStaffProfileForAuthenticatedPrincipal() {
        when(staffRepository.findById(1L)).thenReturn(Optional.of(sampleOrganizer()));

        StaffProfileResponse profile = authService.me(
                new StaffPrincipal(1L, "organizer", "Demo Organizer", Role.ORGANIZER));

        assertEquals(1L, profile.id());
        assertEquals("Demo Organizer", profile.name());
        assertEquals("organizer", profile.username());
        assertEquals(Role.ORGANIZER, profile.role());
    }
}
