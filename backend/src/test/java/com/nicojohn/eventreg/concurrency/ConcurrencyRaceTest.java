package com.nicojohn.eventreg.concurrency;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.ReentrantLock;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import com.nicojohn.eventreg.audit.AuditLogRepository;
import com.nicojohn.eventreg.checkin.CheckInOutcome;
import com.nicojohn.eventreg.checkin.CheckInService;
import com.nicojohn.eventreg.checkin.dto.CheckInRequest;
import com.nicojohn.eventreg.checkin.dto.CheckInResponse;
import com.nicojohn.eventreg.common.security.QrTokenService;
import com.nicojohn.eventreg.common.security.StaffPrincipal;
import com.nicojohn.eventreg.common.util.ManilaTime;
import com.nicojohn.eventreg.event.Event;
import com.nicojohn.eventreg.event.EventRepository;
import com.nicojohn.eventreg.event.EventStatus;
import com.nicojohn.eventreg.registration.Registration;
import com.nicojohn.eventreg.registration.RegistrationRepository;
import com.nicojohn.eventreg.registration.RegistrationService;
import com.nicojohn.eventreg.registration.RegistrationStatus;
import com.nicojohn.eventreg.registration.TicketCodeGenerator;
import com.nicojohn.eventreg.registration.dto.RegisterRequest;
import com.nicojohn.eventreg.registration.dto.TicketResponse;
import com.nicojohn.eventreg.staff.Role;
import com.nicojohn.eventreg.staff.StaffRepository;
import com.nicojohn.eventreg.staff.StaffUser;

/**
 * Verifies Item 13 concurrency guarantees under simultaneous threads:
 * 1) Last-spot registration serializes via row lock (1 CONFIRMED + 1 WAITLISTED #1).
 * 2) Simultaneous door check-in succeeds once via conditional update (1 CHECKED_IN + 1 ALREADY_CHECKED_IN).
 */
class ConcurrencyRaceTest {

    @Test
    void twoSimultaneousLastSpotRegistrationsYieldOneConfirmedAndOneWaitlisted() throws Exception {
        EventRepository eventRepository = mock(EventRepository.class);
        RegistrationRepository registrationRepository = mock(RegistrationRepository.class);
        AuditLogRepository auditLogRepository = mock(AuditLogRepository.class);
        StaffRepository staffRepository = mock(StaffRepository.class);

        LocalDate today = LocalDate.of(2026, 11, 26);
        Clock fixedClock = Clock.fixed(ManilaTime.atManilaTime(today, 10, 0), ManilaTime.ZONE);
        RegistrationService registrationService = new RegistrationService(
                eventRepository, registrationRepository, new TicketCodeGenerator(),
                auditLogRepository, staffRepository,
                new QrTokenService("eventreg-race-test-qr-secret-at-least-32chars"), fixedClock);

        Event event = new Event(
                "Pitch Night", "Desc", "Cebu",
                ManilaTime.atManilaTime(today.plusDays(1), 18, 0),
                ManilaTime.atManilaTime(today.plusDays(1), 21, 0),
                1, EventStatus.PUBLISHED, "CSP", Instant.now(fixedClock));
        ReflectionTestUtils.setField(event, "id", 1L);

        // Simulate PostgreSQL SELECT ... FOR UPDATE row lock + transactional commit state
        ReentrantLock dbRowLock = new ReentrantLock();
        AtomicInteger confirmedCount = new AtomicInteger(0);
        AtomicInteger maxWaitlist = new AtomicInteger(0);

        when(eventRepository.findByIdForUpdate(1L)).thenAnswer(inv -> {
            dbRowLock.lock();
            return Optional.of(event);
        });
        when(registrationRepository.existsByEventIdAndEmailIgnoreCaseAndStatusIn(eq(1L), any(), anyCollection()))
                .thenReturn(false);
        when(registrationRepository.existsByTicketCode(any())).thenReturn(false);
        when(registrationRepository.countByEventIdAndStatusIn(eq(1L), anyCollection()))
                .thenAnswer(inv -> (long) confirmedCount.get());
        when(registrationRepository.findMaxWaitlistPosition(1L))
                .thenAnswer(inv -> maxWaitlist.get());
        when(registrationRepository.saveAndFlush(any(Registration.class))).thenAnswer(inv -> {
            Registration reg = inv.getArgument(0);
            if (reg.getStatus() == RegistrationStatus.CONFIRMED) {
                confirmedCount.incrementAndGet();
            } else if (reg.getStatus() == RegistrationStatus.WAITLISTED && reg.getWaitlistPosition() != null) {
                maxWaitlist.set(reg.getWaitlistPosition());
            }
            dbRowLock.unlock();
            return reg;
        });

        CountDownLatch ready = new CountDownLatch(2);
        CountDownLatch start = new CountDownLatch(1);
        ExecutorService pool = Executors.newFixedThreadPool(2);

        Callable<TicketResponse> regOne = () -> {
            ready.countDown();
            start.await();
            return registrationService.register(1L, new RegisterRequest("User One", "u1@example.com", "09170000001"));
        };
        Callable<TicketResponse> regTwo = () -> {
            ready.countDown();
            start.await();
            return registrationService.register(1L, new RegisterRequest("User Two", "u2@example.com", "09170000002"));
        };

        Future<TicketResponse> f1 = pool.submit(regOne);
        Future<TicketResponse> f2 = pool.submit(regTwo);
        ready.await();
        start.countDown();

        List<TicketResponse> results = List.of(f1.get(), f2.get());
        pool.shutdown();

        long confirmed = results.stream().filter(r -> r.status() == RegistrationStatus.CONFIRMED).count();
        long waitlisted = results.stream().filter(r -> r.status() == RegistrationStatus.WAITLISTED).count();
        assertEquals(1L, confirmed);
        assertEquals(1L, waitlisted);
        assertEquals(1, results.stream()
                .filter(r -> r.status() == RegistrationStatus.WAITLISTED)
                .findFirst().orElseThrow().waitlistPosition());
    }

    @Test
    void twoSimultaneousCheckInsYieldOneCheckedInAndOneAlreadyCheckedIn() throws Exception {
        EventRepository eventRepository = mock(EventRepository.class);
        RegistrationRepository registrationRepository = mock(RegistrationRepository.class);
        StaffRepository staffRepository = mock(StaffRepository.class);
        AuditLogRepository auditLogRepository = mock(AuditLogRepository.class);

        LocalDate today = LocalDate.of(2026, 11, 26);
        Instant now = ManilaTime.atManilaTime(today, 10, 0);
        Clock fixedClock = Clock.fixed(now, ManilaTime.ZONE);
        CheckInService checkInService = new CheckInService(
                eventRepository, registrationRepository, staffRepository, auditLogRepository,
                new QrTokenService("eventreg-race-test-qr-secret-at-least-32chars"), fixedClock);

        Event todayEvent = new Event(
                "Cebu Dev Meetup", "Desc", "Ayala",
                ManilaTime.atManilaTime(today, 8, 0),
                ManilaTime.atManilaTime(today, 23, 59),
                30, EventStatus.PUBLISHED, "CDM", now);
        ReflectionTestUtils.setField(todayEvent, "id", 1L);

        StaffUser staffUser = new StaffUser("Demo Door Staff", "doorstaff", "hash", Role.DOOR_STAFF);
        ReflectionTestUtils.setField(staffUser, "id", 2L);

        Registration initialReg = new Registration(
                todayEvent, "Ana Reyes", "ana@example.com", "09171000001",
                "CDM-RACE01", RegistrationStatus.CONFIRMED, now);
        ReflectionTestUtils.setField(initialReg, "id", 55L);

        Registration checkedReg = new Registration(
                todayEvent, "Ana Reyes", "ana@example.com", "09171000001",
                "CDM-RACE01", RegistrationStatus.CHECKED_IN, now);
        ReflectionTestUtils.setField(checkedReg, "id", 55L);
        ReflectionTestUtils.setField(checkedReg, "checkedInAt", now);
        ReflectionTestUtils.setField(checkedReg, "checkedInBy", staffUser);

        AtomicBoolean wonAtomicUpdate = new AtomicBoolean(false);

        when(eventRepository.findById(1L)).thenReturn(Optional.of(todayEvent));
        when(staffRepository.getReferenceById(2L)).thenReturn(staffUser);
        when(registrationRepository.countByEventIdAndStatusIn(eq(1L), anyCollection())).thenReturn(1L);
        when(registrationRepository.countByEventIdAndStatus(1L, RegistrationStatus.CHECKED_IN))
                .thenAnswer(inv -> wonAtomicUpdate.get() ? 1L : 0L);
        when(registrationRepository.findByEventIdAndTicketCode(1L, "CDM-RACE01"))
                .thenAnswer(inv -> Optional.of(wonAtomicUpdate.get() ? checkedReg : initialReg));
        when(registrationRepository.markCheckedInIfConfirmed(eq(55L), any(Instant.class), eq(staffUser)))
                .thenAnswer(inv -> wonAtomicUpdate.compareAndSet(false, true) ? 1 : 0);

        CountDownLatch ready = new CountDownLatch(2);
        CountDownLatch start = new CountDownLatch(1);
        ExecutorService pool = Executors.newFixedThreadPool(2);
        StaffPrincipal principal = new StaffPrincipal(2L, "doorstaff", "Demo Door Staff", Role.DOOR_STAFF);

        Callable<CheckInResponse> scanTask = () -> {
            ready.countDown();
            start.await();
            return checkInService.checkIn(new CheckInRequest(1L, "CDM-RACE01"), principal);
        };

        Future<CheckInResponse> f1 = pool.submit(scanTask);
        Future<CheckInResponse> f2 = pool.submit(scanTask);
        ready.await();
        start.countDown();

        List<CheckInResponse> results = List.of(f1.get(), f2.get());
        pool.shutdown();

        long checkedIn = results.stream().filter(r -> r.outcome() == CheckInOutcome.CHECKED_IN).count();
        long already = results.stream().filter(r -> r.outcome() == CheckInOutcome.ALREADY_CHECKED_IN).count();
        assertEquals(1L, checkedIn);
        assertEquals(1L, already);
    }
}
