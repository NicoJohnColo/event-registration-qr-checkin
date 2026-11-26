package com.nicojohn.eventreg.dashboard.dto;

import java.time.Instant;

import com.nicojohn.eventreg.event.EventStatus;

public record EventMetricsDto(
        Long eventId,
        String title,
        EventStatus status,
        String codePrefix,
        String venue,
        Instant startsAt,
        Instant endsAt,
        int capacity,
        long confirmedCount,
        long waitlistCount,
        long cancelledCount,
        long checkedInCount,
        Long noShowCount,
        boolean isStarted,
        boolean isEnded
) {}
