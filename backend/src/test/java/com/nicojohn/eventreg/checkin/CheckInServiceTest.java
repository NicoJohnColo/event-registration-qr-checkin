package com.nicojohn.eventreg.checkin;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import com.nicojohn.eventreg.checkin.dto.CheckInRequest;
import com.nicojohn.eventreg.checkin.dto.CheckInResponse;
import com.nicojohn.eventreg.common.security.StaffPrincipal;
import com.nicojohn.eventreg.common.util.ManilaTime;
import com.nicojohn.eventreg.event.Event;
import com.nicojohn.eventreg.event.EventRepository;
import com.nicojohn.eventreg.event.EventStatus;
import com.nicojohn.eventreg.registration.Registration;
import com.nicojohn.eventreg.registration.RegistrationRepository;
import com.nicojohn.eventreg.registration.RegistrationStatus;
import com.nicojohn.eventreg.staff.Role;
import com.nicojohn.eventreg.staff.StaffRepository;
import com.nicojohn.eventreg.staff.StaffUser;

class CheckInServiceTest {

    private EventRepository eventRepository;
    private RegistrationRepository registrationRepository;
    private StaffRepository staffRepository;
    private Clock fixedClock;
    private CheckInService checkInService;

    private final LocalDate today = LocalDate.of(2026, 11, 23);
    private final StaffPrincipal organizer = new StaffPrincipal(1L, "organizer", "Demo Organizer", Role.ORGANIZER);

    @BeforeEach
    void setUp() {
        eventRepository = mock(EventRepository.class);
        registrationRepository = mock(RegistrationRepository.class);
        staffRepository = mock(StaffRepository.class);
        fixedClock = Clock.fixed(ManilaTime.atManilaTime(today, 9, 15), ManilaTime.ZONE);
        checkInService = new CheckInService(eventRepository, registrationRepository, staffRepository, fixedClock);
    }

    private Event sampleEvent(Long id, LocalDate day) {
        Event event = new Event(
                "Cebu Dev Meetup 2026", "Desc", "Ayala Center Cebu",
                ManilaTime.atManilaTime(day, 8, 0),
                ManilaTime.atManilaTime(day, 22, 0),
                30, EventStatus.PUBLISHED, "CDM", Instant.now(fixedClock));
        ReflectionTestUtils.setField(event, "id", id);
        return event;
    }

    private Registration sampleReg(Event event, String code, RegistrationStatus status, Instant checkedInAt) {
        Registration reg = new Registration(
                event, "Juan Dela Cruz", "juan@example.com", "09171234567",
                code, status, Instant.now(fixedClock));
        ReflectionTestUtils.setField(reg, "id", 10L);
        ReflectionTestUtils.setField(reg, "checkedInAt", checkedInAt);
        return reg;
    }

    @Test
    void checksInConfirmedTicketOnEventDay() {
        Event s1 = sampleEvent(1L, today);
        Registration reg = sampleReg(s1, "CDM-7K3P9Q", RegistrationStatus.CONFIRMED, null);
        StaffUser staffRef = mock(StaffUser.class);

        when(eventRepository.findById(1L)).thenReturn(Optional.of(s1));
        when(registrationRepository.countByEventIdAndStatusIn(eq(1L), anyCollection())).thenReturn(4L);
        when(registrationRepository.countByEventIdAndStatus(1L, RegistrationStatus.CHECKED_IN)).thenReturn(0L);
        when(registrationRepository.findByEventIdAndTicketCode(1L, "CDM-7K3P9Q")).thenReturn(Optional.of(reg));
        when(staffRepository.getReferenceById(1L)).thenReturn(staffRef);
        when(registrationRepository.markCheckedInIfConfirmed(10L, Instant.now(fixedClock), staffRef)).thenReturn(1);

        CheckInResponse res = checkInService.checkIn(new CheckInRequest(1L, "  cdm-7k3p9q  "), organizer);

        assertEquals(CheckInOutcome.CHECKED_IN, res.outcome());
        assertEquals("Checked in", res.message());
        assertEquals("Juan Dela Cruz", res.attendeeName());
        assertEquals("Demo Organizer", res.checkedInByName());
        assertEquals(Instant.now(fixedClock), res.checkedInAt());
        assertEquals(1L, res.checkedInCount());
        assertEquals(4L, res.registeredCount());
    }

    @Test
    void returnsAlreadyCheckedInWithFirstTimeOnSecondScan() {
        Event s1 = sampleEvent(1L, today);
        Instant firstScanTime = ManilaTime.atManilaTime(today, 8, 14);
        Registration reg = sampleReg(s1, "CDM-7K3P9Q", RegistrationStatus.CHECKED_IN, firstScanTime);

        when(eventRepository.findById(1L)).thenReturn(Optional.of(s1));
        when(registrationRepository.countByEventIdAndStatusIn(eq(1L), anyCollection())).thenReturn(4L);
        when(registrationRepository.countByEventIdAndStatus(1L, RegistrationStatus.CHECKED_IN)).thenReturn(1L);
        when(registrationRepository.findByEventIdAndTicketCode(1L, "CDM-7K3P9Q")).thenReturn(Optional.of(reg));

        CheckInResponse res = checkInService.checkIn(new CheckInRequest(1L, "CDM-7K3P9Q"), organizer);

        assertEquals(CheckInOutcome.ALREADY_CHECKED_IN, res.outcome());
        assertEquals("Already checked in", res.message());
        assertEquals("Juan Dela Cruz", res.attendeeName());
        assertEquals(firstScanTime, res.checkedInAt());
        verify(registrationRepository, never()).markCheckedInIfConfirmed(any(), any(), any());
    }

    @Test
    void returnsInvalidForUnknownOrOtherEventTicket() {
        Event s1 = sampleEvent(1L, today);
        when(eventRepository.findById(1L)).thenReturn(Optional.of(s1));
        when(registrationRepository.countByEventIdAndStatusIn(eq(1L), anyCollection())).thenReturn(4L);
        when(registrationRepository.countByEventIdAndStatus(1L, RegistrationStatus.CHECKED_IN)).thenReturn(1L);
        when(registrationRepository.findByEventIdAndTicketCode(1L, "CDM-ZZZZZZ")).thenReturn(Optional.empty());

        CheckInResponse res = checkInService.checkIn(new CheckInRequest(1L, "CDM-ZZZZZZ"), organizer);

        assertEquals(CheckInOutcome.INVALID, res.outcome());
        assertEquals("Invalid ticket", res.message());
        assertNull(res.attendeeName());
    }

    @Test
    void refusesCheckInOnWrongEventDay() {
        Event s2 = sampleEvent(2L, today.plusDays(7));
        Registration reg = sampleReg(s2, "CWD-123456", RegistrationStatus.CONFIRMED, null);

        when(eventRepository.findById(2L)).thenReturn(Optional.of(s2));
        when(registrationRepository.countByEventIdAndStatusIn(eq(2L), anyCollection())).thenReturn(1L);
        when(registrationRepository.countByEventIdAndStatus(2L, RegistrationStatus.CHECKED_IN)).thenReturn(0L);
        when(registrationRepository.findByEventIdAndTicketCode(2L, "CWD-123456")).thenReturn(Optional.of(reg));

        CheckInResponse res = checkInService.checkIn(new CheckInRequest(2L, "CWD-123456"), organizer);

        assertEquals(CheckInOutcome.WRONG_DAY, res.outcome());
        assertEquals("Juan Dela Cruz", res.attendeeName());
        verify(registrationRepository, never()).markCheckedInIfConfirmed(any(), any(), any());
    }

    @Test
    void returnsAlreadyCheckedInWhenConcurrentScanWinsRace() {
        Event s1 = sampleEvent(1L, today);
        Registration initial = sampleReg(s1, "CDM-7K3P9Q", RegistrationStatus.CONFIRMED, null);
        Instant winnerTime = Instant.now(fixedClock).minusSeconds(1);
        Registration winner = sampleReg(s1, "CDM-7K3P9Q", RegistrationStatus.CHECKED_IN, winnerTime);
        StaffUser staffRef = mock(StaffUser.class);

        when(eventRepository.findById(1L)).thenReturn(Optional.of(s1));
        when(registrationRepository.countByEventIdAndStatusIn(eq(1L), anyCollection())).thenReturn(4L);
        when(registrationRepository.countByEventIdAndStatus(1L, RegistrationStatus.CHECKED_IN))
                .thenReturn(0L, 1L);
        when(registrationRepository.findByEventIdAndTicketCode(1L, "CDM-7K3P9Q"))
                .thenReturn(Optional.of(initial), Optional.of(winner));
        when(staffRepository.getReferenceById(1L)).thenReturn(staffRef);
        when(registrationRepository.markCheckedInIfConfirmed(10L, Instant.now(fixedClock), staffRef)).thenReturn(0);

        CheckInResponse res = checkInService.checkIn(new CheckInRequest(1L, "CDM-7K3P9Q"), organizer);

        assertEquals(CheckInOutcome.ALREADY_CHECKED_IN, res.outcome());
        assertEquals(winnerTime, res.checkedInAt());
        assertEquals(1L, res.checkedInCount());
    }
}
