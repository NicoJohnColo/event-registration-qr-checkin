package com.nicojohn.eventreg.staff.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Staff login request payload. Trims username before validation. */
public record LoginRequest(
        @NotBlank(message = "Username is required.")
        @Size(max = 50, message = "Username must be 50 characters or fewer.")
        String username,

        @NotBlank(message = "Password is required.")
        @Size(max = 128, message = "Password must be 128 characters or fewer.")
        String password) {

    public LoginRequest {
        username = username == null ? null : username.trim();
    }
}
