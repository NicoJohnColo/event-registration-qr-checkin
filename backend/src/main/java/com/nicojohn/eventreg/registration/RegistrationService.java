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
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import com.nicojohn.eventreg.audit.AuditLog;
import com.nicojohn.eventreg.audit.AuditLogRepository;
import com.nicojohn.eventreg.common.exception.ApiException;
import com.nicojohn.eventreg.common.security.QrTokenService;
import com.nicojohn.eventreg.common.util.ManilaTime;
import com.nicojohn.eventreg.event.Event;
import com.nicojohn.eventreg.event.EventRepository;
import com.nicojohn.eventreg.event.EventStatus;
import com.nicojohn.eventreg.registration.dto.AttendeeListResponse;
import com.nicojohn.eventreg.registration.dto.AttendeeRowResponse;
import com.nicojohn.eventreg.registration.dto.RegisterRequest;
import com.nicojohn.eventreg.registration.dto.TicketLookupRequest;
import com.nicojohn.eventreg.registration.dto.TicketResponse;
import com.nicojohn.eventreg.staff.StaffRepository;
import com.nicojohn.eventreg.staff.StaffUser;

@Service
public class RegistrationService {

    private static final Set<RegistrationStatus> ACTIVE_STATUSES =
            EnumSet.of(RegistrationStatus.CONFIRMED, RegistrationStatus.CHECKED_IN);

    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final TicketCodeGenerator ticketCodeGenerator;
    private final AuditLogRepository auditLogRepository;
    private final StaffRepository staffRepository;
    private final QrTokenService qrTokenService;
    private final TicketEmailService ticketEmailService;
    private final Clock clock;

    public RegistrationService(
            EventRepository eventRepository,
            RegistrationRepository registrationRepository,
            TicketCodeGenerator ticketCodeGenerator,
            AuditLogRepository auditLogRepository,
            StaffRepository staffRepository,
            QrTokenService qrTokenService,
            TicketEmailService ticketEmailService,
            Clock clock) {
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
        this.ticketCodeGenerator = ticketCodeGenerator;
        this.auditLogRepository = auditLogRepository;
        this.staffRepository = staffRepository;
        this.qrTokenService = qrTokenService;
        this.ticketEmailService = ticketEmailService;
        this.clock = clock;
    }

    /**
     * Handles registration & waitlist queueing:
     * - If spots remaining -> CONFIRMED ticket.
     * - If capacity full -> placed on WAITLIST with next position number.
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
                eventId, cleanEmail, EnumSet.of(RegistrationStatus.CONFIRMED, RegistrationStatus.CHECKED_IN, RegistrationStatus.WAITLISTED))) {
            throw ApiException.conflict("This email is already registered for this event.");
        }

        long activeCount = registrationRepository.countByEventIdAndStatusIn(eventId, ACTIVE_STATUSES);
        boolean isFull = activeCount >= event.getCapacity();

        String ticketCode = nextUniqueTicketCode(event.getCodePrefix());
        Registration registration;

        if (isFull) {
            int nextPos = registrationRepository.findMaxWaitlistPosition(eventId) + 1;
            registration = new Registration(
                    event,
                    cleanName,
                    cleanEmail,
                    cleanMobile,
                    ticketCode,
                    RegistrationStatus.WAITLISTED,
                    nextPos,
                    Instant.now(clock));
        } else {
            registration = new Registration(
                    event,
                    cleanName,
                    cleanEmail,
                    cleanMobile,
                    ticketCode,
                    RegistrationStatus.CONFIRMED,
                    Instant.now(clock));
        }

        try {
            Registration saved = registrationRepository.saveAndFlush(registration);
            TicketResponse response = TicketResponse.from(saved, qrTokenService);
            dispatchAfterCommit(() -> ticketEmailService.sendRegistrationEmail(response));
            return response;
        } catch (DataIntegrityViolationException ex) {
            throw ApiException.conflict("This email is already registered for this event.");
        }
    }

    /**
     * Looks up a ticket by normalized ticket code (or signed QR payload) and email.
     */
    @Transactional(readOnly = true)
    public TicketResponse lookupTicket(TicketLookupRequest request) {
        Registration reg = findVerifiedTicket(request);
        return TicketResponse.from(reg, qrTokenService);
    }

    /**
     * Feature 09: Attendee Self-Cancel
     */
    @Transactional
    public TicketResponse attendeeCancel(TicketLookupRequest request) {
        Registration reg = findVerifiedTicket(request);

        if (reg.getStatus() == RegistrationStatus.CHECKED_IN) {
            throw ApiException.badRequest("Checked-in registrations cannot be cancelled.");
        }
        if (reg.getStatus() == RegistrationStatus.CANCELLED) {
            throw ApiException.badRequest("This registration is already cancelled.");
        }

        boolean wasWaitlisted = reg.getStatus() == RegistrationStatus.WAITLISTED;
        reg.cancel(null, Instant.now(clock));
        Registration saved = registrationRepository.save(reg);

        if (wasWaitlisted) {
            recompactWaitlist(reg.getEvent().getId());
        }

        auditLogRepository.save(new AuditLog(
                "ATTENDEE_CANCEL",
                "REGISTRATION",
                reg.getId(),
                null,
                "Attendee cancelled registration for '" + reg.getFullName() + "' (" + reg.getTicketCode() + ")",
                Instant.now(clock)));

        return TicketResponse.from(saved, qrTokenService);
    }

    private Registration findVerifiedTicket(TicketLookupRequest request) {
        String candidateCode = qrTokenService.extractCandidateCode(request.ticketCode());
        String normalizedEmail = request.email().trim().toLowerCase(Locale.ROOT);

        Registration reg = registrationRepository
                .findByTicketCodeAndEmailIgnoreCase(candidateCode, normalizedEmail)
                .orElseThrow(() -> ApiException.notFound("Ticket not found"));

        if (!qrTokenService.isValidTicketOrToken(request.ticketCode(), reg.getEvent().getId(), reg.getTicketCode())) {
            throw ApiException.notFound("Ticket not found");
        }
        return reg;
    }

    /**
     * Feature 09: Staff Cancel
     */
    @Transactional
    public TicketResponse staffCancel(Long registrationId, Long staffUserId) {
        Registration reg = registrationRepository.findById(registrationId)
                .orElseThrow(() -> ApiException.notFound("Registration not found."));

        if (reg.getStatus() == RegistrationStatus.CHECKED_IN) {
            throw ApiException.badRequest("Checked-in registrations cannot be cancelled.");
        }
        if (reg.getStatus() == RegistrationStatus.CANCELLED) {
            throw ApiException.badRequest("This registration is already cancelled.");
        }

        StaffUser staff = staffUserId != null ? staffRepository.findById(staffUserId).orElse(null) : null;
        boolean wasWaitlisted = reg.getStatus() == RegistrationStatus.WAITLISTED;

        reg.cancel(staff, Instant.now(clock));
        Registration saved = registrationRepository.save(reg);

        if (wasWaitlisted) {
            recompactWaitlist(reg.getEvent().getId());
        }

        auditLogRepository.save(new AuditLog(
                "STAFF_CANCEL",
                "REGISTRATION",
                reg.getId(),
                staff,
                "Staff cancelled registration for '" + reg.getFullName() + "' (" + reg.getTicketCode() + ")",
                Instant.now(clock)));

        return TicketResponse.from(saved, qrTokenService);
    }

    /**
     * Feature 08: Staff Promote First on Waitlist
     */
    @Transactional
    public TicketResponse promoteFirstWaitlist(Long eventId, Long staffUserId) {
        Event event = eventRepository.findByIdForUpdate(eventId)
                .orElseThrow(() -> ApiException.notFound("Event not found."));

        long activeCount = registrationRepository.countByEventIdAndStatusIn(eventId, ACTIVE_STATUSES);
        if (activeCount >= event.getCapacity()) {
            throw ApiException.badRequest("Cannot promote waitlist: event is at full capacity (" + event.getCapacity() + ").");
        }

        Registration firstWaitlist = registrationRepository.findFirstWaitlistByEventId(eventId)
                .orElseThrow(() -> ApiException.badRequest("No attendees currently on the waitlist for this event."));

        firstWaitlist.promoteToConfirmed();
        Registration saved = registrationRepository.save(firstWaitlist);

        recompactWaitlist(eventId);

        StaffUser staff = staffUserId != null ? staffRepository.findById(staffUserId).orElse(null) : null;
        auditLogRepository.save(new AuditLog(
                "PROMOTE_WAITLIST",
                "REGISTRATION",
                saved.getId(),
                staff,
                "Promoted attendee '" + saved.getFullName() + "' (" + saved.getTicketCode() + ") from waitlist to confirmed",
                Instant.now(clock)));

        TicketResponse response = TicketResponse.from(saved, qrTokenService);
        dispatchAfterCommit(() -> ticketEmailService.sendPromotionEmail(response));
        return response;
    }

    private void dispatchAfterCommit(Runnable action) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    action.run();
                }
            });
        } else {
            action.run();
        }
    }

    /**
     * Compacts waitlist positions into consecutive 1..N order.
     */
    private void recompactWaitlist(Long eventId) {
        List<Registration> remaining = registrationRepository.findWaitlistByEventIdOrderByPosition(eventId);
        int pos = 1;
        for (Registration r : remaining) {
            r.updateWaitlistPosition(pos++);
            registrationRepository.save(r);
        }
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
