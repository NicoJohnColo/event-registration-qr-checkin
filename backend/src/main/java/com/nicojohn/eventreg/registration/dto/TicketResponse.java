package com.nicojohn.eventreg.registration.dto;

import java.time.Instant;

import com.nicojohn.eventreg.event.Event;
import com.nicojohn.eventreg.registration.Registration;
import com.nicojohn.eventreg.registration.RegistrationStatus;

/** Public ticket DTO returned on successful registration and ticket lookup. */
public record TicketResponse(
        Long registrationId,
        String ticketCode,
        RegistrationStatus status,
        String attendeeName,
        String email,
        String mobile,
        Instant registeredAt,
        Long eventId,
        String eventTitle,
        String eventVenue,
        Instant eventStartsAt,
        Instant eventEndsAt) {

    public static TicketResponse from(Registration reg) {
        Event event = reg.getEvent();
        return new TicketResponse(
                reg.getId(),
                reg.getTicketCode(),
                reg.getStatus(),
                reg.getFullName(),
                reg.getEmail(),
                reg.getMobile(),
                reg.getRegisteredAt(),
                event.getId(),
                event.getTitle(),
                event.getVenue(),
                event.getStartsAt(),
                event.getEndsAt());
    }
}
