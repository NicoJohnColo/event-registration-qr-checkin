package com.nicojohn.eventreg.registration;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.nicojohn.eventreg.staff.StaffUser;

public interface RegistrationRepository extends JpaRepository<Registration, Long> {

    long countByEventIdAndStatus(Long eventId, RegistrationStatus status);

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

    @Query("""
            SELECT r
            FROM Registration r
            JOIN FETCH r.event
            WHERE r.ticketCode = :ticketCode
            """)
    Optional<Registration> findByTicketCode(@Param("ticketCode") String ticketCode);

    @Query("""
            SELECT r
            FROM Registration r
            JOIN FETCH r.event
            LEFT JOIN FETCH r.checkedInBy
            WHERE r.event.id = :eventId
              AND r.ticketCode = :ticketCode
            """)
    Optional<Registration> findByEventIdAndTicketCode(
            @Param("eventId") Long eventId,
            @Param("ticketCode") String ticketCode);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            UPDATE Registration r
            SET r.status = com.nicojohn.eventreg.registration.RegistrationStatus.CHECKED_IN,
                r.checkedInAt = :checkedInAt,
                r.checkedInBy = :staffUser
            WHERE r.id = :registrationId
              AND r.status = com.nicojohn.eventreg.registration.RegistrationStatus.CONFIRMED
            """)
    int markCheckedInIfConfirmed(
            @Param("registrationId") Long registrationId,
            @Param("checkedInAt") Instant checkedInAt,
            @Param("staffUser") StaffUser staffUser);

    @Query("""
            SELECT r
            FROM Registration r
            LEFT JOIN FETCH r.checkedInBy
            LEFT JOIN FETCH r.cancelledByStaff
            WHERE r.event.id = :eventId
            ORDER BY r.registeredAt DESC, r.id DESC
            """)
    List<Registration> findAllByEventIdOrderByRegisteredAtDesc(@Param("eventId") Long eventId);

    @Query("""
            SELECT r
            FROM Registration r
            LEFT JOIN FETCH r.checkedInBy
            LEFT JOIN FETCH r.cancelledByStaff
            WHERE r.event.id = :eventId
              AND (LOWER(r.fullName) LIKE :pattern OR LOWER(r.ticketCode) LIKE :pattern OR LOWER(r.email) LIKE :pattern)
            ORDER BY r.registeredAt DESC, r.id DESC
            """)
    List<Registration> searchByEventIdAndNameOrTicketCode(
            @Param("eventId") Long eventId,
            @Param("pattern") String pattern);

    @Query("""
            SELECT r
            FROM Registration r
            WHERE r.event.id = :eventId
              AND r.status = com.nicojohn.eventreg.registration.RegistrationStatus.WAITLISTED
            ORDER BY r.waitlistPosition ASC, r.registeredAt ASC
            """)
    List<Registration> findWaitlistByEventIdOrderByPosition(@Param("eventId") Long eventId);

    @Query("""
            SELECT r
            FROM Registration r
            WHERE r.event.id = :eventId
              AND r.status = com.nicojohn.eventreg.registration.RegistrationStatus.WAITLISTED
            ORDER BY r.waitlistPosition ASC, r.registeredAt ASC
            LIMIT 1
            """)
    Optional<Registration> findFirstWaitlistByEventId(@Param("eventId") Long eventId);

    @Query("""
            SELECT COALESCE(MAX(r.waitlistPosition), 0)
            FROM Registration r
            WHERE r.event.id = :eventId
              AND r.status = com.nicojohn.eventreg.registration.RegistrationStatus.WAITLISTED
            """)
    int findMaxWaitlistPosition(@Param("eventId") Long eventId);
}
