package com.nicojohn.eventreg.common.util;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

/**
 * All date/time conversions and formatting pinned to Asia/Manila (Cebu time, UTC+8)
 * with 12-hour AM/PM display as required by Rule R5.
 */
public final class ManilaTime {

    public static final ZoneId ZONE = ZoneId.of("Asia/Manila");

    private static final DateTimeFormatter TIME_12H =
            DateTimeFormatter.ofPattern("h:mm a", Locale.ENGLISH);
    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("MMM d, yyyy", Locale.ENGLISH);
    private static final DateTimeFormatter DATE_TIME_12H =
            DateTimeFormatter.ofPattern("MMM d, yyyy, h:mm a", Locale.ENGLISH);

    private ManilaTime() {}

    /** Converts a Cebu local date and 24h hour/minute into a UTC Instant. */
    public static Instant atManilaTime(LocalDate date, int hour, int minute) {
        return ZonedDateTime.of(date.getYear(), date.getMonthValue(), date.getDayOfMonth(),
                hour, minute, 0, 0, ZONE).toInstant();
    }

    /** True if today in Asia/Manila falls within the event's Manila calendar dates (inclusive). */
    public static boolean isEventDay(Instant startsAt, Instant endsAt, Clock clock) {
        LocalDate today = LocalDate.now(clock.withZone(ZONE));
        LocalDate startDate = startsAt.atZone(ZONE).toLocalDate();
        LocalDate endDate = endsAt.atZone(ZONE).toLocalDate();
        return !today.isBefore(startDate) && !today.isAfter(endDate);
    }

    public static boolean hasEnded(Instant endsAt, Clock clock) {
        return Instant.now(clock).isAfter(endsAt);
    }

    public static String formatTime(Instant instant) {
        return instant.atZone(ZONE).format(TIME_12H);
    }

    public static String formatDate(Instant instant) {
        return instant.atZone(ZONE).format(DATE_FMT);
    }

    public static String formatDateTime(Instant instant) {
        return instant.atZone(ZONE).format(DATE_TIME_12H);
    }
}
