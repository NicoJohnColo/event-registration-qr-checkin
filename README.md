# EventRegister — Cebu Event Registration & QR Check-in

A mobile-first, full-stack event registration, waitlist management, and door QR check-in application built for Cebu tech and community events (**Asia/Manila · UTC+8**). Attendees browse published events, reserve a free seat or join the waitlist when capacity is full, receive an instant QR pass, retrieve or self-cancel passes without leaking personal details, and verify entry at the door. Organizers manage draft/published/closed/deleted event lifecycles, promote waitlisted attendees, undo mistaken check-ins with full audit trails, monitor live operations metrics, and export UTF-8 roster CSVs.

---

## 1. Level Reached

- **Current Baseline:** **Level 2 — Intermediate (`10 / 10` Level 2 Checks Passing: `L2-01`–`L2-10`, plus `12 / 12` Level 1 Core Checks `L1-01`–`L1-12`)**
- **Target Level:** **Level 2 Complete** (camera QR scanner & outbound email remain scoped for Level 3)

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Java 21+ · Spring Boot 4.2.0 · Spring Security (Stateless JWT `HmacSHA256` + BCrypt, Role-based `ORGANIZER` / `DOOR_STAFF`) · Spring Data JPA / Hibernate 7 · Bean Validation · Flyway |
| **Database** | PostgreSQL 17 (Supabase Session Pooler) |
| **Frontend** | React 19 · Vite 6 · TypeScript 5 · Tailwind CSS v4 · React Router 7 · TanStack Query v5 · React Hook Form + Zod · `qrcode.react` · `lucide-react` |
| **Time Zone** | Enforced server-side and client-side in `Asia/Manila` (`UTC+8`), rendered in 12-hour `AM/PM` format |

---

## 3. Setup & Run Instructions

### Prerequisites
- **Java 21+** with Maven Wrapper (`./mvnw` / `.\mvnw.cmd`)
- **Node.js 20+** and `npm`
- **PostgreSQL 15+** (or a Supabase PostgreSQL project)

### Step 1 — Configure Environment Variables
Copy `.env.example` to `.env` in the repository root and fill in your PostgreSQL / Supabase connection credentials and JWT secret:

```powershell
Copy-Item .env.example .env
```

Required variables in `.env`:

| Variable | Description | Example |
|---|---|---|
| `SPRING_DATASOURCE_URL` | JDBC PostgreSQL connection URL | `jdbc:postgresql://<pooler-host>:5432/postgres` |
| `SPRING_DATASOURCE_USERNAME` | Database username | `postgres.<project-ref>` |
| `SPRING_DATASOURCE_PASSWORD` | Database password | `your-db-password` |
| `JWT_SECRET` | HMAC-SHA256 signing secret (≥32 chars) | `change-me-long-random-secret-key-at-least-32-chars` |
| `CORS_ALLOWED_ORIGIN` | Allowed frontend origin | `http://localhost:5173` |
| `VITE_API_URL` | Backend base URL for Vite frontend | `http://localhost:8080` |
| `APP_TIMEZONE` | Default server timezone | `Asia/Manila` |

### Step 2 — Start the Backend (`http://localhost:8080`)
Flyway migrations (`V1__init.sql`, `V2__seed_staff.sql`, `V3__level2_extensions.sql`) and the idempotent relative-date `DataSeeder` run automatically on startup.

```powershell
cd backend
.\mvnw.cmd -DskipTests package
java -Xms128m -Xmx384m -jar target\eventreg-0.0.1-SNAPSHOT.jar
```

Verify backend health:
```powershell
curl http://localhost:8080/api/health
# {"status":"UP","timezone":"Asia/Manila","timestamp":"..."}
```

### Step 3 — Start the Frontend (`http://localhost:5173`)
```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser (or run `npm run dev -- --host` to test on a phone over local Wi-Fi).

### Step 4 — Verification Commands
```powershell
# Backend unit & domain tests
cd backend ; .\mvnw.cmd test

# Frontend TypeScript & Vite production build
cd frontend ; npm run build
```

---

## 4. Seed Data & Demo Staff Login

### How Seed Data Loads
1. **`V1__init.sql` & `V3__level2_extensions.sql` (Flyway):** Creates `staff_users`, `events`, `registrations` (including `WAITLISTED` / `CANCELLED` states and waitlist position constraints), and `audit_logs`.
2. **`V2__seed_staff.sql` (Flyway):** Seeds the BCrypt-hashed organizer account.
3. **`DataSeeder.java` (Spring `ApplicationRunner`):** Seeds 4 published events (`S1`–`S4`) with dates kept relative to **today in `Asia/Manila`**:
   - **`S1` — Cebu Dev Meetup 2026 (`CDM`)**: Scheduled **Today** (`8:00 AM – 11:59 PM` PHT), capacity `30`, `3` seeded confirmed attendees (`27` spots left).
   - **`S2` — Cebu Web Design Workshop (`CWD`)**: Scheduled **Today + 7 days** (`1:00 PM – 5:00 PM` PHT), capacity `50`, `0` registrations.
   - **`S3` — Cebu Startup Pitch Night (`CSP`)**: Scheduled **Today + 3 days** (`6:00 PM – 9:00 PM` PHT), capacity `5`, `5` seeded attendees (**Full · Waitlist Open**).
   - **`S4` — Cebu Code Camp (`CCC`)**: Scheduled **Today − 7 days** (`9:00 AM – 3:00 PM` PHT), capacity `40`, marked **Ended**.

### Seeded Staff Credentials (`/staff/login`)

| Role | Username | Password | Access |
|---|---|---|---|
| **Organizer** (Demo Login) | `organizer` | `Demo@Cebu2026` | Operations Dashboard & CSV Export, Manage Events (Create/Edit/Publish/Close/Delete), Door Check-In + Undo, Attendee Roster + Promote/Cancel |

*(The schema and JWT security filter also support `DOOR_STAFF` accounts for door check-in, undo check-in, and read-only roster access without event CRUD or organizer cancel/promote permissions.)*

---

## 5. Data Model & Integrity Rules

### Database Schema (`V1__init.sql` + `V3__level2_extensions.sql`)

| Table | Key Columns & Constraints |
|---|---|
| `staff_users` | `id`, `name`, `username` (`UNIQUE`), `password_hash` (BCrypt), `role` (`CHECK IN ('ORGANIZER', 'DOOR_STAFF')`), `created_at` |
| `events` | `id`, `title`, `description`, `venue`, `code_prefix`, `starts_at` (`TIMESTAMPTZ`), `ends_at` (`CHECK ends_at > starts_at`), `capacity` (`CHECK capacity >= 1`), `status` (`CHECK IN ('DRAFT', 'PUBLISHED', 'CLOSED')`), `created_at` |
| `registrations` | `id`, `event_id` (`FK -> events`), `full_name`, `email`, `mobile`, `ticket_code` (`UNIQUE`), `status` (`CHECK IN ('CONFIRMED', 'WAITLISTED', 'CHECKED_IN', 'CANCELLED')`), `waitlist_position`, `registered_at`, `checked_in_at`, `checked_in_by` (`FK -> staff_users`), `cancelled_at`, `cancelled_by_staff_id` (`FK -> staff_users`) |
| `audit_logs` | `id`, `action`, `entity_type`, `entity_id`, `performed_by_id` (`FK -> staff_users`), `details`, `created_at` |

### Concurrency & Security Guarantees
- **Last-Spot Lock & Waitlist Queuing (`R1`, `L2-04`):** `RegistrationService.register()` acquires a `PESSIMISTIC_WRITE` row lock (`SELECT ... FOR UPDATE`) on the `Event` row inside `@Transactional` before counting `CONFIRMED + CHECKED_IN` registrations; once full, new registrants automatically receive `WAITLISTED` status with a unique consecutive `waitlist_position`.
- **Duplicate Email Prevention (`R2`):** Enforced in application logic and via partial unique index `uq_reg_active_email` on `(event_id, lower(email))` while active (`CONFIRMED`, `CHECKED_IN`, `WAITLISTED`), allowing re-registration only if previously `CANCELLED`.
- **Atomic Door Check-In & Undo Audit (`R3`, `L2-05`, `L2-06`, `L2-09`):** Rejects `WAITLISTED` (`"On waitlist — not confirmed"`), `CANCELLED` (`"Cancelled"`), wrong-day, and cross-event tickets. Valid check-ins use a conditional `UPDATE ... WHERE status = 'CONFIRMED'`; `POST /api/checkin/events/{eventId}/undo` reverts to `CONFIRMED` and logs an `UNDO_CHECK_IN` `AuditLog` with staff identity and timestamp.
- **Privacy-Preserving Lookup & Self-Cancel (`R11`, `L2-06`):** Both `POST /api/tickets/lookup` and `POST /api/tickets/cancel` require matching `ticketCode` + registered `email`, returning uniform `404` `"Ticket not found"` on mismatch and blocking cancellation once `CHECKED_IN` (`400`, `L2-08`).

---

## 6. Completed Features & Scope

### Completed — Level 1 Core
- Public events directory (`/`, `/events`) and details (`/events/:id`) with server-computed capacity, `Asia/Manila` 12-hour schedules, search, and filter chips.
- Registration form (`/events/:id/register`) with Zod + Bean Validation, PH mobile format validation (`09XXXXXXXXX`), QR boarding pass (`/ticket/:code`), and email-guarded retrieval (`/lookup`).
- Stateless JWT staff login (`/staff/login`) and Door Check-In (`/staff/check-in`) with color + icon + text outcome banners and shift scan history.

### Completed — Level 2 Intermediate
- **Event Management (`/staff/events`):** Create, edit, publish drafts (`DRAFT` -> `PUBLISHED` -> `CLOSED`), validate schedule order (`endsAt > startsAt`) and active capacity floors, and permanently **Delete** events (`DELETE /api/staff/events/{id}`) with registration cleanup.
- **Waitlist Queue & FIFO Promotion (`L2-04`, `L2-05`, `L2-07`):** Full active events offer **Join Waitlist**, issue numbered `#X on the waitlist` passes, block premature door entry, and let Organizers promote `#1` cleanly once seats open (auto-compacting remaining positions).
- **Self & Staff Cancellation (`L2-06`, `L2-08`):** Confirmed/waitlisted attendees can cancel directly from their ticket pass (`POST /api/tickets/cancel`), and Organizers can cancel registrations from the roster (`POST /api/staff/registrations/{id}/cancel`), releasing spots and rejecting cancellation on already checked-in passes.
- **Undo Check-In (`L2-09`):** Door staff and Organizers can undo check-ins from both the Door Check-In banner/scan list and Attendee Roster (`POST /api/checkin/events/{eventId}/undo`), with `UNDO_CHECK_IN` audit records.
- **Operations Dashboard & CSV Export (`/staff/dashboard`, `L2-10`):** Real-time KPI summary strip, dual seat/check-in bars, SVG status donut, Manila-time no-show tracking, mobile snap-scroll carousel, desktop fixed sky sidebar shell, and UTF-8 CSV download (`GET /api/staff/dashboard/events/{id}/export-csv`).

### Scoped for Level 3
- Camera-based live QR scanning (`html5-qrcode`) and automated confirmation / promotion email notifications.

---

## 7. Official Level 1 Acceptance Baseline (`L1-01`–`L1-12`)

| ID | Acceptance Check | Status |
|---|---|---|
| **L1-01** – **L1-06** | Mobile QR registration, QR code payload parity, email+code ticket lookup, privacy-safe 404, duplicate email guard, multi-field validation | **Pass** |
| **L1-07** – **L1-12** | Full-event state (extended to Waitlist in L2), unauthenticated staff redirect (`401`), green Check-In / yellow Already Checked In / red Invalid, roster totals | **Pass** |

---

## 8. Official Level 2 Acceptance Checklist (`L2-01`–`L2-10`)

| ID | Acceptance Check | Status | Verification |
|---|---|---|---|
| **L2-01** | Draft event hidden from attendees; visible once published | **Pass** | Verified in `EventServiceTest` & live browser |
| **L2-02** | Event with end time before start time is blocked | **Pass** | Rejected (`400`) in `EventServiceTest`, `EventFormModal`, & API |
| **L2-03** | Lowering capacity below active registered count is blocked with descriptive message | **Pass** | Rejected (`400`) in `EventServiceTest`, `EventFormModal`, & API |
| **L2-04** | Registering for a full event places attendee on waitlist with exact position | **Pass** | Verified in `RegistrationServiceTest` (`WAITLISTED #1`, `#2`) & API |
| **L2-05** | Scanning waitlisted ticket shows *"On waitlist — not confirmed"* | **Pass** | Verified in `CheckInServiceTest` (`CheckInOutcome.WAITLISTED`) & API |
| **L2-06** | Cancelling confirmed ticket frees spot; scanning cancelled ticket shows *"Cancelled"* | **Pass** | Verified in `RegistrationServiceTest`, `CheckInServiceTest`, & `/api/tickets/cancel` |
| **L2-07** | Promoting #1 waitlist attendee allows successful check-in and compacts queue | **Pass** | Verified in `RegistrationServiceTest` & `/api/staff/events/{id}/promote-waitlist` |
| **L2-08** | Attempting to cancel a checked-in registration is rejected | **Pass** | Rejected (`400`) in `RegistrationServiceTest` & both cancel endpoints |
| **L2-09** | Undoing check-in permits re-checking-in and logs staff identity & timestamp | **Pass** | Verified in `CheckInServiceTest` (`UNDO_CHECK_IN` AuditLog) & `/api/checkin/events/{id}/undo` |
| **L2-10** | Dashboard metrics match database counts; CSV export downloads cleanly | **Pass** | `DashboardService` metrics & UTF-8 CSV verified live (`HTTP 200`) |
