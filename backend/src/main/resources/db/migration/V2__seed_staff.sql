-- V2: Seed demo staff account (Credentials sheet: organizer / Demo@Cebu2026)

INSERT INTO staff_users (name, username, password_hash, role)
VALUES (
    'Demo Organizer',
    'organizer',
    '$2a$10$egNwOY1w/P.xOI1N4I/PXOyAQS9TEg6auvAmf1dE1PWI5D0p0v6.2',
    'ORGANIZER'
)
ON CONFLICT (username) DO NOTHING;
