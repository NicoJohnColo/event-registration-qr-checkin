package com.nicojohn.eventreg.registration.dto;

import java.time.Instant;

import com.nicojohn.eventreg.common.security.QrTokenService;
import com.nicojohn.eventreg.event.Event;
import com.nicojohn.eventreg.registration.Registration;
import com.nicojohn.eventreg.registration.RegistrationStatus;

/** Public ticket DTO returned on successful registration and ticket lookup. */
public record TicketResponse(
        Long registrationId,
        String ticketCode,
        String qrPayload,
        RegistrationStatus status,
        Integer waitlistPosition,
        String attendeeName,
        String email,
        String mobile,
        Instant registeredAt,
        Instant cancelledAt,
        Long eventId,
        String eventTitle,
        String eventVenue,
        Instant eventStartsAt,
        Instant eventEndsAt) {

    public static TicketResponse from(Registration reg) {
        return from(reg, null);
    }

    public static TicketResponse from(Registration reg, QrTokenService qrTokenService) {
        Event event = reg.getEvent();
        String qrPayload = qrTokenService != null
                ? qrTokenService.sign(event.getId(), reg.getTicketCode())
                : reg.getTicketCode();
        return new TicketResponse(
                reg.getId(),
                reg.getTicketCode(),
                qrPayload,
                reg.getStatus(),
                reg.getWaitlistPosition(),
                reg.getFullName(),
                reg.getEmail(),
                reg.getMobile(),
                reg.getRegisteredAt(),
                reg.getCancelledAt(),
                event.getId(),
                event.getTitle(),
                event.getVenue(),
                event.getStartsAt(),
                event.getEndsAt());
    }
}
