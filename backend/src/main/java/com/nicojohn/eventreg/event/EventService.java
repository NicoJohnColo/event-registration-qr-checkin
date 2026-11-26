package com.nicojohn.eventreg.event;

import java.time.Clock;
import java.time.Instant;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nicojohn.eventreg.audit.AuditLog;
import com.nicojohn.eventreg.audit.AuditLogRepository;
import com.nicojohn.eventreg.common.exception.ApiException;
import com.nicojohn.eventreg.common.util.ManilaTime;
import com.nicojohn.eventreg.event.dto.EventResponse;
import com.nicojohn.eventreg.event.dto.EventUpsertRequest;
import com.nicojohn.eventreg.event.dto.StaffEventResponse;
import com.nicojohn.eventreg.registration.RegistrationRepository;
import com.nicojohn.eventreg.registration.RegistrationStatus;
import com.nicojohn.eventreg.staff.StaffRepository;
import com.nicojohn.eventreg.staff.StaffUser;

@Service
public class EventService {

    private static final Set<RegistrationStatus> ACTIVE_CAPACITY_STATUSES =
            EnumSet.of(RegistrationStatus.CONFIRMED, RegistrationStatus.CHECKED_IN);

    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final AuditLogRepository auditLogRepository;
    private final StaffRepository staffRepository;
    private final Clock clock;

    public EventService(
            EventRepository eventRepository,
            RegistrationRepository registrationRepository,
            AuditLogRepository auditLogRepository,
            StaffRepository staffRepository,
            Clock clock) {
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
        this.auditLogRepository = auditLogRepository;
        this.staffRepository = staffRepository;
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

    @Transactional(readOnly = true)
    public List<StaffEventResponse> listAllEventsForStaff() {
        List<Event> events = eventRepository.findAll(Sort.by(Sort.Direction.DESC, "startsAt"));
        return events.stream().map(this::toStaffEventResponse).toList();
    }

    @Transactional(readOnly = true)
    public StaffEventResponse getEventForStaff(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Event not found."));
        return toStaffEventResponse(event);
    }

    @Transactional
    public StaffEventResponse createEvent(EventUpsertRequest req, Long staffUserId) {
        validateTimes(req.startsAt(), req.endsAt());

        String prefix = req.codePrefix() != null && !req.codePrefix().isBlank()
                ? req.codePrefix().trim().toUpperCase()
                : generatePrefixFromTitle(req.title());

        Event event = new Event(
                req.title(),
                req.description(),
                req.venue(),
                req.startsAt(),
                req.endsAt(),
                req.capacity(),
                req.status(),
                prefix,
                Instant.now(clock)
        );

        Event saved = eventRepository.save(event);

        StaffUser staff = staffUserId != null ? staffRepository.findById(staffUserId).orElse(null) : null;
        auditLogRepository.save(new AuditLog(
                "CREATE_EVENT",
                "EVENT",
                saved.getId(),
                staff,
                "Created event '" + saved.getTitle() + "' with status " + saved.getStatus(),
                Instant.now(clock)
        ));

        return toStaffEventResponse(saved);
    }

    @Transactional
    public StaffEventResponse updateEvent(Long eventId, EventUpsertRequest req, Long staffUserId) {
        validateTimes(req.startsAt(), req.endsAt());

        Event event = eventRepository.findByIdForUpdate(eventId)
                .orElseThrow(() -> ApiException.notFound("Event not found."));

        long activeCount = registrationRepository.countByEventIdAndStatusIn(eventId, ACTIVE_CAPACITY_STATUSES);
        if (req.capacity() < activeCount) {
            throw ApiException.badRequest("Capacity cannot be lower than the " + activeCount + " currently registered attendees.");
        }

        event.updateDetails(
                req.title(),
                req.description(),
                req.venue(),
                req.startsAt(),
                req.endsAt(),
                req.capacity(),
                req.status()
        );

        Event saved = eventRepository.save(event);

        StaffUser staff = staffUserId != null ? staffRepository.findById(staffUserId).orElse(null) : null;
        auditLogRepository.save(new AuditLog(
                "UPDATE_EVENT",
                "EVENT",
                saved.getId(),
                staff,
                "Updated event '" + saved.getTitle() + "' (status: " + saved.getStatus() + ", cap: " + saved.getCapacity() + ")",
                Instant.now(clock)
        ));

        return toStaffEventResponse(saved);
    }

    @Transactional
    public StaffEventResponse closeEvent(Long eventId, Long staffUserId) {
        Event event = eventRepository.findByIdForUpdate(eventId)
                .orElseThrow(() -> ApiException.notFound("Event not found."));

        event.close();
        Event saved = eventRepository.save(event);

        StaffUser staff = staffUserId != null ? staffRepository.findById(staffUserId).orElse(null) : null;
        auditLogRepository.save(new AuditLog(
                "CLOSE_EVENT",
                "EVENT",
                saved.getId(),
                staff,
                "Closed event '" + saved.getTitle() + "'",
                Instant.now(clock)
        ));

        return toStaffEventResponse(saved);
    }

    private void validateTimes(Instant startsAt, Instant endsAt) {
        if (!endsAt.isAfter(startsAt)) {
            throw ApiException.badRequest("End time must be after start time.");
        }
    }

    private String generatePrefixFromTitle(String title) {
        String clean = title.replaceAll("[^a-zA-Z]", "").toUpperCase();
        if (clean.length() >= 3) {
            return clean.substring(0, 3);
        }
        return "EVT";
    }

    private StaffEventResponse toStaffEventResponse(Event event) {
        long confirmed = registrationRepository.countByEventIdAndStatus(event.getId(), RegistrationStatus.CONFIRMED);
        long waitlisted = registrationRepository.countByEventIdAndStatus(event.getId(), RegistrationStatus.WAITLISTED);
        long cancelled = registrationRepository.countByEventIdAndStatus(event.getId(), RegistrationStatus.CANCELLED);
        long checkedIn = registrationRepository.countByEventIdAndStatus(event.getId(), RegistrationStatus.CHECKED_IN);
        boolean ended = ManilaTime.hasEnded(event.getEndsAt(), clock);

        return StaffEventResponse.from(event, confirmed, waitlisted, cancelled, checkedIn, ended);
    }
}
