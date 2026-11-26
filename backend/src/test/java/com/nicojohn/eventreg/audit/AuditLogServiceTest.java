package com.nicojohn.eventreg.audit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Pageable;
import org.springframework.test.util.ReflectionTestUtils;

import com.nicojohn.eventreg.audit.dto.AuditLogResponse;
import com.nicojohn.eventreg.staff.Role;
import com.nicojohn.eventreg.staff.StaffUser;

class AuditLogServiceTest {

    private AuditLogRepository auditLogRepository;
    private AuditLogService auditLogService;

    @BeforeEach
    void setUp() {
        auditLogRepository = mock(AuditLogRepository.class);
        auditLogService = new AuditLogService(auditLogRepository);
    }

    @Test
    void mapsStaffAndSelfServiceActorsAndFiltersBySearchQuery() {
        StaffUser doorStaff = new StaffUser("Demo Door Staff", "doorstaff", "hash", Role.DOOR_STAFF);
        ReflectionTestUtils.setField(doorStaff, "id", 2L);

        AuditLog checkIn = new AuditLog(
                "CHECK_IN", "REGISTRATION", 11L, doorStaff,
                "Checked in attendee 'Ana Reyes' (CDM-111AAA)", Instant.parse("2026-11-26T04:00:00Z"));
        ReflectionTestUtils.setField(checkIn, "id", 101L);

        AuditLog selfCancel = new AuditLog(
                "ATTENDEE_CANCEL", "REGISTRATION", 12L, null,
                "Attendee cancelled registration for 'Juan Dela Cruz' (CDM-222BBB)", Instant.parse("2026-11-26T04:05:00Z"));
        ReflectionTestUtils.setField(selfCancel, "id", 102L);

        when(auditLogRepository.findRecentWithActor(any(Pageable.class)))
                .thenReturn(List.of(selfCancel, checkIn));

        List<AuditLogResponse> all = auditLogService.listRecentLogs(null, null, 50);
        assertEquals(2, all.size());
        assertEquals("Attendee (Self-Service)", all.get(0).performedByName());
        assertEquals("ATTENDEE", all.get(0).performedByRole());
        assertEquals("Demo Door Staff", all.get(1).performedByName());
        assertEquals("DOOR_STAFF", all.get(1).performedByRole());

        List<AuditLogResponse> filtered = auditLogService.listRecentLogs(null, "CDM-111AAA", 50);
        assertEquals(1, filtered.size());
        assertEquals(101L, filtered.get(0).id());
    }

    @Test
    void delegatesActionFilterToRepository() {
        AuditLog undo = new AuditLog(
                "UNDO_CHECK_IN", "REGISTRATION", 15L, null,
                "Undid check-in", Instant.parse("2026-11-26T05:00:00Z"));
        when(auditLogRepository.findRecentByActionWithActor(eq("UNDO_CHECK_IN"), any(Pageable.class)))
                .thenReturn(List.of(undo));

        List<AuditLogResponse> res = auditLogService.listRecentLogs(" undo_check_in ", "", null);
        assertEquals(1, res.size());
        assertEquals("UNDO_CHECK_IN", res.get(0).action());
    }
}
