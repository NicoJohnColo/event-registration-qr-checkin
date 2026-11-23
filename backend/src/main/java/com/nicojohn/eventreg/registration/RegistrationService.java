package com.nicojohn.eventreg.registration;

import java.time.Clock;
import java.time.Instant;
import java.util.EnumSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nicojohn.eventreg.common.exception.ApiException;
import com.nicojohn.eventreg.common.util.ManilaTime;
import com.nicojohn.eventreg.event.Event;
import com.nicojohn.eventreg.event.EventRepository;
import com.nicojohn.eventreg.event.EventStatus;
import com.nicojohn.eventreg.registration.dto.AttendeeListResponse;
import com.nicojohn.eventreg.registration.dto.AttendeeRowResponse;
import com.nicojohn.eventreg.registration.dto.RegisterRequest;
import com.nicojohn.eventreg.registration.dto.TicketLookupRequest;
import com.nicojohn.eventreg.registration.dto.TicketResponse;

@Service
public class RegistrationService {

    private static final Set<RegistrationStatus> ACTIVE_STATUSES =
            EnumSet.of(RegistrationStatus.CONFIRMED, RegistrationStatus.CHECKED_IN);

    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final TicketCodeGenerator ticketCodeGenerator;
    private final Clock clock;

    public RegistrationService(
            EventRepository eventRepository,
            RegistrationRepository registrationRepository,
            TicketCodeGenerator ticketCodeGenerator,
            Clock clock) {
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
        this.ticketCodeGenerator = ticketCodeGenerator;
        this.clock = clock;
    }

    /**
     * Single source of capacity enforcement: acquires a PESSIMISTIC_WRITE lock on
     * the event row so concurrent registrations cannot exceed event capacity.
     */
    @Transactional
    public TicketResponse register(Long eventId, RegisterRequest request) {
        Event event = eventRepository.findByIdForUpdate(eventId)
                .filter(e -> e.getStatus() == EventStatus.PUBLISHED)
                .orElseThrow(() -> ApiException.notFound("Event not found."));

        if (ManilaTime.hasEnded(event.getEndsAt(), clock)) {
            throw ApiException.conflict("This event has already ended.");
        }

        String cleanName = request.fullName().trim();
        String cleanEmail = request.email().trim().toLowerCase(Locale.ROOT);
        String cleanMobile = request.mobile().trim();

        if (registrationRepository.existsByEventIdAndEmailIgnoreCaseAndStatusIn(
                eventId, cleanEmail, ACTIVE_STATUSES)) {
            throw ApiException.conflict("This email is already registered for this event.");
        }

        long activeCount = registrationRepository.countByEventIdAndStatusIn(eventId, ACTIVE_STATUSES);
        if (activeCount >= event.getCapacity()) {
            throw ApiException.conflict("This event is full. No spots remaining.");
        }

        String ticketCode = nextUniqueTicketCode(event.getCodePrefix());
        Registration registration = new Registration(
                event,
                cleanName,
                cleanEmail,
                cleanMobile,
                ticketCode,
                RegistrationStatus.CONFIRMED,
                Instant.now(clock));

        try {
            Registration saved = registrationRepository.saveAndFlush(registration);
            return TicketResponse.from(saved);
        } catch (DataIntegrityViolationException ex) {
            throw ApiException.conflict("This email is already registered for this event.");
        }
    }

    /**
     * Looks up a ticket by normalized ticket code and email (Rule R11: wrong code
     * and wrong email produce an identical 404 without revealing which failed).
     */
    @Transactional(readOnly = true)
    public TicketResponse lookupTicket(TicketLookupRequest request) {
        String normalizedCode = request.ticketCode().trim().toUpperCase(Locale.ROOT);
        String normalizedEmail = request.email().trim().toLowerCase(Locale.ROOT);

        return registrationRepository
                .findByTicketCodeAndEmailIgnoreCase(normalizedCode, normalizedEmail)
                .map(TicketResponse::from)
                .orElseThrow(() -> ApiException.notFound("Ticket not found"));
    }

    /**
     * Returns attendee rows and event-wide registered / checked-in totals for staff.
     */
    @Transactional(readOnly = true)
    public AttendeeListResponse listAttendeesForEvent(Long eventId, String query) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> ApiException.notFound("Event not found."));

        long registeredCount = registrationRepository.countByEventIdAndStatusIn(eventId, ACTIVE_STATUSES);
        long checkedInCount = registrationRepository.countByEventIdAndStatus(eventId, RegistrationStatus.CHECKED_IN);

        List<Registration> rows = (query == null || query.isBlank())
                ? registrationRepository.findAllByEventIdOrderByRegisteredAtDesc(eventId)
                : registrationRepository.searchByEventIdAndNameOrTicketCode(
                        eventId, "%" + query.trim().toLowerCase(Locale.ROOT) + "%");

        List<AttendeeRowResponse> attendees = rows.stream()
                .map(AttendeeRowResponse::from)
                .toList();

        return new AttendeeListResponse(
                event.getId(),
                event.getTitle(),
                event.getCapacity(),
                registeredCount,
                checkedInCount,
                attendees);
    }

    private String nextUniqueTicketCode(String prefix) {
        String code;
        do {
            code = ticketCodeGenerator.generate(prefix);
        } while (registrationRepository.existsByTicketCode(code));
        return code;
    }
}
