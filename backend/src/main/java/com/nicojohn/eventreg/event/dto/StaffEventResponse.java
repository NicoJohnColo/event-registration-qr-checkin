package com.nicojohn.eventreg.event.dto;

import java.time.Instant;

import com.nicojohn.eventreg.event.Event;
import com.nicojohn.eventreg.event.EventStatus;

public record StaffEventResponse(
        Long id,
        String title,
        String description,
        String venue,
        Instant startsAt,
        Instant endsAt,
        int capacity,
        EventStatus status,
        String codePrefix,
        long confirmedCount,
        long waitlistCount,
        long cancelledCount,
        long checkedInCount,
        boolean ended,
        Instant createdAt
) {
    public static StaffEventResponse from(
            Event event,
            long confirmedCount,
            long waitlistCount,
            long cancelledCount,
            long checkedInCount,
            boolean ended) {
        return new StaffEventResponse(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getVenue(),
                event.getStartsAt(),
                event.getEndsAt(),
                event.getCapacity(),
                event.getStatus(),
                event.getCodePrefix(),
                confirmedCount,
                waitlistCount,
                cancelledCount,
                checkedInCount,
                ended,
                event.getCreatedAt()
        );
    }
}
