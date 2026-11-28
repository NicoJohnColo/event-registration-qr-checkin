# EventRegister — Cebu Event Registration & QR Check-in

A mobile-first, full-stack event registration, waitlist management, and door QR check-in application built for Cebu tech and community events (**Asia/Manila · UTC+8**). Attendees browse published events, reserve a free seat or join the waitlist when capacity is full, receive an HMAC-signed QR pass on screen and via confirmation email, retrieve or self-cancel passes without leaking personal details, and verify entry at the door via live camera or manual scan. Organizers manage draft/published/closed/deleted event lifecycles, promote waitlisted attendees, undo mistaken check-ins, monitor live metrics, export Excel-ready CSVs, and inspect the staff audit log.

---

## 1. Level Reached & Live Deployment

- **Verified Complete:**
  - **Level 1 · Core (`12 / 12` Checks — Pass)**
  - **Level 2 · Intermediate (`10 / 10` Checks — Pass)**
  - **Level 3 · Advanced (`6 / 6` Items · `7 / 7` Checks — Pass):** `12` Camera QR Scanner (with rear/front camera toggle & ~2s auto-ready), `13` Last-Spot & Double-Scan Concurrency Locks, `14` Signed HMAC-SHA256 QR + Rate Limiting, `15` Async Mailtrap Sandbox Emails, `16` `ORGANIZER` vs `DOOR_STAFF` RBAC + Audit Logs Console, and `17` Production HTTPS Deployment on Render.

### Live Deployed URLs (Render · HTTPS)
- **Frontend App:** [https://event-registration-qr-checkin.onrender.com](https://event-registration-qr-checkin.onrender.com) *(Render Static Site)*
- **Backend API:** [https://eventregister-cebu-api.onrender.com](https://eventregister-cebu-api.onrender.com) *(Render Docker Web Service · Health check: [`/api/health`](https://eventregister-cebu-api.onrender.com/api/health))*
- *(Render Free Tier note: the backend spins down after ~15 minutes of inactivity; opening `/api/health` wakes it in ~50–120s before testing.)*

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Java 21 · Spring Boot 4.2.0 · Spring Security (Stateless JWT `HmacSHA256`, BCrypt, `@EnableMethodSecurity` + filter-layer `ORGANIZER` / `DOOR_STAFF` RBAC, HTTP `429` Rate Limiting) · Spring Data JPA / Hibernate 7 · Bean Validation · Flyway · `@Async` Spring Mail (`spring-boot-starter-mail`) · ZXing (`3.5.3`) QR PNG |
| **Database** | PostgreSQL 17 (Supabase Session Pooler) |
| **Frontend** | React 19 · Vite 6 · TypeScript 5 · Tailwind CSS v4 · React Router 7 · TanStack Query v5 · React Hook Form + Zod · `qrcode.react` · `html5-qrcode` (lazy-loaded camera scanner) · `lucide-react` |
| **Hosting** | Render (Docker Web Service via `backend/Dockerfile` + Static Site with SPA `/*` → `/index.html` rewrite) over HTTPS |
| **Time Zone** | Enforced server-side and client-side in `Asia/Manila` (`UTC+8`), rendered in 12-hour `AM/PM` format |

---

## 3. Setup & Run Instructions

### Prerequisites
- **Java 21+** with Maven Wrapper (`./mvnw` / `.\mvnw.cmd`)
- **Node.js 20+** and `npm`
- **PostgreSQL 15+** (or a Supabase PostgreSQL project)

### Step 1 — Configure Environment Variables
Copy `.env.example` to `.env` in the repository root and fill in your PostgreSQL / Supabase connection credentials, JWT secret, and optional Mailtrap Sandbox SMTP credentials:

```powershell
Copy-Item .env.example .env
```

Environment variables in `.env`:

| Variable | Description | Example |
|---|---|---|
| `SPRING_DATASOURCE_URL` | JDBC PostgreSQL connection URL | `jdbc:postgresql://<pooler-host>:5432/postgres` |
| `SPRING_DATASOURCE_USERNAME` | Database username | `postgres.<project-ref>` |
| `SPRING_DATASOURCE_PASSWORD` | Database password | `your-db-password` |
| `JWT_SECRET` | HMAC-SHA256 JWT signing secret (≥32 chars) | `change-me-long-random-secret-key-at-least-32-chars` |
| `QR_HMAC_SECRET` | Optional HMAC secret for QR tokens (defaults to `JWT_SECRET`) | `change-me-optional-qr-signing-secret-at-least-32-chars` |
| `CORS_ALLOWED_ORIGIN` | Allowed frontend origin | `http://localhost:5173` |
| `VITE_API_URL` | Backend base URL for Vite frontend | `http://localhost:8080` |
| `APP_TIMEZONE` | Default server timezone | `Asia/Manila` |
| `APP_PUBLIC_BASE_URL` | Base frontend URL used in email pass links | `http://localhost:5173` |
| `MAIL_ENABLED` | Enable real SMTP sending (`false` logs `[EMAIL-SANDBOX-DRYRUN]`) | `false` |
| `MAIL_HOST` | SMTP host (e.g. Mailtrap Sandbox) | `sandbox.smtp.mailtrap.io` |
| `MAIL_PORT` | SMTP port | `2525` |
| `MAIL_USERNAME` | Sandbox SMTP username | `your-mailtrap-username` |
| `MAIL_PASSWORD` | Sandbox SMTP password | `your-mailtrap-password` |
| `MAIL_FROM` | Sender address for confirmation emails | `no-reply@eventregister.cebu` |

### Step 2 — Start the Backend (`http://localhost:8080`)
Flyway migrations (`V1__init.sql`, `V2__seed_staff.sql`, `V3__level2_extensions.sql`, `V4__seed_door_staff.sql`) and the idempotent relative-date `DataSeeder` run automatically on startup.

```powershell
cd backend
.\mvnw.cmd -DskipTests package
java -Xms128m -Xmx256m -jar target\eventreg-0.0.1-SNAPSHOT.jar
```

Verify backend health:
```powershell
curl http://localhost:8080/api/health
# {"status":"UP","database":"UP","zone":"Asia/Manila","serverTime":"..."}
```

### Step 3 — Start the Frontend (`http://localhost:5173`)
```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser. *(Note: camera QR scanning works on `localhost`; on external devices/phones, HTTPS is required by browser camera permissions.)*

### Step 4 — Verification Commands
```powershell
# Backend unit, RBAC, HMAC QR, rate-limit, email & concurrency tests (67 tests)
cd backend ; .\mvnw.cmd test

# Frontend TypeScript & Vite production build
cd frontend ; npm run build
```

---

## 4. Seed Data & Demo Staff Logins

### How Seed Data Loads
1. **`V1__init.sql` & `V3__level2_extensions.sql` (Flyway):** Creates `staff_users`, `events`, `registrations` (`CONFIRMED`, `WAITLISTED`, `CHECKED_IN`, `CANCELLED` + partial unique waitlist/email indexes), and `audit_logs`.
2. **`V2__seed_staff.sql` & `V4__seed_door_staff.sql` (Flyway):** Seeds BCrypt-hashed demo accounts for both `ORGANIZER` and `DOOR_STAFF` roles.
3. **`DataSeeder.java` (Spring `ApplicationRunner`):** Seeds 4 published events (`S1`–`S4`) with dates kept relative to **today in `Asia/Manila`**:
   - **`S1` — Cebu Dev Meetup 2026 (`CDM`)**: Scheduled **Today** (`8:00 AM – 11:59 PM` PHT), capacity `30`, `3` seeded confirmed attendees (`27` spots left).
   - **`S2` — Cebu Web Design Workshop (`CWD`)**: Scheduled **Today + 7 days** (`1:00 PM – 5:00 PM` PHT), capacity `50`, `0` registrations.
   - **`S3` — Cebu Startup Pitch Night (`CSP`)**: Scheduled **Today + 3 days** (`6:00 PM – 9:00 PM` PHT), capacity `5`, `5` seeded attendees (**Full · Waitlist Open**).
   - **`S4` — Cebu Code Camp (`CCC`)**: Scheduled **Today − 7 days** (`9:00 AM – 3:00 PM` PHT), capacity `40`, marked **Ended**.

### Seeded Staff Credentials (`/staff/login`)

| Role | Username | Password | Permissions |
|---|---|---|---|
| **Organizer** | `organizer` | `Demo@Cebu2026` | Full operations: Dashboard & CSV Export, Manage Events (Create/Edit/Publish/Close/Delete), Door Check-In + Undo, Attendee Roster + Promote/Cancel, Audit Logs (`/staff/audit-logs`) |
| **Door Staff** | `doorstaff` | `Door@Cebu2026` | Door Check-In + Undo (`/staff/check-in`) and read-only Attendee Roster (`/staff/attendees`). Blocked (`HTTP 403`) on Event CRUD, Dashboard, Waitlist Promotion, Staff Cancel, and Audit Logs |

---

## 5. Data Model, Concurrency & Security Approach

### Database Schema (`V1`–`V4`)

| Table | Key Columns & Constraints |
|---|---|
| `staff_users` | `id`, `name`, `username` (`UNIQUE`), `password_hash` (BCrypt), `role` (`CHECK IN ('ORGANIZER', 'DOOR_STAFF')`), `created_at` |
| `events` | `id`, `title`, `description`, `venue`, `code_prefix`, `starts_at` (`TIMESTAMPTZ`), `ends_at` (`CHECK ends_at > starts_at`), `capacity` (`CHECK capacity >= 1`), `status` (`CHECK IN ('DRAFT', 'PUBLISHED', 'CLOSED')`), `created_at` |
| `registrations` | `id`, `event_id` (`FK -> events`), `full_name`, `email`, `mobile`, `ticket_code` (`UNIQUE`), `status` (`CHECK IN ('CONFIRMED', 'WAITLISTED', 'CHECKED_IN', 'CANCELLED')`), `waitlist_position`, `registered_at`, `checked_in_at`, `checked_in_by` (`FK -> staff_users`), `cancelled_at`, `cancelled_by_staff_id` (`FK -> staff_users`) |
| `audit_logs` | `id`, `action`, `entity_type`, `entity_id`, `performed_by_id` (`FK -> staff_users`), `details`, `created_at` |

### Concurrency & Security Guarantees
- **Last-Spot Lock & Waitlist Queuing (Item `13`, `L2-04`):** `RegistrationService.register()` and `promoteFirstWaitlist()` run inside `@Transactional` and acquire a PostgreSQL **`PESSIMISTIC_WRITE` row lock (`SELECT ... FOR UPDATE`)** on the target `Event` row via `EventRepository.findByIdForUpdate()`. Concurrent transactions serialize behind the row lock before counting `CONFIRMED + CHECKED_IN` seats — ensuring only the winner receives `CONFIRMED` and any overflow registrant receives `WAITLISTED` with a unique consecutive `waitlist_position` (`uq_reg_event_waitlist_pos`). Verified under simultaneous threads in `ConcurrencyRaceTest`.
- **Atomic Door Check-In (Item `13`, `L1-09`, `L1-10`):** `CheckInService.checkIn()` checks ticket state and transitions `CONFIRMED` → `CHECKED_IN` using an **atomic conditional database update** (`UPDATE registrations SET status = 'CHECKED_IN', checked_in_at = :now, checked_in_by = :staff WHERE id = :id AND status = 'CONFIRMED'`). If two door scanners hit the same pass concurrently, only one thread receives `updated == 1` (`CHECKED_IN`) while the second receives `updated == 0` and falls back to `ALREADY_CHECKED_IN` with the winner's original timestamp.
- **Duplicate Email Prevention (`R2`):** Enforced in application logic and via partial unique index `uq_reg_active_email` on `(event_id, lower(email))` while active (`CONFIRMED`, `CHECKED_IN`, `WAITLISTED`), allowing re-registration only if previously `CANCELLED`.
- **Signed HMAC-SHA256 QR Payloads & Rate Limiting (Item `14`):** `QrTokenService` embeds a constant-time verified HMAC-SHA256 signature (`ER1.<TICKET_CODE>.<HMAC24>`, bound to both `eventId` and `ticketCode`) inside generated QR passes while keeping short 6-character non-sequential codes (`SecureRandom`, excluding `0/O/1/I`) for manual fallback. Tampered/forged or cross-event tokens are rejected immediately as `INVALID`. `RateLimitFilter` enforces per-IP fixed-window quotas (`HTTP 429 Too Many Requests` + `Retry-After`) on `/api/tickets/lookup`, `/api/tickets/cancel`, `/api/events/*/register`, and `/api/checkin`.
- **Privacy-Preserving Lookup & Self-Cancel (`R11`, `L2-06`):** Both `POST /api/tickets/lookup` and `POST /api/tickets/cancel` require matching `ticketCode` + registered `email`, returning uniform `404` `"Ticket not found"` on mismatch and blocking cancellation once `CHECKED_IN` (`400`, `L2-08`).
- **RBAC & Audit Logging (Item `16`):** `SecurityConfig` combines `@EnableMethodSecurity` with filter-chain role enforcement (`ORGANIZER` vs `DOOR_STAFF`). All lifecycle actions (`CREATE_EVENT`, `UPDATE_EVENT`, `CLOSE_EVENT`, `DELETE_EVENT`, `CHECK_IN`, `UNDO_CHECK_IN`, `PROMOTE_WAITLIST`, `STAFF_CANCEL`, `ATTENDEE_CANCEL`) persist to `audit_logs` and are inspectable by Organizers at `/staff/audit-logs`.

---

## 6. Completed Features & Known Limitations

### Completed — Level 1 Core
- Public events directory (`/`, `/events`) and details (`/events/:id`) with server-computed capacity, `Asia/Manila` 12-hour schedules, search, and filter chips.
- Registration form (`/events/:id/register`) with Zod + Bean Validation, PH mobile validation (`09XXXXXXXXX`), QR boarding pass (`/ticket/:code`), and email-guarded retrieval (`/lookup`).
- Stateless JWT staff login (`/staff/login`) and Door Check-In (`/staff/check-in`) with color + icon + text outcome banners and shift scan history.

### Completed — Level 2 Intermediate
- **Event Management (`/staff/events`):** Create, edit, publish drafts (`DRAFT` → `PUBLISHED` → `CLOSED`), validate schedule order (`endsAt > startsAt`) and active capacity floors, and delete events (`DELETE /api/staff/events/{id}`).
- **Waitlist Queue & FIFO Promotion (`L2-04`, `L2-05`, `L2-07`):** Full active events offer **Join Waitlist**, issue numbered `#X on the waitlist` passes, reject waitlisted door scans in red (`"On waitlist — not confirmed"`), and let Organizers promote `#1` cleanly.
- **Self & Staff Cancellation (`L2-06`, `L2-08`):** Confirmed/waitlisted attendees can self-cancel from their pass, Organizers can cancel from the roster, and checked-in passes are protected from cancellation.
- **Undo Check-In (`L2-09`):** Door staff and Organizers can undo mistaken check-ins with full audit attribution.
- **Operations Dashboard & Excel CSV Export (`/staff/dashboard`, `L2-10`):** Real PostgreSQL KPI summary strip, dual bars, donut chart, Manila-time no-show counts (`—` before start time), mobile carousel/grid toggle, and Excel-ready UTF-8 CSV download (with `\uFEFF` BOM and leading-zero-preserving `="09..."` mobile formatting).

### Completed — Level 3 Advanced (`6 / 6` Items)
- **Camera QR Scanner (`Item 12`):** Dynamically loaded `html5-qrcode` viewfinder in `/staff/check-in` with rear/front camera switcher, ~2-second result pause + auto-resume, and manual input fallback.
- **Last-Spot & Double-Scan Concurrency Locks (`Item 13`):** PostgreSQL row locking + atomic conditional check-in updates backed by multi-threaded unit tests (`ConcurrencyRaceTest`).
- **Signed HMAC QR & Per-IP Rate Limiting (`Item 14`):** `ER1.<CODE>.<HMAC24>` QR tokens (`QrTokenService`) + `HTTP 429` throttling (`RateLimitFilter`).
- **Async Sandbox Emails (`Item 15`):** `@Async` post-commit HTML emails (`TicketEmailService`) with embedded ZXing QR PNGs (`cid:ticketQr`) and live frontend ticket links via Mailtrap Sandbox.
- **Roles & Audit Logs (`Item 16`):** Enforced `ORGANIZER` vs `DOOR_STAFF` separation (`V4__seed_door_staff.sql`), role-scoped navigation/routes, and `/staff/audit-logs` console.
- **HTTPS Production Deployment (`Item 17`):** Deployed backend via `backend/Dockerfile` (`maven:3.9-eclipse-temurin-21` + Google Maven mirror `backend/maven-settings.xml` + `eclipse-temurin:21-jre`) on Render Web Service and frontend on Render Static Site with SPA `/*` → `/index.html` rewrite and CORS configured.

### Operational Notes & Known Limitations
- **Render Free Tier Cold Start:** The free backend web service sleeps after ~15 minutes of inactivity; the first request after idle takes ~50–120 seconds while Tomcat boots.
- **Sandbox Email Mode:** Outbound confirmation and waitlist-promotion emails are routed to Mailtrap Sandbox (`MAIL_HOST=sandbox.smtp.mailtrap.io`) rather than real public mailboxes by design for safe testing.

---

## 7. Official Level 1 Acceptance Checklist (`L1-01`–`L1-12`)

| ID | Level | Acceptance Check | Local | Final | Notes |
|---|---|---|---|---|---|
| **L1-01** | Level 1 | Register for Cebu Dev Meetup 2026 on a phone-sized screen and see a ticket with a QR code | **Pass** | **Pass** | Verified on mobile viewports & live registration; generates unique `CDM-XXXXXX` code + SVG QR pass |
| **L1-02** | Level 1 | Scan the QR with any phone QR app: it shows the same ticket code | **Pass** | **Pass** | QR encodes `ER1.<TICKET_CODE>.<HMAC24>` (embedding the exact ticket code with tamper protection in Level 3) |
| **L1-03** | Level 1 | Refresh the browser, then find the ticket again with ticket code + email | **Pass** | **Pass** | `POST /api/tickets/lookup` restores full ticket & signed QR pass |
| **L1-04** | Level 1 | A wrong ticket code or wrong email shows "Ticket not found" and no details | **Pass** | **Pass** | Both return identical HTTP `404` `{"message":"Ticket not found"}` (`R11`) |
| **L1-05** | Level 1 | Register the same email twice for one event: the second attempt is blocked | **Pass** | **Pass** | Blocked with HTTP `409` across any letter casing + DB partial index `uq_reg_active_email` |
| **L1-06** | Level 1 | Submit the form with a bad email and a 10-digit mobile number: both show errors | **Pass** | **Pass** | Client Zod + server Bean Validation (`400` `fieldErrors`) |
| **L1-07** | Level 1 | Open the seeded full event: it shows "Full" and blocks confirmed overbooking | **Pass** | **Pass** | `S3` (`CSP`, `5/5`) displays `Full · 0 of 5 spots left` and transitions to Level 2 Waitlist (`L2-04`) |
| **L1-08** | Level 1 | Open a staff page while signed out: you are sent to the sign-in page | **Pass** | **Pass** | `ProtectedRoute` redirects to `/staff/login`; unauthenticated API calls return HTTP `401` |
| **L1-09** | Level 1 | Check in a valid ticket: green "Checked in" with the name | **Pass** | **Pass** | Displays green `Checked In` banner with attendee full name, Cebu timestamp, and verifier name |
| **L1-10** | Level 1 | Check in the same ticket again: yellow "Already checked in" with the first time | **Pass** | **Pass** | Displays yellow `Already Checked In` banner with original Manila check-in timestamp |
| **L1-11** | Level 1 | Enter a made-up code, and a real code from a different event: both show "Invalid ticket" | **Pass** | **Pass** | Unknown, sequential, forged, and cross-event codes show red `Invalid Ticket` |
| **L1-12** | Level 1 | The attendee list shows correct registered and checked-in totals | **Pass** | **Pass** | Totals bar (`Registered / Capacity`, `Checked in / Registered`) matches roster rows and filters by name/code |

---

## 8. Official Level 2 Acceptance Checklist (`L2-01`–`L2-10`)

| ID | Acceptance Check | Status | Verification |
|---|---|---|---|
| **L2-01** | Draft event hidden from attendees; visible once published | **Pass** | Verified in `EventServiceTest` & live API check |
| **L2-02** | Event with end time before start time is blocked | **Pass** | Rejected (`400`) in `EventServiceTest`, `EventFormModal`, & live API |
| **L2-03** | Lowering capacity below active registered count is blocked with descriptive message | **Pass** | Rejected (`400`) in `EventServiceTest`, `EventFormModal`, & live API |
| **L2-04** | Registering for a full event places attendee on waitlist with exact position | **Pass** | Verified in `RegistrationServiceTest` (`WAITLISTED #1`, `#2`) & live API |
| **L2-05** | Scanning waitlisted ticket shows *"On waitlist — not confirmed"* (red) | **Pass** | Verified in `CheckInServiceTest`, red `outcomes.ts` styling, & live API |
| **L2-06** | Cancelling confirmed ticket frees spot; scanning cancelled ticket shows *"Cancelled"* | **Pass** | Verified in `RegistrationServiceTest`, `CheckInServiceTest`, & live API |
| **L2-07** | Promoting #1 waitlist attendee allows successful check-in and compacts queue | **Pass** | Verified in `RegistrationServiceTest` & live API |
| **L2-08** | Attempting to cancel a checked-in registration is rejected | **Pass** | Rejected (`400`) in `RegistrationServiceTest` & live API |
| **L2-09** | Undoing check-in permits re-checking-in and logs staff identity & timestamp | **Pass** | Verified in `CheckInServiceTest` (`UNDO_CHECK_IN` AuditLog) & live API |
| **L2-10** | Dashboard counts match database counts; CSV export opens properly in Excel | **Pass** | Live metrics match PostgreSQL; CSV starts with UTF-8 BOM (`EF BB BF`) and `="09..."` mobile format |

---

## 9. Official Level 3 Acceptance Checklist (`L3-01`–`L3-07`)

| ID | Feature | Acceptance Check | Status | Verification |
|---|---|---|---|---|
| **L3-01** | 12 · Camera Scan | Scan a ticket from another phone's screen with the camera: correct result, then ready after ~2s | **Pass** | Verified live over HTTPS on `https://event-registration-qr-checkin.onrender.com/staff/check-in` using `CameraQrScanner.tsx` (`html5-qrcode`) |
| **L3-02** | 13 · Last-Spot Race | Two simultaneous last-spot registrations yield only one `CONFIRMED` | **Pass** | PostgreSQL `SELECT ... FOR UPDATE` row lock verified in `ConcurrencyRaceTest` |
| **L3-03** | 13 · Double-Scan Race | Two simultaneous check-ins on the same ticket yield only one `CHECKED_IN` | **Pass** | Atomic conditional `UPDATE ... WHERE status = 'CONFIRMED'` verified in `ConcurrencyRaceTest` |
| **L3-04** | 14 · Secure QR + Rate Limit | Guess/forged/sequential code never valid; endpoints rate-limited (`429`) | **Pass** | `QrTokenServiceTest`, `RateLimitFilterTest`, and live API checks (tampered `ER1`, `VRF-000001`, 21st request → `429`) |
| **L3-05** | 15 · Sandbox Email | Registration & waitlist-promotion emails arrive in sandbox inbox with QR/link | **Pass** | `TicketEmailServiceTest` (3 tests) + live Mailtrap Sandbox receipt verified with embedded QR PNG & live pass link |
| **L3-06** | 16 · Roles & Audit Log | Door staff cannot create/edit events (`403`); Organizer can; Audit Log records actions | **Pass** | `RoleSecurityTest` + live RBAC checks (`doorstaff` `403`, `organizer` `200`, `/staff/audit-logs`) |
| **L3-07** | 17 · Deployment | Deployed link works on a phone over HTTPS, including the camera | **Pass** | Live on Render HTTPS (`https://event-registration-qr-checkin.onrender.com` + `https://eventregister-cebu-api.onrender.com`), SPA rewrite & CORS verified |
