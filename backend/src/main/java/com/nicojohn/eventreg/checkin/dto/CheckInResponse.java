package com.nicojohn.eventreg.checkin.dto;

import java.time.Instant;

import com.nicojohn.eventreg.checkin.CheckInOutcome;

public record CheckInResponse(
        CheckInOutcome outcome,
        String message,
        String ticketCode,
        String attendeeName,
        Instant checkedInAt,
        String checkedInByName,
        long checkedInCount,
        long registeredCount) {
}
