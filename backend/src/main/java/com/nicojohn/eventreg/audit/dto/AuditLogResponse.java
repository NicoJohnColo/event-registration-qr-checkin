package com.nicojohn.eventreg.audit.dto;

import java.time.Instant;

import com.nicojohn.eventreg.audit.AuditLog;

/** Immutable API projection of a persisted staff or attendee audit event. */
public record AuditLogResponse(
        Long id,
        String action,
        String entityType,
        Long entityId,
        Long performedById,
        String performedByName,
        String performedByRole,
        String details,
        Instant createdAt
) {
    public static AuditLogResponse from(AuditLog log) {
        var actor = log.getPerformedBy();
        return new AuditLogResponse(
                log.getId(),
                log.getAction(),
                log.getEntityType(),
                log.getEntityId(),
                actor != null ? actor.getId() : null,
                actor != null ? actor.getName() : "Attendee (Self-Service)",
                actor != null ? actor.getRole().name() : "ATTENDEE",
                log.getDetails(),
                log.getCreatedAt()
        );
    }
}
