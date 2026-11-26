package com.nicojohn.eventreg.event;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "events")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, columnDefinition = "text")
    private String description = "";

    @Column(nullable = false, length = 200)
    private String venue;

    @Column(name = "starts_at", nullable = false)
    private Instant startsAt;

    @Column(name = "ends_at", nullable = false)
    private Instant endsAt;

    @Column(nullable = false)
    private int capacity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EventStatus status = EventStatus.PUBLISHED;

    @Column(name = "code_prefix", nullable = false, length = 5)
    private String codePrefix;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected Event() {}

    public Event(
            String title,
            String description,
            String venue,
            Instant startsAt,
            Instant endsAt,
            int capacity,
            EventStatus status,
            String codePrefix,
            Instant createdAt) {
        this.title = title;
        this.description = description != null ? description : "";
        this.venue = venue;
        this.startsAt = startsAt;
        this.endsAt = endsAt;
        this.capacity = capacity;
        this.status = status;
        this.codePrefix = codePrefix;
        this.createdAt = createdAt != null ? createdAt : Instant.now();
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getVenue() { return venue; }
    public Instant getStartsAt() { return startsAt; }
    public Instant getEndsAt() { return endsAt; }
    public int getCapacity() { return capacity; }
    public EventStatus getStatus() { return status; }
    public String getCodePrefix() { return codePrefix; }
    public Instant getCreatedAt() { return createdAt; }

    public void updateSchedule(Instant startsAt, Instant endsAt) {
        this.startsAt = startsAt;
        this.endsAt = endsAt;
    }

    public void updateDetails(String title, String description, String venue, Instant startsAt, Instant endsAt, int capacity, EventStatus status) {
        this.title = title;
        this.description = description != null ? description : "";
        this.venue = venue;
        this.startsAt = startsAt;
        this.endsAt = endsAt;
        this.capacity = capacity;
        this.status = status;
    }

    public void close() {
        this.status = EventStatus.CLOSED;
    }

    public void publish() {
        this.status = EventStatus.PUBLISHED;
    }
}
