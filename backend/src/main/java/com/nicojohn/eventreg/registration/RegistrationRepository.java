package com.nicojohn.eventreg.registration;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RegistrationRepository extends JpaRepository<Registration, Long> {

    long countByEventIdAndStatusIn(Long eventId, Collection<RegistrationStatus> statuses);

    @Query("""
            SELECT r.event.id, COUNT(r)
            FROM Registration r
            WHERE r.event.id IN :eventIds AND r.status IN :statuses
            GROUP BY r.event.id
            """)
    List<Object[]> countByEventIdsAndStatusIn(
            @Param("eventIds") Collection<Long> eventIds,
            @Param("statuses") Collection<RegistrationStatus> statuses);

    boolean existsByTicketCode(String ticketCode);

    boolean existsByEventIdAndEmailIgnoreCaseAndStatusIn(
            Long eventId, String email, Collection<RegistrationStatus> statuses);

    @Query("""
            SELECT r
            FROM Registration r
            JOIN FETCH r.event
            WHERE r.ticketCode = :ticketCode
              AND LOWER(r.email) = LOWER(:email)
            """)
    Optional<Registration> findByTicketCodeAndEmailIgnoreCase(
            @Param("ticketCode") String ticketCode,
            @Param("email") String email);
}
