package com.nicojohn.eventreg.registration.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Validated payload for registering an attendee to an event. */
public record RegisterRequest(
        @NotBlank(message = "Full name is required.")
        @Size(max = 120, message = "Full name must be 120 characters or fewer.")
        String fullName,

        @NotBlank(message = "Email address is required.")
        @Email(regexp = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", message = "Enter a valid email address.")
        @Size(max = 254, message = "Email address is too long.")
        String email,

        @NotBlank(message = "Mobile number is required.")
        @Pattern(
                regexp = "^09\\d{9}$",
                message = "Enter an 11-digit PH mobile number starting with 09 (e.g. 09171234567)."
        )
        String mobile) {}
