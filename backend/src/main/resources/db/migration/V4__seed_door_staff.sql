-- V4: Seed demo DOOR_STAFF account (doorstaff / Door@Cebu2026) and audit log action index

INSERT INTO staff_users (name, username, password_hash, role)
VALUES (
    'Demo Door Staff',
    'doorstaff',
    '$2a$10$btND1kXv/2RzSlakhhzGkeomBg2KjE0kcI.8TXYNTd.DJRX3FmTTq',
    'DOOR_STAFF'
)
ON CONFLICT (username) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs (action);
