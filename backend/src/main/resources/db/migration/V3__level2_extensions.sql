-- V3: Level 2 extensions: Waitlist, Cancellations, Undo Check-in, and Audit Logs

-- 1. Extend registration status constraint to support WAITLISTED and CANCELLED
ALTER TABLE registrations DROP CONSTRAINT chk_reg_status;
ALTER TABLE registrations ADD CONSTRAINT chk_reg_status 
    CHECK (status IN ('CONFIRMED', 'CHECKED_IN', 'WAITLISTED', 'CANCELLED'));

-- 2. Add waitlist position and cancellation columns
ALTER TABLE registrations ADD COLUMN waitlist_position INTEGER;
ALTER TABLE registrations ADD COLUMN cancelled_at TIMESTAMPTZ;
ALTER TABLE registrations ADD COLUMN cancelled_by_staff_id BIGINT REFERENCES staff_users (id);

-- 3. Partial unique index for waitlist position per event
CREATE UNIQUE INDEX uq_reg_event_waitlist_pos
    ON registrations (event_id, waitlist_position)
    WHERE status = 'WAITLISTED' AND waitlist_position IS NOT NULL;

-- 4. Audit Log Table (Tracking check-ins, undo check-ins, promotions, cancellations, event edits)
CREATE TABLE audit_logs (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    action      VARCHAR(50)  NOT NULL,
    entity_type VARCHAR(50)  NOT NULL,
    entity_id   BIGINT       NOT NULL,
    performed_by_id BIGINT   REFERENCES staff_users (id),
    details     TEXT         NOT NULL DEFAULT '',
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_entity ON audit_logs (entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs (created_at DESC);
