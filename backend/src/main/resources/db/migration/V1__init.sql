-- V1: Level 1 core schema. All timestamps are TIMESTAMPTZ (UTC instants; rendered in Asia/Manila).

CREATE TABLE staff_users (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    role          VARCHAR(20)  NOT NULL DEFAULT 'ORGANIZER',
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT chk_staff_role CHECK (role IN ('ORGANIZER', 'DOOR_STAFF'))
);

CREATE TABLE events (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title       VARCHAR(150) NOT NULL,
    description TEXT         NOT NULL DEFAULT '',
    venue       VARCHAR(200) NOT NULL,
    starts_at   TIMESTAMPTZ  NOT NULL,
    ends_at     TIMESTAMPTZ  NOT NULL,
    capacity    INTEGER      NOT NULL,
    status      VARCHAR(20)  NOT NULL DEFAULT 'PUBLISHED',
    code_prefix VARCHAR(5)   NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT chk_event_capacity CHECK (capacity >= 1),
    CONSTRAINT chk_event_times    CHECK (ends_at > starts_at),
    CONSTRAINT chk_event_status   CHECK (status IN ('DRAFT', 'PUBLISHED', 'CLOSED'))
);

CREATE TABLE registrations (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    event_id      BIGINT       NOT NULL REFERENCES events (id),
    full_name     VARCHAR(120) NOT NULL,
    email         VARCHAR(254) NOT NULL,
    mobile        VARCHAR(11)  NOT NULL,
    ticket_code   VARCHAR(20)  NOT NULL,
    status        VARCHAR(20)  NOT NULL DEFAULT 'CONFIRMED',
    registered_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    checked_in_at TIMESTAMPTZ,
    checked_in_by BIGINT REFERENCES staff_users (id),
    CONSTRAINT chk_reg_status CHECK (status IN ('CONFIRMED', 'CHECKED_IN')),
    CONSTRAINT uq_reg_ticket_code UNIQUE (ticket_code)
);

-- Rule R2: one active registration per email per event (case-insensitive).
CREATE UNIQUE INDEX uq_reg_active_email
    ON registrations (event_id, lower(email))
    WHERE status IN ('CONFIRMED', 'CHECKED_IN');

CREATE INDEX idx_reg_event_status ON registrations (event_id, status);
