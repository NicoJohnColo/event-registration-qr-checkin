package com.nicojohn.eventreg.audit;

import java.util.List;
import java.util.Locale;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nicojohn.eventreg.audit.dto.AuditLogResponse;

/** Queries audit trail entries for organizer oversight and operational diagnostics. */
@Service
public class AuditLogService {

    private static final int DEFAULT_LIMIT = 150;
    private static final int MAX_LIMIT = 300;

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponse> listRecentLogs(String action, String query, Integer limit) {
        int safeLimit = limit == null ? DEFAULT_LIMIT : Math.max(1, Math.min(limit, MAX_LIMIT));
        PageRequest page = PageRequest.of(0, safeLimit);

        List<AuditLog> rows = (action != null && !action.isBlank())
                ? auditLogRepository.findRecentByActionWithActor(action.trim().toUpperCase(Locale.ROOT), page)
                : auditLogRepository.findRecentWithActor(page);

        String cleanQuery = query != null ? query.trim().toLowerCase(Locale.ROOT) : "";
        return rows.stream()
                .map(AuditLogResponse::from)
                .filter(item -> matchesQuery(item, cleanQuery))
                .toList();
    }

    private boolean matchesQuery(AuditLogResponse item, String cleanQuery) {
        if (cleanQuery.isEmpty()) {
            return true;
        }
        return item.action().toLowerCase(Locale.ROOT).contains(cleanQuery)
                || item.entityType().toLowerCase(Locale.ROOT).contains(cleanQuery)
                || item.performedByName().toLowerCase(Locale.ROOT).contains(cleanQuery)
                || item.details().toLowerCase(Locale.ROOT).contains(cleanQuery)
                || String.valueOf(item.entityId()).contains(cleanQuery);
    }
}
