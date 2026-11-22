package com.nicojohn.eventreg.registration;

import java.time.Instant;

import com.nicojohn.eventreg.event.Event;
import com.nicojohn.eventreg.staff.StaffUser;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "registrations")
public class Registration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(name = "full_name", nullable = false, length = 120)
    private String fullName;

    @Column(nullable = false, length = 254)
    private String email;

    @Column(nullable = false, length = 11)
    private String mobile;

    @Column(name = "ticket_code", nullable = false, unique = true, length = 20)
    private String ticketCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RegistrationStatus status = RegistrationStatus.CONFIRMED;

    @Column(name = "registered_at", nullable = false, updatable = false)
    private Instant registeredAt;

    @Column(name = "checked_in_at")
    private Instant checkedInAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "checked_in_by")
    private StaffUser checkedInBy;

    protected Registration() {}

    public Registration(
            Event event,
            String fullName,
            String email,
            String mobile,
            String ticketCode,
            RegistrationStatus status,
            Instant registeredAt) {
        this.event = event;
        this.fullName = fullName;
        this.email = email;
        this.mobile = mobile;
        this.ticketCode = ticketCode;
        this.status = status;
        this.registeredAt = registeredAt;
    }

    public Long getId() { return id; }
    public Event getEvent() { return event; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public String getMobile() { return mobile; }
    public String getTicketCode() { return ticketCode; }
    public RegistrationStatus getStatus() { return status; }
    public Instant getRegisteredAt() { return registeredAt; }
    public Instant getCheckedInAt() { return checkedInAt; }
    public StaffUser getCheckedInBy() { return checkedInBy; }
}
