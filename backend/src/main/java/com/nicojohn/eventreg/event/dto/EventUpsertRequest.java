package com.nicojohn.eventreg.event.dto;

import java.time.Instant;

import com.nicojohn.eventreg.event.EventStatus;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record EventUpsertRequest(
        @NotBlank(message = "Title is required.")
        @Size(max = 150, message = "Title must be 150 characters or fewer.")
        String title,

        @Size(max = 2000, message = "Description must be 2000 characters or fewer.")
        String description,

        @NotBlank(message = "Venue is required.")
        @Size(max = 200, message = "Venue must be 200 characters or fewer.")
        String venue,

        @NotNull(message = "Start time is required.")
        Instant startsAt,

        @NotNull(message = "End time is required.")
        Instant endsAt,

        @NotNull(message = "Capacity is required.")
        @Min(value = 1, message = "Capacity must be at least 1.")
        Integer capacity,

        @NotNull(message = "Status is required.")
        EventStatus status,

        @Pattern(regexp = "^[A-Z]{3,5}$", message = "Code prefix must be 3 to 5 uppercase letters.")
        String codePrefix
) {
    public EventUpsertRequest {
        title = title == null ? null : title.trim();
        description = description == null ? "" : description.trim();
        venue = venue == null ? null : venue.trim();
        codePrefix = codePrefix == null ? null : codePrefix.trim().toUpperCase();
    }
}
