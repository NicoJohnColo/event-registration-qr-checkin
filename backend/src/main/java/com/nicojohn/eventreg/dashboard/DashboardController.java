package com.nicojohn.eventreg.dashboard;

import java.nio.charset.StandardCharsets;
import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nicojohn.eventreg.dashboard.dto.EventMetricsDto;

@RestController
@RequestMapping("/api/staff/dashboard")
@PreAuthorize("hasRole('ORGANIZER')")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/metrics")
    public List<EventMetricsDto> getMetrics() {
        return dashboardService.getDashboardMetrics();
    }

    @GetMapping("/events/{eventId}/export-csv")
    public ResponseEntity<byte[]> exportCsv(@PathVariable Long eventId) {
        String csv = dashboardService.exportRosterCsv(eventId);
        byte[] bytes = csv.getBytes(StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"event-" + eventId + "-roster.csv\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(bytes);
    }
}
