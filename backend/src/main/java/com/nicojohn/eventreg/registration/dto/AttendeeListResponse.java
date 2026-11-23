package com.nicojohn.eventreg.registration.dto;

import java.util.List;

/** Staff attendee roster payload including event-wide capacity and check-in totals. */
public record AttendeeListResponse(
        Long eventId,
        String eventTitle,
        int capacity,
        long registeredCount,
        long checkedInCount,
        List<AttendeeRowResponse> attendees) {
}
