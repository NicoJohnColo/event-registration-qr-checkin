package com.nicojohn.eventreg.event;

import java.time.Clock;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nicojohn.eventreg.common.exception.ApiException;
import com.nicojohn.eventreg.common.util.ManilaTime;
import com.nicojohn.eventreg.event.dto.EventResponse;
import com.nicojohn.eventreg.registration.RegistrationRepository;
import com.nicojohn.eventreg.registration.RegistrationStatus;

@Service
public class EventService {

    private static final Set<RegistrationStatus> ACTIVE_CAPACITY_STATUSES =
            EnumSet.of(RegistrationStatus.CONFIRMED, RegistrationStatus.CHECKED_IN);

    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final Clock clock;

    public EventService(
            EventRepository eventRepository,
            RegistrationRepository registrationRepository,
            Clock clock) {
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<EventResponse> listPublishedEvents() {
        List<Event> events = eventRepository.findByStatusOrderByStartsAtAsc(EventStatus.PUBLISHED);
        if (events.isEmpty()) {
            return List.of();
        }

        List<Long> ids = events.stream().map(Event::getId).toList();
        Map<Long, Long> countsByEventId = registrationRepository
                .countByEventIdsAndStatusIn(ids, ACTIVE_CAPACITY_STATUSES)
                .stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> (Long) row[1]));

        return events.stream()
                .map(event -> EventResponse.from(
                        event,
                        countsByEventId.getOrDefault(event.getId(), 0L),
                        ManilaTime.hasEnded(event.getEndsAt(), clock)))
                .toList();
    }

    @Transactional(readOnly = true)
    public EventResponse getPublishedEvent(Long id) {
        Event event = eventRepository.findById(id)
                .filter(e -> e.getStatus() == EventStatus.PUBLISHED)
                .orElseThrow(() -> ApiException.notFound("Event not found."));

        long activeCount = registrationRepository.countByEventIdAndStatusIn(id, ACTIVE_CAPACITY_STATUSES);
        boolean ended = ManilaTime.hasEnded(event.getEndsAt(), clock);
        return EventResponse.from(event, activeCount, ended);
    }
}
