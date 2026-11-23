package com.nicojohn.eventreg.registration.dto;

import com.fasterxml.jackson.annotation.JsonAlias;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Public ticket lookup payload. Accepts either {@code ticketCode} or {@code code}
 * and avoids strict regex on the code so probes fall through cleanly to a uniform 404.
 */
public record TicketLookupRequest(
        @JsonAlias("code")
        @NotBlank(message = "Ticket code is required.")
        @Size(max = 64, message = "Ticket code must be 64 characters or fewer.")
        String ticketCode,

        @NotBlank(message = "Email is required.")
        @Email(message = "Enter a valid email address.")
        @Size(max = 160, message = "Email must be 160 characters or fewer.")
        String email) {

    public TicketLookupRequest {
        ticketCode = ticketCode == null ? null : ticketCode.trim();
        email = email == null ? null : email.trim();
    }
}
