package com.nicojohn.eventreg.common.security;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;

import com.nicojohn.eventreg.audit.AuditLogController;
import com.nicojohn.eventreg.audit.AuditLogService;
import com.nicojohn.eventreg.checkin.CheckInController;
import com.nicojohn.eventreg.checkin.CheckInService;
import com.nicojohn.eventreg.checkin.dto.CheckInStatsResponse;
import com.nicojohn.eventreg.common.config.ClockConfig;
import com.nicojohn.eventreg.common.config.CorsConfig;
import com.nicojohn.eventreg.common.exception.GlobalExceptionHandler;
import com.nicojohn.eventreg.dashboard.DashboardController;
import com.nicojohn.eventreg.dashboard.DashboardService;
import com.nicojohn.eventreg.event.EventService;
import com.nicojohn.eventreg.event.StaffEventController;
import com.nicojohn.eventreg.registration.RegistrationService;
import com.nicojohn.eventreg.registration.StaffAttendeeController;
import com.nicojohn.eventreg.registration.dto.AttendeeListResponse;
import com.nicojohn.eventreg.staff.Role;
import com.nicojohn.eventreg.staff.StaffUser;

/**
 * Verifies Item 16 HTTP-layer RBAC enforcement with real JWTs and @EnableMethodSecurity.
 */
@WebMvcTest(controllers = {
        StaffEventController.class,
        DashboardController.class,
        AuditLogController.class,
        StaffAttendeeController.class,
        CheckInController.class
})
@Import({
        SecurityConfig.class,
        JwtService.class,
        JwtAuthenticationFilter.class,
        ClockConfig.class,
        CorsConfig.class,
        GlobalExceptionHandler.class
})
@TestPropertySource(properties = {
        "app.jwt.secret=eventreg-webmvc-security-test-secret-key-32chars",
        "app.cors.allowed-origin=http://localhost:5173"
})
class RoleSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @MockitoBean
    private EventService eventService;

    @MockitoBean
    private DashboardService dashboardService;

    @MockitoBean
    private AuditLogService auditLogService;

    @MockitoBean
    private RegistrationService registrationService;

    @MockitoBean
    private CheckInService checkInService;

    private String organizerToken;
    private String doorStaffToken;

    @BeforeEach
    void setUp() {
        StaffUser organizer = new StaffUser("Demo Organizer", "organizer", "hash", Role.ORGANIZER);
        ReflectionTestUtils.setField(organizer, "id", 1L);
        organizerToken = "Bearer " + jwtService.issueToken(organizer).token();

        StaffUser doorStaff = new StaffUser("Demo Door Staff", "doorstaff", "hash", Role.DOOR_STAFF);
        ReflectionTestUtils.setField(doorStaff, "id", 2L);
        doorStaffToken = "Bearer " + jwtService.issueToken(doorStaff).token();

        when(eventService.listAllEventsForStaff()).thenReturn(List.of());
        when(dashboardService.getDashboardMetrics()).thenReturn(List.of());
        when(auditLogService.listRecentLogs(any(), any(), any())).thenReturn(List.of());
        when(registrationService.listAttendeesForEvent(1L, null))
                .thenReturn(new AttendeeListResponse(1L, "Cebu Dev Meetup", 30, 0, 0, List.of()));
        when(checkInService.getStats(1L)).thenReturn(new CheckInStatsResponse(1L, 0, 0, 30));
    }

    @Test
    void rejectsUnauthenticatedRequestsWith401() throws Exception {
        mockMvc.perform(get("/api/staff/events")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/staff/audit-logs")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/checkin/stats").param("eventId", "1")).andExpect(status().isUnauthorized());
    }

    @Test
    void blocksDoorStaffFromOrganizerEndpointsWith403() throws Exception {
        mockMvc.perform(get("/api/staff/events").header("Authorization", doorStaffToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));

        mockMvc.perform(post("/api/staff/events")
                        .header("Authorization", doorStaffToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/staff/dashboard/metrics").header("Authorization", doorStaffToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/staff/audit-logs").header("Authorization", doorStaffToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/staff/events/1/promote-waitlist").header("Authorization", doorStaffToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/staff/registrations/1/cancel").header("Authorization", doorStaffToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void allowsDoorStaffOnCheckInAndReadOnlyRosterEndpoints() throws Exception {
        mockMvc.perform(get("/api/checkin/stats").param("eventId", "1").header("Authorization", doorStaffToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/staff/events/1/attendees").header("Authorization", doorStaffToken))
                .andExpect(status().isOk());
    }

    @Test
    void allowsOrganizerOnAllManagementAndAuditEndpoints() throws Exception {
        mockMvc.perform(get("/api/staff/events").header("Authorization", organizerToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/staff/dashboard/metrics").header("Authorization", organizerToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/staff/audit-logs").header("Authorization", organizerToken))
                .andExpect(status().isOk());
    }
}
