package com.nicojohn.eventreg;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;

import org.junit.jupiter.api.Test;

import com.nicojohn.eventreg.common.util.ManilaTime;

class ManilaTimeTest {

    @Test
    void formats12HourAmPmInCebuTime() {
        Instant morning = ManilaTime.atManilaTime(LocalDate.of(2026, 11, 23), 8, 0);
        Instant night = ManilaTime.atManilaTime(LocalDate.of(2026, 11, 23), 22, 0);

        assertEquals("8:00 AM", ManilaTime.formatTime(morning));
        assertEquals("10:00 PM", ManilaTime.formatTime(night));
        assertEquals("Nov 23, 2026", ManilaTime.formatDate(morning));
    }

    @Test
    void eventDayCheckUsesManilaCalendarDayRegardlessOfUtcClockZone() {
        LocalDate eventDate = LocalDate.of(2026, 11, 23);
        Instant start = ManilaTime.atManilaTime(eventDate, 8, 0);
        Instant end = ManilaTime.atManilaTime(eventDate, 22, 0);

        // 2026-11-23 00:30 UTC+8 is still 2026-11-22 16:30 UTC
        Clock utcClockOnManilaDay = Clock.fixed(ManilaTime.atManilaTime(eventDate, 0, 30), ZoneOffset.UTC);
        Clock nextManilaDay = Clock.fixed(ManilaTime.atManilaTime(eventDate.plusDays(1), 0, 1), ManilaTime.ZONE);

        assertTrue(ManilaTime.isEventDay(start, end, utcClockOnManilaDay));
        assertFalse(ManilaTime.isEventDay(start, end, nextManilaDay));
    }

    @Test
    void detectsPastEventsAfterEndTime() {
        LocalDate today = LocalDate.of(2026, 11, 23);
        Instant end = ManilaTime.atManilaTime(today, 17, 0);

        Clock beforeEnd = Clock.fixed(ManilaTime.atManilaTime(today, 16, 59), ManilaTime.ZONE);
        Clock afterEnd = Clock.fixed(ManilaTime.atManilaTime(today, 17, 1), ManilaTime.ZONE);

        assertFalse(ManilaTime.hasEnded(end, beforeEnd));
        assertTrue(ManilaTime.hasEnded(end, afterEnd));
    }
}
