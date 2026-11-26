package com.nicojohn.eventreg.dashboard;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.time.Clock;
import java.time.Instant;
import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nicojohn.eventreg.common.exception.ApiException;
import com.nicojohn.eventreg.common.util.ManilaTime;
import com.nicojohn.eventreg.dashboard.dto.EventMetricsDto;
import com.nicojohn.eventreg.event.Event;
import com.nicojohn.eventreg.event.EventRepository;
import com.nicojohn.eventreg.registration.Registration;
import com.nicojohn.eventreg.registration.RegistrationRepository;
import com.nicojohn.eventreg.registration.RegistrationStatus;

@Service
public class DashboardService {

    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final Clock clock;

    public DashboardService(
            EventRepository eventRepository,
            RegistrationRepository registrationRepository,
            Clock clock) {
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<EventMetricsDto> getDashboardMetrics() {
        List<Event> events = eventRepository.findAll(Sort.by(Sort.Direction.DESC, "startsAt"));
        Instant now = Instant.now(clock);

        return events.stream().map(event -> {
            long confirmed = registrationRepository.countByEventIdAndStatus(event.getId(), RegistrationStatus.CONFIRMED);
            long waitlisted = registrationRepository.countByEventIdAndStatus(event.getId(), RegistrationStatus.WAITLISTED);
            long cancelled = registrationRepository.countByEventIdAndStatus(event.getId(), RegistrationStatus.CANCELLED);
            long checkedIn = registrationRepository.countByEventIdAndStatus(event.getId(), RegistrationStatus.CHECKED_IN);

            boolean isStarted = now.isAfter(event.getStartsAt());
            boolean isEnded = ManilaTime.hasEnded(event.getEndsAt(), clock);

            // Rule from Feature 10: No-shows (confirmed but not checked in, shown only after event starts)
            Long noShowCount = isStarted ? confirmed : null;

            return new EventMetricsDto(
                    event.getId(),
                    event.getTitle(),
                    event.getStatus(),
                    event.getCodePrefix(),
                    event.getVenue(),
                    event.getStartsAt(),
                    event.getEndsAt(),
                    event.getCapacity(),
                    confirmed,
                    waitlisted,
                    cancelled,
                    checkedIn,
                    noShowCount,
                    isStarted,
                    isEnded
            );
        }).toList();
    }

    @Transactional(readOnly = true)
    public String exportRosterCsv(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> ApiException.notFound("Event not found."));

        List<Registration> list = registrationRepository.findAllByEventIdOrderByRegisteredAtDesc(eventId);

        StringWriter sw = new StringWriter();
        // Prepend UTF-8 BOM so Microsoft Excel on Windows decodes ñ and Unicode names accurately.
        sw.write('\uFEFF');
        PrintWriter pw = new PrintWriter(sw);

        // CSV Header
        pw.println("Ticket Code,Full Name,Email,Mobile,Status,Waitlist Position,Registered At (Manila),Checked In At (Manila),Checked In By,Cancelled At (Manila)");

        for (Registration r : list) {
            pw.printf("\"%s\",\"%s\",\"%s\",%s,\"%s\",%s,\"%s\",\"%s\",\"%s\",\"%s\"%n",
                    escapeCsv(r.getTicketCode()),
                    escapeCsv(r.getFullName()),
                    escapeCsv(r.getEmail()),
                    formatMobileCsv(r.getMobile()),
                    r.getStatus().name(),
                    r.getWaitlistPosition() != null ? r.getWaitlistPosition().toString() : "",
                    r.getRegisteredAt() != null ? ManilaTime.formatDate(r.getRegisteredAt()) + " " + ManilaTime.formatTime(r.getRegisteredAt()) : "",
                    r.getCheckedInAt() != null ? ManilaTime.formatDate(r.getCheckedInAt()) + " " + ManilaTime.formatTime(r.getCheckedInAt()) : "",
                    r.getCheckedInBy() != null ? escapeCsv(r.getCheckedInBy().getName()) : "",
                    r.getCancelledAt() != null ? ManilaTime.formatDate(r.getCancelledAt()) + " " + ManilaTime.formatTime(r.getCancelledAt()) : ""
            );
        }
        pw.flush();
        return sw.toString();
    }

    /** Formats PH mobile numbers as Excel text formulas so leading zeroes are preserved on open. */
    private String formatMobileCsv(String mobile) {
        if (mobile == null || mobile.isBlank()) {
            return "\"\"";
        }
        String sanitized = mobile.trim().replace("\"", "");
        return "=\"" + sanitized + "\"";
    }

    private String escapeCsv(String str) {
        if (str == null) return "";
        return str.replace("\"", "\"\"");
    }
}
