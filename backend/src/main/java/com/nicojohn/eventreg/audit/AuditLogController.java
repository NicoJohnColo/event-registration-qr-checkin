package com.nicojohn.eventreg.audit;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.nicojohn.eventreg.audit.dto.AuditLogResponse;

/** Organizer-only endpoint exposing the operational audit trail. */
@RestController
@RequestMapping("/api/staff/audit-logs")
@PreAuthorize("hasRole('ORGANIZER')")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public List<AuditLogResponse> list(
            @RequestParam(name = "action", required = false) String action,
            @RequestParam(name = "q", required = false) String q,
            @RequestParam(name = "limit", required = false) Integer limit) {
        return auditLogService.listRecentLogs(action, q, limit);
    }
}
