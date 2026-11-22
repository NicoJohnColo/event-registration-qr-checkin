package com.nicojohn.eventreg.event.dto;

import java.time.Instant;

import com.nicojohn.eventreg.event.Event;
import com.nicojohn.eventreg.event.EventStatus;

/** Public API representation of a published event with server-computed capacity figures. */
public record EventResponse(
        Long id,
        String title,
        String description,
        String venue,
        Instant startsAt,
        Instant endsAt,
        int capacity,
        long registeredCount,
        int spotsLeft,
        boolean full,
        boolean ended,
        EventStatus status,
        String codePrefix) {

    public static EventResponse from(Event event, long registeredCount, boolean ended) {
        int spotsLeft = (int) Math.max(0L, event.getCapacity() - registeredCount);
        return new EventResponse(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getVenue(),
                event.getStartsAt(),
                event.getEndsAt(),
                event.getCapacity(),
                registeredCount,
                spotsLeft,
                spotsLeft == 0,
                ended,
                event.getStatus(),
                event.getCodePrefix());
    }
}
