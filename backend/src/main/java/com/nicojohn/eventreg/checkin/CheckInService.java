package com.nicojohn.eventreg.checkin;

import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.EnumSet;
import java.util.Locale;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nicojohn.eventreg.audit.AuditLog;
import com.nicojohn.eventreg.audit.AuditLogRepository;
import com.nicojohn.eventreg.checkin.dto.CheckInRequest;
import com.nicojohn.eventreg.checkin.dto.CheckInResponse;
import com.nicojohn.eventreg.checkin.dto.CheckInStatsResponse;
import com.nicojohn.eventreg.common.exception.ApiException;
import com.nicojohn.eventreg.common.security.QrTokenService;
import com.nicojohn.eventreg.common.security.StaffPrincipal;
import com.nicojohn.eventreg.common.util.ManilaTime;
import com.nicojohn.eventreg.event.Event;
import com.nicojohn.eventreg.event.EventRepository;
import com.nicojohn.eventreg.registration.Registration;
import com.nicojohn.eventreg.registration.RegistrationRepository;
import com.nicojohn.eventreg.registration.RegistrationStatus;
import com.nicojohn.eventreg.staff.StaffRepository;
import com.nicojohn.eventreg.staff.StaffUser;

@Service
public class CheckInService {

    private static final Set<RegistrationStatus> ACTIVE_STATUSES =
            EnumSet.of(RegistrationStatus.CONFIRMED, RegistrationStatus.CHECKED_IN);

    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final StaffRepository staffRepository;
    private final AuditLogRepository auditLogRepository;
    private final QrTokenService qrTokenService;
    private final Clock clock;

    public CheckInService(
            EventRepository eventRepository,
            RegistrationRepository registrationRepository,
            StaffRepository staffRepository,
            AuditLogRepository auditLogRepository,
            QrTokenService qrTokenService,
            Clock clock) {
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
        this.staffRepository = staffRepository;
        this.auditLogRepository = auditLogRepository;
        this.qrTokenService = qrTokenService;
        this.clock = clock;
    }

    /**
     * Enforces Level 1 and Level 2 check-in logic:
     * 1) Ticket must exist for selected event,
     * 2) If WAITLISTED -> "On waitlist — not confirmed",
     * 3) If CANCELLED -> "Cancelled",
     * 4) If already CHECKED_IN -> ALREADY_CHECKED_IN with original timestamp,
     * 5) Only CONFIRMED tickets on event day (Asia/Manila) are checked in.
     */
    @Transactional
    public CheckInResponse checkIn(CheckInRequest request, StaffPrincipal principal) {
        if (principal == null) {
            throw ApiException.unauthorized("Authentication required.");
        }

        Event event = eventRepository.findById(request.eventId())
                .orElseThrow(() -> ApiException.notFound("Event not found."));

        String rawInput = request.ticketCode().trim().toUpperCase(Locale.ROOT);
        long registeredCount = registrationRepository.countByEventIdAndStatusIn(event.getId(), ACTIVE_STATUSES);
        long checkedInCount = registrationRepository.countByEventIdAndStatus(
                event.getId(), RegistrationStatus.CHECKED_IN);

        String normalizedCode = qrTokenService.resolveCheckInInput(rawInput, event.getId()).orElse(null);
        if (normalizedCode == null) {
            return new CheckInResponse(
                    CheckInOutcome.INVALID,
                    "Invalid ticket",
                    rawInput,
                    null,
                    null,
                    null,
                    checkedInCount,
                    registeredCount);
        }

        Registration reg = registrationRepository
                .findByEventIdAndTicketCode(event.getId(), normalizedCode)
                .orElse(null);

        if (reg == null) {
            return new CheckInResponse(
                    CheckInOutcome.INVALID,
                    "Invalid ticket",
                    normalizedCode,
                    null,
                    null,
                    null,
                    checkedInCount,
                    registeredCount);
        }

        if (reg.getStatus() == RegistrationStatus.WAITLISTED) {
            return new CheckInResponse(
                    CheckInOutcome.WAITLISTED,
                    "On waitlist — not confirmed",
                    reg.getTicketCode(),
                    reg.getFullName(),
                    null,
                    null,
                    checkedInCount,
                    registeredCount);
        }

        if (reg.getStatus() == RegistrationStatus.CANCELLED) {
            return new CheckInResponse(
                    CheckInOutcome.CANCELLED,
                    "Cancelled",
                    reg.getTicketCode(),
                    reg.getFullName(),
                    null,
                    null,
                    checkedInCount,
                    registeredCount);
        }

        if (reg.getStatus() == RegistrationStatus.CHECKED_IN) {
            return new CheckInResponse(
                    CheckInOutcome.ALREADY_CHECKED_IN,
                    "Already checked in",
                    reg.getTicketCode(),
                    reg.getFullName(),
                    reg.getCheckedInAt(),
                    reg.getCheckedInBy() != null ? reg.getCheckedInBy().getName() : null,
                    checkedInCount,
                    registeredCount);
        }

        if (reg.getStatus() != RegistrationStatus.CONFIRMED) {
            return new CheckInResponse(
                    CheckInOutcome.INVALID,
                    "Ticket is not confirmed",
                    reg.getTicketCode(),
                    reg.getFullName(),
                    null,
                    null,
                    checkedInCount,
                    registeredCount);
        }

        if (!ManilaTime.isEventDay(event.getStartsAt(), event.getEndsAt(), clock)) {
            return new CheckInResponse(
                    CheckInOutcome.WRONG_DAY,
                    "Check-in is only open on the event day ("
                            + ManilaTime.formatDate(event.getStartsAt())
                            + ", Asia/Manila time).",
                    reg.getTicketCode(),
                    reg.getFullName(),
                    null,
                    null,
                    checkedInCount,
                    registeredCount);
        }

        StaffUser staffRef = staffRepository.getReferenceById(principal.id());
        Instant now = Instant.now(clock).truncatedTo(ChronoUnit.MICROS);
        int updated = registrationRepository.markCheckedInIfConfirmed(reg.getId(), now, staffRef);

        if (updated == 1) {
            auditLogRepository.save(new AuditLog(
                    "CHECK_IN",
                    "REGISTRATION",
                    reg.getId(),
                    staffRef,
                    "Checked in attendee '" + reg.getFullName() + "' (" + reg.getTicketCode() + ")",
                    now));

            return new CheckInResponse(
                    CheckInOutcome.CHECKED_IN,
                    "Checked in",
                    reg.getTicketCode(),
                    reg.getFullName(),
                    now,
                    principal.name(),
                    checkedInCount + 1,
                    registeredCount);
        }

        Registration latest = registrationRepository
                .findByEventIdAndTicketCode(event.getId(), normalizedCode)
                .orElse(reg);
        long freshCheckedIn = registrationRepository.countByEventIdAndStatus(
                event.getId(), RegistrationStatus.CHECKED_IN);
        return new CheckInResponse(
                CheckInOutcome.ALREADY_CHECKED_IN,
                "Already checked in",
                latest.getTicketCode(),
                latest.getFullName(),
                latest.getCheckedInAt(),
                latest.getCheckedInBy() != null ? latest.getCheckedInBy().getName() : null,
                freshCheckedIn,
                registeredCount);
    }

    /**
     * Feature 11: Undo Check-In
     */
    @Transactional
    public CheckInResponse undoCheckIn(Long eventId, String ticketCode, StaffPrincipal principal) {
        if (principal == null) {
            throw ApiException.unauthorized("Authentication required.");
        }

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> ApiException.notFound("Event not found."));

        String normalizedCode = qrTokenService.resolveCheckInInput(ticketCode, event.getId())
                .orElseThrow(() -> ApiException.badRequest("Invalid or tampered ticket code."));
        Registration reg = registrationRepository
                .findByEventIdAndTicketCode(event.getId(), normalizedCode)
                .orElseThrow(() -> ApiException.notFound("Registration not found for event."));

        if (reg.getStatus() != RegistrationStatus.CHECKED_IN) {
            throw ApiException.badRequest("Cannot undo check-in for ticket with status " + reg.getStatus());
        }

        StaffUser staff = staffRepository.getReferenceById(principal.id());
        Instant now = Instant.now(clock);

        reg.undoCheckIn();
        registrationRepository.save(reg);

        auditLogRepository.save(new AuditLog(
                "UNDO_CHECK_IN",
                "REGISTRATION",
                reg.getId(),
                staff,
                "Undid check-in for attendee '" + reg.getFullName() + "' (" + reg.getTicketCode() + ")",
                now));

        long registeredCount = registrationRepository.countByEventIdAndStatusIn(event.getId(), ACTIVE_STATUSES);
        long checkedInCount = registrationRepository.countByEventIdAndStatus(event.getId(), RegistrationStatus.CHECKED_IN);

        return new CheckInResponse(
                CheckInOutcome.CHECKED_IN,
                "Check-in undone. Ticket is now confirmed and eligible for check-in again.",
                reg.getTicketCode(),
                reg.getFullName(),
                null,
                null,
                checkedInCount,
                registeredCount);
    }

    @Transactional(readOnly = true)
    public CheckInStatsResponse getStats(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> ApiException.notFound("Event not found."));
        long registeredCount = registrationRepository.countByEventIdAndStatusIn(eventId, ACTIVE_STATUSES);
        long checkedInCount = registrationRepository.countByEventIdAndStatus(eventId, RegistrationStatus.CHECKED_IN);
        return new CheckInStatsResponse(eventId, registeredCount, checkedInCount, event.getCapacity());
    }
}
