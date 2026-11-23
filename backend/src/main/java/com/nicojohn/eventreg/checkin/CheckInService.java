package com.nicojohn.eventreg.checkin;

import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.EnumSet;
import java.util.Locale;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nicojohn.eventreg.checkin.dto.CheckInRequest;
import com.nicojohn.eventreg.checkin.dto.CheckInResponse;
import com.nicojohn.eventreg.checkin.dto.CheckInStatsResponse;
import com.nicojohn.eventreg.common.exception.ApiException;
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
    private final Clock clock;

    public CheckInService(
            EventRepository eventRepository,
            RegistrationRepository registrationRepository,
            StaffRepository staffRepository,
            Clock clock) {
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
        this.staffRepository = staffRepository;
        this.clock = clock;
    }

    /**
     * Enforces Rules R3, R4, and R7 in order:
     * 1) ticket must exist for the selected event,
     * 2) duplicate scans return ALREADY_CHECKED_IN with original timestamp,
     * 3) only CONFIRMED tickets on the event day (Asia/Manila) are updated atomically.
     */
    @Transactional
    public CheckInResponse checkIn(CheckInRequest request, StaffPrincipal principal) {
        if (principal == null) {
            throw ApiException.unauthorized("Authentication required.");
        }

        Event event = eventRepository.findById(request.eventId())
                .orElseThrow(() -> ApiException.notFound("Event not found."));

        String normalizedCode = request.ticketCode().trim().toUpperCase(Locale.ROOT);
        long registeredCount = registrationRepository.countByEventIdAndStatusIn(event.getId(), ACTIVE_STATUSES);
        long checkedInCount = registrationRepository.countByEventIdAndStatus(
                event.getId(), RegistrationStatus.CHECKED_IN);

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

    @Transactional(readOnly = true)
    public CheckInStatsResponse getStats(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> ApiException.notFound("Event not found."));
        long registeredCount = registrationRepository.countByEventIdAndStatusIn(eventId, ACTIVE_STATUSES);
        long checkedInCount = registrationRepository.countByEventIdAndStatus(eventId, RegistrationStatus.CHECKED_IN);
        return new CheckInStatsResponse(eventId, registeredCount, checkedInCount, event.getCapacity());
    }
}
