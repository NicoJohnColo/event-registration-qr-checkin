package com.nicojohn.eventreg.audit;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(String entityType, Long entityId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM AuditLog a WHERE a.entityType = :entityType AND a.entityId IN :entityIds")
    void deleteByEntityTypeAndEntityIdIn(
            @Param("entityType") String entityType,
            @Param("entityIds") Collection<Long> entityIds);
}
