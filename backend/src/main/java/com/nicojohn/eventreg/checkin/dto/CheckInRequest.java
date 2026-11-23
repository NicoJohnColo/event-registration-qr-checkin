package com.nicojohn.eventreg.checkin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Check-in scan/entry request. Trims ticketCode before validation. */
public record CheckInRequest(
        @NotNull(message = "Event is required.")
        Long eventId,

        @NotBlank(message = "Ticket code is required.")
        @Size(max = 64, message = "Ticket code must be 64 characters or fewer.")
        String ticketCode) {

    public CheckInRequest {
        ticketCode = ticketCode == null ? null : ticketCode.trim();
    }
}
