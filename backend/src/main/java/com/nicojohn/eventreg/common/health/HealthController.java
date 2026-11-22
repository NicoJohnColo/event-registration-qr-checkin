package com.nicojohn.eventreg.common.health;

import java.sql.Connection;
import java.time.Clock;
import java.time.ZonedDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

import javax.sql.DataSource;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** Public health check confirming backend, database, and Asia/Manila clock are ready. */
@RestController
public class HealthController {

    private final DataSource dataSource;
    private final Clock clock;

    public HealthController(DataSource dataSource, Clock clock) {
        this.dataSource = dataSource;
        this.clock = clock;
    }

    @GetMapping("/api/health")
    public ResponseEntity<Map<String, Object>> health() {
        boolean dbUp = isDatabaseUp();
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", dbUp ? "UP" : "DOWN");
        body.put("database", dbUp ? "UP" : "DOWN");
        body.put("zone", clock.getZone().getId());
        body.put("serverTime", ZonedDateTime.now(clock).toString());
        return ResponseEntity.status(dbUp ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE).body(body);
    }

    private boolean isDatabaseUp() {
        try (Connection c = dataSource.getConnection()) {
            return c.isValid(2);
        } catch (Exception e) {
            return false;
        }
    }
}
