package com.nicojohn.eventreg.checkin.dto;

public record CheckInStatsResponse(
        Long eventId,
        long registeredCount,
        long checkedInCount,
        int capacity) {
}
