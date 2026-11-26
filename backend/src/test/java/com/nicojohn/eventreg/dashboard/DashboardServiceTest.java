package com.nicojohn.eventreg.dashboard;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;

import com.nicojohn.eventreg.common.exception.ApiException;
import com.nicojohn.eventreg.common.util.ManilaTime;
import com.nicojohn.eventreg.dashboard.dto.EventMetricsDto;
import com.nicojohn.eventreg.event.Event;
import com.nicojohn.eventreg.event.EventRepository;
import com.nicojohn.eventreg.event.EventStatus;
import com.nicojohn.eventreg.registration.Registration;
import com.nicojohn.eventreg.registration.RegistrationRepository;
import com.nicojohn.eventreg.registration.RegistrationStatus;

class DashboardServiceTest {

    private EventRepository eventRepository;
    private RegistrationRepository registrationRepository;
    private Clock fixedClock;
    private DashboardService dashboardService;

    @BeforeEach
    void setUp() {
        eventRepository = mock(EventRepository.class);
        registrationRepository = mock(RegistrationRepository.class);
        LocalDate today = LocalDate.of(2026, 11, 26);
        fixedClock = Clock.fixed(ManilaTime.atManilaTime(today, 12, 0), ManilaTime.ZONE);
        dashboardService = new DashboardService(eventRepository, registrationRepository, fixedClock);
    }

    @Test
    void computesRealMetricsAndRevealsNoShowsOnlyAfterEventStarts() {
        LocalDate today = LocalDate.of(2026, 11, 26);
        Event startedEvent = new Event(
                "Cebu Dev Meetup", "Desc", "Ayala",
                ManilaTime.atManilaTime(today, 8, 0),
                ManilaTime.atManilaTime(today, 22, 0),
                30, EventStatus.PUBLISHED, "CDM", Instant.now(fixedClock));
        ReflectionTestUtils.setField(startedEvent, "id", 1L);

        Event futureEvent = new Event(
                "Future Workshop", "Desc", "IT Park",
                ManilaTime.atManilaTime(today.plusDays(2), 13, 0),
                ManilaTime.atManilaTime(today.plusDays(2), 17, 0),
                50, EventStatus.PUBLISHED, "FWS", Instant.now(fixedClock));
        ReflectionTestUtils.setField(futureEvent, "id", 2L);

        when(eventRepository.findAll(Sort.by(Sort.Direction.DESC, "startsAt")))
                .thenReturn(List.of(futureEvent, startedEvent));

        when(registrationRepository.countByEventIdAndStatus(1L, RegistrationStatus.CONFIRMED)).thenReturn(4L);
        when(registrationRepository.countByEventIdAndStatus(1L, RegistrationStatus.WAITLISTED)).thenReturn(2L);
        when(registrationRepository.countByEventIdAndStatus(1L, RegistrationStatus.CANCELLED)).thenReturn(1L);
        when(registrationRepository.countByEventIdAndStatus(1L, RegistrationStatus.CHECKED_IN)).thenReturn(6L);

        when(registrationRepository.countByEventIdAndStatus(2L, RegistrationStatus.CONFIRMED)).thenReturn(5L);
        when(registrationRepository.countByEventIdAndStatus(2L, RegistrationStatus.WAITLISTED)).thenReturn(0L);
        when(registrationRepository.countByEventIdAndStatus(2L, RegistrationStatus.CANCELLED)).thenReturn(0L);
        when(registrationRepository.countByEventIdAndStatus(2L, RegistrationStatus.CHECKED_IN)).thenReturn(0L);

        List<EventMetricsDto> metrics = dashboardService.getDashboardMetrics();
        assertEquals(2, metrics.size());

        EventMetricsDto future = metrics.get(0);
        assertNull(future.noShowCount());

        EventMetricsDto started = metrics.get(1);
        assertEquals(4L, started.noShowCount());
        assertEquals(6L, started.checkedInCount());
        assertEquals(2L, started.waitlistCount());
        assertEquals(1L, started.cancelledCount());
    }

    @Test
    void exportRosterCsvIncludesUtf8BomAndPreservesLeadingZeroMobile() {
        LocalDate today = LocalDate.of(2026, 11, 26);
        Event event = new Event(
                "Cebu Dev Meetup", "Desc", "Ayala",
                ManilaTime.atManilaTime(today, 8, 0),
                ManilaTime.atManilaTime(today, 22, 0),
                30, EventStatus.PUBLISHED, "CDM", Instant.now(fixedClock));
        ReflectionTestUtils.setField(event, "id", 1L);

        Registration reg = new Registration(
                event,
                "Juan Peña",
                "juan.pena@example.com",
                "09171234567",
                "CDM-AB12CD",
                RegistrationStatus.CONFIRMED,
                Instant.now(fixedClock));

        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));
        when(registrationRepository.findAllByEventIdOrderByRegisteredAtDesc(1L)).thenReturn(List.of(reg));

        String csv = dashboardService.exportRosterCsv(1L);
        byte[] utf8Bytes = csv.getBytes(StandardCharsets.UTF_8);

        assertEquals((byte) 0xEF, utf8Bytes[0]);
        assertEquals((byte) 0xBB, utf8Bytes[1]);
        assertEquals((byte) 0xBF, utf8Bytes[2]);
        assertTrue(csv.startsWith("\uFEFFTicket Code,Full Name,Email,Mobile,Status"));
        assertTrue(csv.contains("\"Juan Peña\""));
        assertTrue(csv.contains(",=\"09171234567\","));
    }

    @Test
    void exportRosterCsvThrowsNotFoundWhenEventMissing() {
        when(eventRepository.findById(999L)).thenReturn(Optional.empty());
        ApiException ex = assertThrows(ApiException.class, () -> dashboardService.exportRosterCsv(999L));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus());
    }
}

