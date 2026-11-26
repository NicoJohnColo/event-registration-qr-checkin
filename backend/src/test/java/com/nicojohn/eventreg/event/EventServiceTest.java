package com.nicojohn.eventreg.event;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;

import com.nicojohn.eventreg.audit.AuditLogRepository;
import com.nicojohn.eventreg.common.exception.ApiException;
import com.nicojohn.eventreg.common.util.ManilaTime;
import com.nicojohn.eventreg.event.dto.EventResponse;
import com.nicojohn.eventreg.event.dto.EventUpsertRequest;
import com.nicojohn.eventreg.event.dto.StaffEventResponse;
import com.nicojohn.eventreg.registration.RegistrationRepository;
import com.nicojohn.eventreg.staff.StaffRepository;

class EventServiceTest {

    private EventRepository eventRepository;
    private RegistrationRepository registrationRepository;
    private AuditLogRepository auditLogRepository;
    private StaffRepository staffRepository;
    private Clock fixedClock;
    private EventService eventService;

    @BeforeEach
    void setUp() {
        eventRepository = mock(EventRepository.class);
        registrationRepository = mock(RegistrationRepository.class);
        auditLogRepository = mock(AuditLogRepository.class);
        staffRepository = mock(StaffRepository.class);
        LocalDate today = LocalDate.of(2026, 11, 23);
        fixedClock = Clock.fixed(ManilaTime.atManilaTime(today, 10, 0), ManilaTime.ZONE);
        eventService = new EventService(eventRepository, registrationRepository, auditLogRepository, staffRepository, fixedClock);
    }

    @Test
    void computesSpotsLeftFullAndEndedOnServer() {
        LocalDate today = LocalDate.of(2026, 11, 23);
        Event active = new Event(
                "Cebu Dev Meetup 2026", "Desc", "Ayala",
                ManilaTime.atManilaTime(today, 8, 0),
                ManilaTime.atManilaTime(today, 22, 0),
                30, EventStatus.PUBLISHED, "CDM", Instant.now(fixedClock));
        ReflectionTestUtils.setField(active, "id", 1L);

        Event fullEvent = new Event(
                "Cebu Startup Pitch Night", "Desc", "CBP",
                ManilaTime.atManilaTime(today.plusDays(3), 18, 0),
                ManilaTime.atManilaTime(today.plusDays(3), 21, 0),
                5, EventStatus.PUBLISHED, "CSP", Instant.now(fixedClock));
        ReflectionTestUtils.setField(fullEvent, "id", 2L);

        Event pastEvent = new Event(
                "Cebu Code Camp", "Desc", "USC",
                ManilaTime.atManilaTime(today.minusDays(7), 9, 0),
                ManilaTime.atManilaTime(today.minusDays(7), 15, 0),
                40, EventStatus.PUBLISHED, "CCC", Instant.now(fixedClock));
        ReflectionTestUtils.setField(pastEvent, "id", 3L);

        when(eventRepository.findByStatusOrderByStartsAtAsc(EventStatus.PUBLISHED))
                .thenReturn(List.of(pastEvent, active, fullEvent));
        when(registrationRepository.countByEventIdsAndStatusIn(anyCollection(), anyCollection()))
                .thenReturn(List.of(
                        new Object[] { 1L, 3L },
                        new Object[] { 2L, 5L },
                        new Object[] { 3L, 2L }));

        List<EventResponse> results = eventService.listPublishedEvents();
        assertEquals(3, results.size());

        EventResponse pastDto = results.get(0);
        assertTrue(pastDto.ended());
        assertEquals(38, pastDto.spotsLeft());

        EventResponse activeDto = results.get(1);
        assertFalse(activeDto.ended());
        assertFalse(activeDto.full());
        assertEquals(27, activeDto.spotsLeft());

        EventResponse fullDto = results.get(2);
        assertFalse(fullDto.ended());
        assertTrue(fullDto.full());
        assertEquals(0, fullDto.spotsLeft());
    }

    @Test
    void hidesNonPublishedEventsFromPublicDetails() {
        Event draft = new Event(
                "Secret Draft", "Desc", "Venue",
                Instant.now(fixedClock), Instant.now(fixedClock).plusSeconds(3600),
                20, EventStatus.DRAFT, "SDR", Instant.now(fixedClock));
        ReflectionTestUtils.setField(draft, "id", 99L);

        when(eventRepository.findById(99L)).thenReturn(Optional.of(draft));

        ApiException ex = assertThrows(ApiException.class, () -> eventService.getPublishedEvent(99L));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus());
    }

    @Test
    void deleteEventCleansChildRowsAndLogsAudit() {
        Event target = new Event(
                "Cleanup Event", "Desc", "Cebu",
                Instant.now(fixedClock), Instant.now(fixedClock).plusSeconds(3600),
                10, EventStatus.CLOSED, "CLN", Instant.now(fixedClock));
        ReflectionTestUtils.setField(target, "id", 55L);

        when(eventRepository.findByIdForUpdate(55L)).thenReturn(Optional.of(target));
        when(registrationRepository.findIdsByEventId(55L)).thenReturn(List.of(101L, 102L));

        eventService.deleteEvent(55L, 1L);

        verify(auditLogRepository).deleteByEntityTypeAndEntityIdIn("REGISTRATION", List.of(101L, 102L));
        verify(registrationRepository).deleteAllByEventId(55L);
        verify(auditLogRepository).deleteByEntityTypeAndEntityIdIn("EVENT", List.of(55L));
        verify(eventRepository).delete(target);
        verify(auditLogRepository).save(any());
    }

    @Test
    void deleteEventRejectsMissingEvent() {
        when(eventRepository.findByIdForUpdate(999L)).thenReturn(Optional.empty());
        ApiException ex = assertThrows(ApiException.class, () -> eventService.deleteEvent(999L, 1L));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus());
    }

    @Test
    void createEventRejectsEndBeforeStart() {
        Instant start = ManilaTime.atManilaTime(LocalDate.of(2026, 11, 28), 17, 0);
        Instant end = ManilaTime.atManilaTime(LocalDate.of(2026, 11, 28), 13, 0);
        EventUpsertRequest req = new EventUpsertRequest(
                "Inverted Time Event", "Desc", "Cebu IT Park", start, end, 30, EventStatus.DRAFT, "ITE");

        ApiException ex = assertThrows(ApiException.class, () -> eventService.createEvent(req, 1L));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        assertEquals("End time must be after start time.", ex.getMessage());
    }

    @Test
    void updateEventRejectsCapacityBelowRegisteredCount() {
        LocalDate day = LocalDate.of(2026, 11, 28);
        Event existing = new Event(
                "Meetup", "Desc", "Ayala",
                ManilaTime.atManilaTime(day, 9, 0),
                ManilaTime.atManilaTime(day, 17, 0),
                30, EventStatus.PUBLISHED, "CDM", Instant.now(fixedClock));
        ReflectionTestUtils.setField(existing, "id", 1L);

        when(eventRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(existing));
        when(registrationRepository.countByEventIdAndStatusIn(eq(1L), anyCollection())).thenReturn(6L);

        EventUpsertRequest req = new EventUpsertRequest(
                "Meetup", "Desc", "Ayala",
                ManilaTime.atManilaTime(day, 9, 0),
                ManilaTime.atManilaTime(day, 17, 0),
                4, EventStatus.PUBLISHED, "CDM");

        ApiException ex = assertThrows(ApiException.class, () -> eventService.updateEvent(1L, req, 1L));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        assertTrue(ex.getMessage().contains("6"));
    }

    @Test
    void publishDraftTransitionsStatusToPublished() {
        LocalDate day = LocalDate.of(2026, 11, 28);
        Event draft = new Event(
                "Draft Event", "Desc", "Cebu",
                ManilaTime.atManilaTime(day, 9, 0),
                ManilaTime.atManilaTime(day, 17, 0),
                20, EventStatus.DRAFT, "DRF", Instant.now(fixedClock));
        ReflectionTestUtils.setField(draft, "id", 12L);

        when(eventRepository.findByIdForUpdate(12L)).thenReturn(Optional.of(draft));
        when(registrationRepository.countByEventIdAndStatusIn(eq(12L), anyCollection())).thenReturn(0L);
        when(eventRepository.save(any(Event.class))).thenAnswer(inv -> inv.getArgument(0));

        EventUpsertRequest publishReq = new EventUpsertRequest(
                "Draft Event", "Desc", "Cebu",
                ManilaTime.atManilaTime(day, 9, 0),
                ManilaTime.atManilaTime(day, 17, 0),
                20, EventStatus.PUBLISHED, "DRF");

        StaffEventResponse updated = eventService.updateEvent(12L, publishReq, 1L);
        assertEquals(EventStatus.PUBLISHED, updated.status());
    }
}
