package com.nicojohn.eventreg.event;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.Mockito.mock;
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
import com.nicojohn.eventreg.event.dto.EventResponse;
import com.nicojohn.eventreg.registration.RegistrationRepository;

class EventServiceTest {

    private EventRepository eventRepository;
    private RegistrationRepository registrationRepository;
    private Clock fixedClock;
    private EventService eventService;

    @BeforeEach
    void setUp() {
        eventRepository = mock(EventRepository.class);
        registrationRepository = mock(RegistrationRepository.class);
        LocalDate today = LocalDate.of(2026, 11, 23);
        fixedClock = Clock.fixed(ManilaTime.atManilaTime(today, 10, 0), ManilaTime.ZONE);
        eventService = new EventService(eventRepository, registrationRepository, fixedClock);
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
}
