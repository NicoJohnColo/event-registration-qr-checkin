# EventRegister — Cebu Event Registration & QR Check-in

A mobile-first, full-stack event registration and door QR check-in application built for Cebu tech and community events (**Asia/Manila · UTC+8**). Attendees browse events, reserve a free seat with Philippine mobile validation (`09XXXXXXXXX`), receive an instant QR boarding pass, and retrieve their pass anytime without leaking personal details. Organizers and door staff sign in via BCrypt + JWT authentication to verify tickets at the entrance and monitor live attendance rosters.

---

## 1. Level Reached

- **Current Baseline:** **Level 1 — Core (12 / 12 Acceptance Checks Passing, `TC-101`–`TC-142` Verified)**
- **Target Level:** **Level 2 — Intermediate** (locking Level 1 first before starting Level 2 features)

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Java 21 · Spring Boot 4.2.0 · Spring Security (Stateless JWT `HmacSHA256` + BCrypt) · Spring Data JPA / Hibernate 7 · Bean Validation · Flyway |
| **Database** | PostgreSQL 17 (Supabase Session Pooler) |
| **Frontend** | React 19 · Vite 6 · TypeScript 5 · Tailwind CSS v4 · React Router 7 · TanStack Query v5 · React Hook Form + Zod · `qrcode.react` · `lucide-react` |
| **Time Zone** | Enforced server-side and client-side in `Asia/Manila` (`UTC+8`), rendered in 12-hour `AM/PM` format |

---

## 3. Setup & Run Instructions

### Prerequisites
- **Java 21+** (or JDK 21+ with Maven Wrapper `./mvnw` / `.\mvnw.cmd`)
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
| `DB_URL` | JDBC PostgreSQL connection URL | `jdbc:postgresql://aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres` |
| `DB_USER` | Database username | `postgres.yourprojectref` |
| `DB_PASSWORD` | Database password | `your-db-password` |
| `JWT_SECRET` | HMAC-SHA256 signing secret (≥32 chars) | `change-me-to-a-long-random-secret-key-at-least-32-chars` |
| `JWT_EXP_HOURS` | Staff JWT token validity in hours | `24` |
| `CORS_ALLOWED_ORIGINS` | Allowed frontend origin(s) | `http://localhost:5173` |
| `VITE_API_URL` | Backend base URL for Vite frontend | `http://localhost:8080` |

### Step 2 — Start the Backend (`http://localhost:8080`)
Flyway migrations (`V1__init.sql`, `V2__seed_staff.sql`) and the idempotent relative-date `DataSeeder` run automatically on startup.

```powershell
cd backend
$env:MAVEN_OPTS="-Xms128m -Xmx512m"; .\mvnw.cmd spring-boot:run
```

*(Or build and run the packaged JAR for lower memory usage)*:
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

---

## 4. Seed Data & Demo Staff Logins

### How Seed Data Loads
1. **`V1__init.sql` (Flyway):** Creates `staff_users`, `events`, and `registrations` tables with strict `CHECK` constraints and the partial unique index `uq_reg_active_email` on `(event_id, lower(email))` where `status IN ('CONFIRMED', 'CHECKED_IN', 'WAITLISTED')`.
2. **`V2__seed_staff.sql` (Flyway):** Seeds the BCrypt-hashed demo staff accounts (`$2a$10$...`).
3. **`DataSeeder.java` (Spring `ApplicationRunner`):** Seeds 4 events (`S1`–`S4`) with dates computed **relative to today in `Asia/Manila`** so the event-day check-in rule (`R3`) always works out of the box for any reviewer on any day:
   - **`S1` — Cebu Dev Meetup 2026 (`CDM`)**: Scheduled **Today** (`8:00 AM – 10:00 PM` PHT), capacity `30`, pre-seeded with `3` confirmed attendees so it starts with open seats and can be tested immediately on the Door Check-In screen.
   - **`S2` — Cebu Web Design Workshop (`CWD`)**: Scheduled **Today + 7 days** (`1:00 PM – 5:00 PM` PHT), capacity `50`, `0` registrations (used for cross-event check-in rejection tests).
   - **`S3` — Cebu Startup Pitch Night (`CSP`)**: Scheduled **Today + 3 days** (`6:00 PM – 9:00 PM` PHT), capacity `5`, pre-seeded with `5` confirmed attendees (**Full · 0 of 5 spots left**).
   - **`S4` — Cebu Code Camp (`CCC`)**: Scheduled **Today − 7 days** (`9:00 AM – 3:00 PM` PHT), capacity `40`, marked **Ended** with registration closed.

### Demo Staff Credentials (`/staff/login`)

| Role | Username | Password | Access |
|---|---|---|---|
| **Organizer** (Primary Demo Login) | `organizer` | `Demo@Cebu2026` | Door Check-In, Attendee Roster, Event Management |
| **Door Staff** | `doorstaff` | `Door@Cebu2026` | Door Check-In, Attendee Roster |

---

## 5. Data Model & Integrity Rules

### Database Schema (`V1__init.sql`)

| Table | Key Columns & Constraints |
|---|---|
| `staff_users` | `id`, `name`, `username` (`UNIQUE`), `password_hash` (BCrypt), `role` (`CHECK IN ('ORGANIZER', 'DOOR_STAFF')`), `created_at` |
| `events` | `id`, `title`, `description`, `venue`, `code_prefix`, `starts_at` (`TIMESTAMPTZ`), `ends_at` (`CHECK ends_at > starts_at`), `capacity` (`CHECK capacity >= 1`), `status` (`CHECK IN ('DRAFT', 'PUBLISHED', 'CLOSED')`), `created_by`, `created_at`, `updated_at` |
| `registrations` | `id`, `event_id` (`FK -> events`), `full_name`, `email`, `mobile`, `ticket_code` (`UNIQUE`), `status` (`CHECK IN ('CONFIRMED', 'WAITLISTED', 'CHECKED_IN', 'CANCELLED')`), `registered_at`, `checked_in_at`, `checked_in_by` (`FK -> staff_users`), `undone_at`, `undone_by`, `cancelled_at` |

### Concurrency & Security Guarantees
- **Last-Spot Race Protection (`R1`, `TC-117`):** `RegistrationService.register()` acquires a `PESSIMISTIC_WRITE` row lock (`SELECT ... FOR UPDATE`) on the `Event` row inside a single `@Transactional` boundary before counting `CONFIRMED + CHECKED_IN` registrations, guaranteeing capacity is never exceeded under concurrent requests.
- **Case-Insensitive Duplicate Email Prevention (`R2`, `TC-113`, `TC-114`):** Enforced both in application logic and at the database level via `CREATE UNIQUE INDEX uq_reg_active_email ON registrations (event_id, lower(email)) WHERE status IN ('CONFIRMED', 'CHECKED_IN', 'WAITLISTED')`.
- **Atomic Door Check-In (`R3`, `R4`, `R7`, `TC-130`–`TC-136`):** `CheckInService` verifies that the ticket belongs to the selected event, checks its status, validates that today is the event day in `Asia/Manila`, and executes an atomic conditional update (`UPDATE registrations SET status = 'CHECKED_IN', ... WHERE id = :id AND status = 'CONFIRMED'`). If a second scan arrives simultaneously, `updated == 0` reloads the record and returns `ALREADY_CHECKED_IN` with the original check-in timestamp.
- **Privacy-Preserving Ticket Lookup (`R11`, `TC-122`, `TC-123`):** `POST /api/tickets/lookup` requires both `ticketCode` and `email`. Whether the code is unknown or the email does not match, the server returns the exact same HTTP `404` `"Ticket not found"` payload with zero personal or event details leaked.

---

## 6. Completed Features & Known Limitations

### Completed (Level 1 Core)
- Public events directory (`/`, `/events`) and event details (`/events/:id`) with server-computed `spotsLeft`, `full`, and `ended` states, search, filter chips, and 12-hour Cebu (`Asia/Manila`) schedules.
- Attendee registration (`/events/:id/register`) with client-side Zod + server-side Bean Validation (all fields required, valid email, 11-digit PH mobile starting with `09`), simultaneous multi-field error display, duplicate email guard, and locked server capacity re-check.
- Instant digital boarding pass (`/ticket/:code`) with high-contrast SVG QR code (`qrcode.react`) encoding the exact ticket code, one-tap copy, and direct-URL email verification guard.
- Public ticket retrieval (`/lookup`) by ticket code + registered email with case/whitespace normalization and uniform `404` response on mismatch.
- Staff authentication (`/staff/login`) with BCrypt password verification, stateless HMAC-SHA256 JWT tokens, `ProtectedRoute` client guard, and server-side `401 Unauthorized` enforcement on `/api/checkin/**` and `/api/staff/**`.
- Staff Door Check-In console (`/staff/check-in`) with active event selector, manual/scanner ticket code input, accessible text + icon + color `ResultBanner` (`CHECKED_IN` green, `ALREADY_CHECKED_IN` yellow with original check-in time, `INVALID` / `WRONG_DAY` red), live counter, and shift scan history.
- Staff Attendee Roster (`/staff/attendees`, `/staff/events/:id/attendees`) with `Registered / Capacity`, `Checked in / Registered`, and `Pending` totals bar, debounced search by attendee name or ticket code, status filter tabs, and responsive mobile list / desktop table views.

### Known Limitations (Scoped for Level 2 / Level 3)
- Waitlist joining/promotion, registration cancellation, check-in undo, event creation/editing UI, and CSV export are Level 2 features and will be added in the Level 2 phases.
- Camera-based live QR scanning (`html5-qrcode`) and sandbox email notifications are Level 3 features (Level 1 uses text/USB/keyboard QR code input on the check-in screen).

---

## 7. Official Acceptance Checklist (Level 1)

| ID | Level | Acceptance Check | Local | Final | Notes |
|---|---|---|---|---|---|
| **L1-01** | Level 1 | Register for Cebu Dev Meetup 2026 on a phone-sized screen and see a ticket with a QR code | **Pass** | **Pass** | Verified at `375×667` & `390×844`; generates unique `CDM-XXXXXX` code + SVG QR pass |
| **L1-02** | Level 1 | Scan the QR with any phone QR app: it shows the same ticket code | **Pass** | **Pass** | `<QRCodeSVG value={ticketCode} />` encodes the exact ticket code string |
| **L1-03** | Level 1 | Refresh the browser, then find the ticket again with ticket code + email | **Pass** | **Pass** | `POST /api/tickets/lookup` restores full ticket & QR pass (case/whitespace insensitive) |
| **L1-04** | Level 1 | A wrong ticket code or wrong email shows "Ticket not found" and no details | **Pass** | **Pass** | Both return identical HTTP `404` `{"message":"Ticket not found"}` (`R11`) |
| **L1-05** | Level 1 | Register the same email twice for one event: the second attempt is blocked | **Pass** | **Pass** | Blocked with HTTP `409` friendly message across any letter casing |
| **L1-06** | Level 1 | Submit the form with a bad email and a 10-digit mobile number: both show errors | **Pass** | **Pass** | Both inline field errors render simultaneously on client and server (`400` `fieldErrors`) |
| **L1-07** | Level 1 | Open the seeded full event: it shows "Full" and the Register button is disabled | **Pass** | **Pass** | `S3` (`Cebu Startup Pitch Night`, `5/5`) displays `Full` badge, disabled button, and `409` on direct API POST |
| **L1-08** | Level 1 | Open a staff page while signed out: you are sent to the sign-in page | **Pass** | **Pass** | `ProtectedRoute` redirects to `/staff/login`; unauthenticated API calls return HTTP `401` |
| **L1-09** | Level 1 | Check in a valid ticket: green "Checked in" with the name | **Pass** | **Pass** | Displays green `Checked In` banner with attendee full name, timestamp, and verifier name |
| **L1-10** | Level 1 | Check in the same ticket again: yellow "Already checked in" with the first time | **Pass** | **Pass** | Displays yellow `Already Checked In` banner with the original Asia/Manila check-in time |
| **L1-11** | Level 1 | Enter a made-up code, and a real code from a different event: both show "Invalid ticket" | **Pass** | **Pass** | Unknown code (`CDM-ZZZZZZ`) and cross-event code (`CSP-...` on `S1`) both show red `Invalid Ticket` |
| **L1-12** | Level 1 | The attendee list shows correct registered and checked-in totals | **Pass** | **Pass** | Totals bar (`Registered / Capacity`, `Checked in / Registered`) matches roster rows and filters by name/code |
