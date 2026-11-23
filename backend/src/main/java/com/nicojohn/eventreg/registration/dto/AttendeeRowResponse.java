package com.nicojohn.eventreg.registration.dto;

import java.time.Instant;

import com.nicojohn.eventreg.registration.Registration;
import com.nicojohn.eventreg.registration.RegistrationStatus;

/** Single attendee row returned in the staff attendee roster. */
public record AttendeeRowResponse(
        Long id,
        String fullName,
        String email,
        String mobile,
        String ticketCode,
        RegistrationStatus status,
        Instant registeredAt,
        Instant checkedInAt,
        String checkedInByName) {

    public static AttendeeRowResponse from(Registration reg) {
        return new AttendeeRowResponse(
                reg.getId(),
                reg.getFullName(),
                reg.getEmail(),
                reg.getMobile(),
                reg.getTicketCode(),
                reg.getStatus(),
                reg.getRegisteredAt(),
                reg.getCheckedInAt(),
                reg.getCheckedInBy() != null ? reg.getCheckedInBy().getName() : null);
    }
}
