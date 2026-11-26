package com.nicojohn.eventreg.registration;

import static org.junit.jupiter.api.Assertions.assertEquals;
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

import com.nicojohn.eventreg.common.exception.ApiException;
import com.nicojohn.eventreg.common.util.ManilaTime;
import com.nicojohn.eventreg.event.Event;
import com.nicojohn.eventreg.event.EventRepository;
import com.nicojohn.eventreg.event.EventStatus;
import com.nicojohn.eventreg.registration.dto.AttendeeListResponse;
import com.nicojohn.eventreg.audit.AuditLogRepository;
import com.nicojohn.eventreg.registration.dto.RegisterRequest;
import com.nicojohn.eventreg.registration.dto.TicketLookupRequest;
import com.nicojohn.eventreg.registration.dto.TicketResponse;
import com.nicojohn.eventreg.staff.StaffRepository;

class RegistrationServiceTest {

    private EventRepository eventRepository;
    private RegistrationRepository registrationRepository;
    private AuditLogRepository auditLogRepository;
    private StaffRepository staffRepository;
    private Clock fixedClock;
    private RegistrationService registrationService;

    @BeforeEach
    void setUp() {
        eventRepository = mock(EventRepository.class);
        registrationRepository = mock(RegistrationRepository.class);
        auditLogRepository = mock(AuditLogRepository.class);
        staffRepository = mock(StaffRepository.class);
        LocalDate today = LocalDate.of(2026, 11, 23);
        fixedClock = Clock.fixed(ManilaTime.atManilaTime(today, 10, 0), ManilaTime.ZONE);
        registrationService = new RegistrationService(
                eventRepository,
                registrationRepository,
                new TicketCodeGenerator(),
                auditLogRepository,
                staffRepository,
                fixedClock);
    }

    private Event sampleEvent(Long id, int capacity, LocalDate day, EventStatus status) {
        Event event = new Event(
                "Cebu Dev Meetup 2026", "Desc", "Ayala Center Cebu",
                ManilaTime.atManilaTime(day, 8, 0),
                ManilaTime.atManilaTime(day, 22, 0),
                capacity, status, "CDM", Instant.now(fixedClock));
        ReflectionTestUtils.setField(event, "id", id);
        return event;
    }

    @Test
    void registersAttendeeAndGeneratesPrefixedTicketCode() {
        Event event = sampleEvent(1L, 30, LocalDate.of(2026, 11, 23), EventStatus.PUBLISHED);
        when(eventRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(event));
        when(registrationRepository.existsByEventIdAndEmailIgnoreCaseAndStatusIn(
                eq(1L), eq("juan.delacruz@example.com"), anyCollection())).thenReturn(false);
        when(registrationRepository.countByEventIdAndStatusIn(eq(1L), anyCollection())).thenReturn(3L);
        when(registrationRepository.existsByTicketCode(any())).thenReturn(false);
        when(registrationRepository.saveAndFlush(any(Registration.class))).thenAnswer(inv -> {
            Registration r = inv.getArgument(0);
            ReflectionTestUtils.setField(r, "id", 101L);
            return r;
        });

        TicketResponse response = registrationService.register(
                1L, new RegisterRequest("  Juan Dela Cruz  ", "JUAN.DELACRUZ@EXAMPLE.COM", "09171234567"));

        assertEquals(101L, response.registrationId());
        assertEquals("Juan Dela Cruz", response.attendeeName());
        assertEquals("juan.delacruz@example.com", response.email());
        assertEquals(RegistrationStatus.CONFIRMED, response.status());
        assertTrue(response.ticketCode().startsWith("CDM-"));
        verify(eventRepository).findByIdForUpdate(1L);
    }

    @Test
    void queuesAttendeeOnWaitlistWhenEventIsFull() {
        Event fullEvent = sampleEvent(3L, 5, LocalDate.of(2026, 11, 26), EventStatus.PUBLISHED);
        when(eventRepository.findByIdForUpdate(3L)).thenReturn(Optional.of(fullEvent));
        when(registrationRepository.existsByEventIdAndEmailIgnoreCaseAndStatusIn(
                eq(3L), eq("juan.delacruz@example.com"), anyCollection())).thenReturn(false);
        when(registrationRepository.countByEventIdAndStatusIn(eq(3L), anyCollection())).thenReturn(5L);
        when(registrationRepository.findMaxWaitlistPosition(3L)).thenReturn(2);
        when(registrationRepository.existsByTicketCode(any())).thenReturn(false);
        when(registrationRepository.saveAndFlush(any(Registration.class))).thenAnswer(inv -> {
            Registration r = inv.getArgument(0);
            ReflectionTestUtils.setField(r, "id", 201L);
            return r;
        });

        TicketResponse res = registrationService.register(
                3L, new RegisterRequest("Juan Dela Cruz", "juan.delacruz@example.com", "09171234567"));

        assertEquals(RegistrationStatus.WAITLISTED, res.status());
        assertEquals(3, res.waitlistPosition());
        assertEquals("Juan Dela Cruz", res.attendeeName());
    }

    @Test
    void rejectsDuplicateEmailRegardlessOfLetterCase() {
        Event event = sampleEvent(1L, 30, LocalDate.of(2026, 11, 23), EventStatus.PUBLISHED);
        when(eventRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(event));
        when(registrationRepository.existsByEventIdAndEmailIgnoreCaseAndStatusIn(
                eq(1L), eq("juan.delacruz@example.com"), anyCollection())).thenReturn(true);

        ApiException ex = assertThrows(
                ApiException.class,
                () -> registrationService.register(
                        1L, new RegisterRequest("Juan Dela Cruz", "JUAN.DELACRUZ@EXAMPLE.COM", "09171234567")));

        assertEquals(HttpStatus.CONFLICT, ex.getStatus());
        assertEquals("This email is already registered for this event.", ex.getMessage());
    }

    @Test
    void allowsSameEmailOnDifferentEvent() {
        Event otherEvent = sampleEvent(2L, 50, LocalDate.of(2026, 11, 30), EventStatus.PUBLISHED);
        when(eventRepository.findByIdForUpdate(2L)).thenReturn(Optional.of(otherEvent));
        when(registrationRepository.existsByEventIdAndEmailIgnoreCaseAndStatusIn(
                eq(2L), eq("juan.delacruz@example.com"), anyCollection())).thenReturn(false);
        when(registrationRepository.countByEventIdAndStatusIn(eq(2L), anyCollection())).thenReturn(0L);
        when(registrationRepository.existsByTicketCode(any())).thenReturn(false);
        when(registrationRepository.saveAndFlush(any(Registration.class))).thenAnswer(inv -> {
            Registration r = inv.getArgument(0);
            ReflectionTestUtils.setField(r, "id", 102L);
            return r;
        });

        TicketResponse response = registrationService.register(
                2L, new RegisterRequest("Juan Dela Cruz", "juan.delacruz@example.com", "09171234567"));

        assertEquals(2L, response.eventId());
    }

    @Test
    void rejectsRegistrationForPastEvent() {
        Event pastEvent = sampleEvent(4L, 40, LocalDate.of(2026, 11, 16), EventStatus.PUBLISHED);
        when(eventRepository.findByIdForUpdate(4L)).thenReturn(Optional.of(pastEvent));

        ApiException ex = assertThrows(
                ApiException.class,
                () -> registrationService.register(
                        4L, new RegisterRequest("Juan Dela Cruz", "juan.delacruz@example.com", "09171234567")));

        assertEquals(HttpStatus.CONFLICT, ex.getStatus());
        assertEquals("This event has already ended.", ex.getMessage());
    }

    @Test
    void looksUpTicketWithTrimmedLowercaseCodeAndMixedCaseEmail() {
        Event event = sampleEvent(1L, 30, LocalDate.of(2026, 11, 23), EventStatus.PUBLISHED);
        Registration reg = new Registration(
                event,
                "Juan Dela Cruz",
                "juan.delacruz@example.com",
                "09171234567",
                "CDM-7K3P9Q",
                RegistrationStatus.CONFIRMED,
                Instant.now(fixedClock));
        ReflectionTestUtils.setField(reg, "id", 101L);

        when(registrationRepository.findByTicketCodeAndEmailIgnoreCase("CDM-7K3P9Q", "juan.delacruz@example.com"))
                .thenReturn(Optional.of(reg));

        TicketResponse response = registrationService.lookupTicket(
                new TicketLookupRequest("  cdm-7k3p9q  ", "  JUAN.DELACRUZ@EXAMPLE.COM "));

        assertEquals(101L, response.registrationId());
        assertEquals("CDM-7K3P9Q", response.ticketCode());
        assertEquals("Juan Dela Cruz", response.attendeeName());
        assertEquals("Cebu Dev Meetup 2026", response.eventTitle());
    }

    @Test
    void returnsIdenticalNotFoundForWrongCodeAndWrongEmail() {
        when(registrationRepository.findByTicketCodeAndEmailIgnoreCase(any(), any()))
                .thenReturn(Optional.empty());

        ApiException wrongCode = assertThrows(
                ApiException.class,
                () -> registrationService.lookupTicket(
                        new TicketLookupRequest("CDM-ZZZZZZ", "juan.delacruz@example.com")));
        ApiException wrongEmail = assertThrows(
                ApiException.class,
                () -> registrationService.lookupTicket(
                        new TicketLookupRequest("CDM-7K3P9Q", "other@example.com")));

        assertEquals(HttpStatus.NOT_FOUND, wrongCode.getStatus());
        assertEquals(HttpStatus.NOT_FOUND, wrongEmail.getStatus());
        assertEquals("Ticket not found", wrongCode.getMessage());
        assertEquals(wrongCode.getMessage(), wrongEmail.getMessage());
    }

    @Test
    void returnsNotFoundForSqlInjectionProbe() {
        when(registrationRepository.findByTicketCodeAndEmailIgnoreCase("' OR '1'='1", "juan.delacruz@example.com"))
                .thenReturn(Optional.empty());

        ApiException ex = assertThrows(
                ApiException.class,
                () -> registrationService.lookupTicket(
                        new TicketLookupRequest("' OR '1'='1", "juan.delacruz@example.com")));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus());
        assertEquals("Ticket not found", ex.getMessage());
    }

    @Test
    void listsEventAttendeesWithExactTotals() {
        Event event = sampleEvent(1L, 30, LocalDate.of(2026, 11, 23), EventStatus.PUBLISHED);
        Registration r1 = new Registration(
                event, "Juan Dela Cruz", "juan@example.com", "09171234567",
                "CDM-BES2VQ", RegistrationStatus.CHECKED_IN, Instant.now(fixedClock));
        ReflectionTestUtils.setField(r1, "id", 10L);
        ReflectionTestUtils.setField(r1, "checkedInAt", Instant.now(fixedClock));

        Registration r2 = new Registration(
                event, "Ana Reyes", "ana@example.com", "09171000001",
                "CDM-ANA111", RegistrationStatus.CONFIRMED, Instant.now(fixedClock));
        ReflectionTestUtils.setField(r2, "id", 11L);

        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));
        when(registrationRepository.countByEventIdAndStatusIn(eq(1L), anyCollection())).thenReturn(2L);
        when(registrationRepository.countByEventIdAndStatus(1L, RegistrationStatus.CHECKED_IN)).thenReturn(1L);
        when(registrationRepository.findAllByEventIdOrderByRegisteredAtDesc(1L)).thenReturn(List.of(r1, r2));

        AttendeeListResponse res = registrationService.listAttendeesForEvent(1L, null);

        assertEquals(1L, res.eventId());
        assertEquals(30, res.capacity());
        assertEquals(2L, res.registeredCount());
        assertEquals(1L, res.checkedInCount());
        assertEquals(2, res.attendees().size());
        assertEquals("Juan Dela Cruz", res.attendees().get(0).fullName());
    }

    @Test
    void searchesEventAttendeesByNameOrTicketCode() {
        Event event = sampleEvent(1L, 30, LocalDate.of(2026, 11, 23), EventStatus.PUBLISHED);
        Registration r1 = new Registration(
                event, "Juan Dela Cruz", "juan@example.com", "09171234567",
                "CDM-BES2VQ", RegistrationStatus.CONFIRMED, Instant.now(fixedClock));
        ReflectionTestUtils.setField(r1, "id", 10L);

        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));
        when(registrationRepository.countByEventIdAndStatusIn(eq(1L), anyCollection())).thenReturn(5L);
        when(registrationRepository.countByEventIdAndStatus(1L, RegistrationStatus.CHECKED_IN)).thenReturn(2L);
        when(registrationRepository.searchByEventIdAndNameOrTicketCode(1L, "%cdm-bes2vq%"))
                .thenReturn(List.of(r1));

        AttendeeListResponse res = registrationService.listAttendeesForEvent(1L, "  CDM-BES2VQ ");

        assertEquals(5L, res.registeredCount());
        assertEquals(2L, res.checkedInCount());
        assertEquals(1, res.attendees().size());
        assertEquals("CDM-BES2VQ", res.attendees().get(0).ticketCode());
    }

    @Test
    void attendeeCancelCancelsConfirmedPassAndLogsAudit() {
        Event event = sampleEvent(1L, 30, LocalDate.of(2026, 11, 23), EventStatus.PUBLISHED);
        Registration reg = new Registration(
                event, "Alice", "alice@example.com", "09171234567",
                "CDM-CAN001", RegistrationStatus.CONFIRMED, Instant.now(fixedClock));
        ReflectionTestUtils.setField(reg, "id", 301L);

        when(registrationRepository.findByTicketCodeAndEmailIgnoreCase("CDM-CAN001", "alice@example.com"))
                .thenReturn(Optional.of(reg));
        when(registrationRepository.save(any(Registration.class))).thenAnswer(inv -> inv.getArgument(0));

        TicketResponse res = registrationService.attendeeCancel(
                new TicketLookupRequest(" cdm-can001 ", " ALICE@EXAMPLE.COM "));

        assertEquals(RegistrationStatus.CANCELLED, res.status());
        verify(auditLogRepository).save(any());
    }

    @Test
    void rejectsCancellingCheckedInRegistrationForAttendeeAndStaff() {
        Event event = sampleEvent(1L, 30, LocalDate.of(2026, 11, 23), EventStatus.PUBLISHED);
        Registration reg = new Registration(
                event, "Bob", "bob@example.com", "09171234567",
                "CDM-CHK001", RegistrationStatus.CHECKED_IN, Instant.now(fixedClock));
        ReflectionTestUtils.setField(reg, "id", 302L);

        when(registrationRepository.findByTicketCodeAndEmailIgnoreCase("CDM-CHK001", "bob@example.com"))
                .thenReturn(Optional.of(reg));
        when(registrationRepository.findById(302L)).thenReturn(Optional.of(reg));

        ApiException attendeeEx = assertThrows(
                ApiException.class,
                () -> registrationService.attendeeCancel(
                        new TicketLookupRequest("CDM-CHK001", "bob@example.com")));
        ApiException staffEx = assertThrows(
                ApiException.class,
                () -> registrationService.staffCancel(302L, 1L));

        assertEquals(HttpStatus.BAD_REQUEST, attendeeEx.getStatus());
        assertEquals(HttpStatus.BAD_REQUEST, staffEx.getStatus());
    }

    @Test
    void promotesFirstWaitlistAttendeeAndRecompactsRemainingQueue() {
        Event event = sampleEvent(3L, 5, LocalDate.of(2026, 11, 26), EventStatus.PUBLISHED);
        Registration first = new Registration(
                event, "Wait One", "wait1@example.com", "09171110001",
                "CSP-WAIT01", RegistrationStatus.WAITLISTED, 1, Instant.now(fixedClock));
        ReflectionTestUtils.setField(first, "id", 401L);

        Registration second = new Registration(
                event, "Wait Two", "wait2@example.com", "09171110002",
                "CSP-WAIT02", RegistrationStatus.WAITLISTED, 2, Instant.now(fixedClock));
        ReflectionTestUtils.setField(second, "id", 402L);

        when(eventRepository.findByIdForUpdate(3L)).thenReturn(Optional.of(event));
        when(registrationRepository.countByEventIdAndStatusIn(eq(3L), anyCollection())).thenReturn(4L);
        when(registrationRepository.findFirstWaitlistByEventId(3L)).thenReturn(Optional.of(first));
        when(registrationRepository.save(any(Registration.class))).thenAnswer(inv -> inv.getArgument(0));
        when(registrationRepository.findWaitlistByEventIdOrderByPosition(3L)).thenReturn(List.of(second));

        TicketResponse promoted = registrationService.promoteFirstWaitlist(3L, 1L);

        assertEquals(RegistrationStatus.CONFIRMED, promoted.status());
        assertEquals(null, promoted.waitlistPosition());
        assertEquals(1, second.getWaitlistPosition());
        verify(auditLogRepository).save(any());
    }
}
