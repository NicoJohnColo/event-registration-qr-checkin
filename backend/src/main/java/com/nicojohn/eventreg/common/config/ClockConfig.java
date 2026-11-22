package com.nicojohn.eventreg.common.config;

import java.time.Clock;
import java.time.ZoneId;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Provides a single Clock pinned to Asia/Manila (Cebu time, UTC+8)
 * so time-based rules (event day, display formatting) are consistent and testable.
 */
@Configuration
public class ClockConfig {

    @Bean
    public ZoneId appZone(@Value("${app.timezone}") String timezone) {
        return ZoneId.of(timezone);
    }

    @Bean
    public Clock clock(ZoneId appZone) {
        return Clock.system(appZone);
    }
}
