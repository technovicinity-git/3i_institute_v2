# Notification System — Implementation Plan

Status: **DRAFT — for review**. Edit freely; items marked **[DECIDE]** need a decision before implementation.

---

## 1. Current state (what exists today)

| Area | Finding | Impact |
|---|---|---|
| Storage | Notifications are rows in `AuditLog` (`action = "NOTIFICATION"`), with title/body/read flag inside the `details` JSON. | Can't index `read`, can't filter by learner profile, mixes audit data with user data. |
| Unread count | `getUnreadCount` loads **every** notification row for the user and filters in JS. | O(n) per request; called on every list fetch. |
| Mark all read | Loops one `UPDATE` per row. | Slow and non-atomic. |
| Learner profiles | `learnerProfileId` is stored in `resourceId` but **never used** when reading. | All profiles under one account see each other's notifications. |
| Triggers | `notifyCourseEnrolled`, `notifyExamAvailable`, etc. exist but are **called nowhere**. | No notifications are ever produced. |
| Email | `MAIL_FROM` / `AWS_SES_*` env vars exist, but no SES SDK; verification + password-reset emails are `TODO`. | Users currently can't verify email or reset password by email. |
| Push | No FCM/APNs. The `Device` table is the **device-limit registry** (`deviceToken` = device identifier), not push tokens. | Need a separate push-token store. |
| Queue/jobs | `REDIS_URL` in env but no Redis client; `src/jobs/queues` and `src/jobs/workers` are empty. | No background delivery or scheduled reminders. |
| Realtime | Socket.IO exists (chat only), JWT-authenticated. | Can reuse for live in-app notifications. |
| Web | Instructor `/instructor/notifications` page + service call `/notifications`. Admin navbar shows **hardcoded fake** notifications. No learner notifications UI. | |
| Mobile | `/instructor/notifications` and learner notifications are placeholders. No `firebase_messaging`. | |
| Hosting | Backend on Render (`node --import tsx src/index.ts`). | Background work must run in-process or as a separate Render worker. |

---

## 2. Goals

1. One notification service that every module calls with a typed event, e.g. `notify("exam.graded", …)`.
2. Three audiences: **learner profile**, **instructor**, **admin**, plus **account-level** messages for the account holder (billing, waiver, security).
3. Channels: **in-app** (always), **email**, **mobile push**, with **real-time** updates over Socket.IO.
4. Production qualities: reliable delivery with retries, safe to retry without duplicates, user preferences, scheduled reminders, throttling, retention, observability, child-safe push content.

---

## 3. Data model (Prisma)

### 3.1 New enums

```prisma
enum NotificationChannel {
  IN_APP
  EMAIL
  PUSH
}

enum DeliveryStatus {
  PENDING
  SENT
  FAILED      // retrying
  DEAD        // gave up after max attempts
  SKIPPED     // disabled by preference / no token / no email
}
```

### 3.2 `Notification` (one row per recipient)

```prisma
model Notification {
  id               String    @id @default(uuid())

  userId           String              // recipient account (learner's account holder, instructor, or admin)
  user             User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  learnerProfileId String?             // set for learner-profile notifications; null = account-level
  learnerProfile   LearnerProfile? @relation(fields: [learnerProfileId], references: [id], onDelete: Cascade)

  type             String              // event key, e.g. "exam.graded" (see §6)
  category         String              // grouping for UI + preferences: learning, schedule, billing, admin, …
  priority         String    @default("normal")   // low | normal | high
  title            String
  body             String
  data             Json?               // ids + deep link: { route: "/my-courses/:id/exams/:examId/result", courseId, examId }
  imageUrl         String?

  dedupeKey        String?             // idempotency, e.g. "session.reminder.15m:<sessionId>:<profileId>"
  groupKey         String?             // collapse/resolve related items, e.g. "course-review:<courseId>"

  readAt           DateTime?
  archivedAt       DateTime?
  expiresAt        DateTime?           // e.g. session reminders expire after the session ends
  createdAt        DateTime  @default(now())

  deliveries       NotificationDelivery[]

  @@unique([userId, dedupeKey])
  @@index([userId, learnerProfileId, readAt])
  @@index([userId, createdAt])
  @@index([groupKey])
}
```

### 3.3 `NotificationDelivery` (outbox for email/push)

```prisma
model NotificationDelivery {
  id                String              @id @default(uuid())
  notificationId    String
  notification      Notification        @relation(fields: [notificationId], references: [id], onDelete: Cascade)
  channel           NotificationChannel
  status            DeliveryStatus      @default(PENDING)
  attempts          Int                 @default(0)
  nextAttemptAt     DateTime            @default(now())
  lastError         String?
  providerMessageId String?
  sentAt            DateTime?
  createdAt         DateTime            @default(now())

  @@unique([notificationId, channel])
  @@index([status, nextAttemptAt])
}
```

### 3.4 `PushToken` (separate from the device-limit `Device` table)

```prisma
model PushToken {
  id            String    @id @default(uuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  token         String    @unique          // FCM registration token
  platform      String                     // ios | android | web
  deviceId      String?                    // optional link to Device.id
  appVersion    String?
  locale        String?
  lastSeenAt    DateTime  @default(now())
  invalidatedAt DateTime?                  // set when FCM reports UNREGISTERED
  createdAt     DateTime  @default(now())

  @@index([userId])
}
```

### 3.5 `NotificationPreference`

```prisma
model NotificationPreference {
  id               String              @id @default(uuid())
  userId           String
  user             User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  learnerProfileId String?             // per-profile overrides; null = account default
  category         String
  channel          NotificationChannel
  enabled          Boolean

  @@unique([userId, learnerProfileId, category, channel])
}
```

- Defaults live in code (the event catalog). A row exists only when the user changes a default.
- **Mandatory** categories (`security`, `billing`, `account`) ignore opt-outs for email.

### 3.6 `User` additions

- `timezone String @default("UTC")`: needed for reminder wording ("Today at 7:00 PM") and quiet hours. The client sends it on login/profile update. **[DECIDE]**

### 3.7 Migration of existing data

- A one-off script copies `AuditLog` rows with `action = "NOTIFICATION"` into `Notification` (`learnerProfileId = resourceId`, `readAt = details.read ? createdAt : null`), then deletes them from `AuditLog`.

---

## 4. Recipient model per audience

| Audience | `userId` | `learnerProfileId` | Who sees it |
|---|---|---|---|
| Learner profile | account holder (`LearnerProfile.accountId`) | the profile | That profile's feed in the learner app/web; push goes to the account holder's devices, prefixed with the profile name ("Aisha · Exam graded"). |
| Account holder | account holder | `null` | Account area (billing, waiver, seats, security). Shown in every profile's bell under an "Account" section **[DECIDE]**. |
| Instructor | instructor user | `null` | Instructor panel. |
| Admin | **each** user with role `Admin` (fan-out, one row each) | `null` | Admin panel. Uses `groupKey` so that when one admin resolves an item (approves a course), the matching notifications for the other admins are archived. |

**[DECIDE]** Admin recipients: all Admin-role users, or only those with a permission such as `notifications.admin.receive`?

---

## 5. Architecture

```
domain service (enrol, gradeSubmission, approveCourse, …)
        │ notify(type, recipients, params)      ← after the domain write succeeds
        ▼
NotificationService
  1. resolve recipients (profile → account, "admins" → admin users)
  2. render title/body from template (§7)
  3. one transaction: insert Notification rows + NotificationDelivery rows for enabled channels
  4. emit Socket.IO "notification:new" + "notification:unread" to room user:<userId>
        ▼
Delivery worker (polls NotificationDelivery)
  • SELECT … WHERE status IN (PENDING, FAILED) AND nextAttemptAt <= now()
      FOR UPDATE SKIP LOCKED LIMIT 50
  • EMAIL → AWS SES v2       PUSH → Firebase Admin (FCM HTTP v1; covers iOS via APNs)
  • success → SENT; failure → attempts++, exponential backoff (1m, 5m, 30m, 2h, 12h), DEAD after 5
  • FCM UNREGISTERED/INVALID → PushToken.invalidatedAt
        ▼
Scheduler (reminders, §6.5) — same worker process, guarded by a Postgres advisory lock
```

### 5.1 Queue choice — **[DECIDE]**

- **Recommended: Postgres outbox (above).** No new infrastructure, it's durable, and the worker uses `SKIP LOCKED` so it's safe to run several instances. This is plenty for the current scale.
- Alternative: **BullMQ + Redis.** Better for very high volume, but needs a managed Redis on Render and more moving parts. The outbox can move to BullMQ later without changing callers.

### 5.2 Where the worker runs — **[DECIDE]**

- **Option A (start here):** inside the API process, enabled by `NOTIFICATION_WORKER_ENABLED=true`.
- **Option B (production):** a separate Render **Background Worker** running `src/worker.ts` from the same codebase, with the flag off on the API service.

### 5.3 Realtime

- On socket connect, auto-join room `user:<sub>`. Learners also emit `notification:subscribe { learnerProfileId }` after picking a profile, and the server checks ownership.
- Events: `notification:new` (payload = the notification), `notification:unread` ({ total, byProfile }).
- Multiple API instances need `@socket.io/redis-adapter` (only once Redis exists).

### 5.4 Throttling and noise control

- **Chat:** no push per message. Use a per-(user, batch) digest: at most one "N new messages in <Batch>" push every 10 minutes, and none while the user is connected to that chat room. The in-app badge updates live.
- **Bulk events** (new material, new enrolments for an instructor): collapse with `groupKey` and update the existing unread notification ("3 new materials in <Course>") instead of inserting new rows.
- **Quiet hours** (optional, phase 4): hold non-urgent push between 22:00 and 07:00 in the user's timezone.

---

## 6. Event catalog

Channel legend: **A** = in-app, **E** = email, **P** = push. Bold channels are on by default; others are opt-in.

### 6.1 Learner profile

| Event key | Trigger (file → function) | Channels | Notes |
|---|---|---|---|
| `enrolment.confirmed` | `enrolment/service.ts → enrol` | **A E** | |
| `enrolment.waitlisted` | `enrol` (waitlisted = true) | **A** | include position |
| `enrolment.waitlist_promoted` | `enrolment/service.ts → promoteFromWaitlist` | **A E P** | high priority |
| `session.scheduled` | `batch/service.ts → addSession` / `create` | **A P** | to all enrolled profiles in batch |
| `session.updated` | `batch/service.ts → updateSession` (time/link change) | **A P** | "Meeting link added" when link goes from empty to set |
| `session.cancelled` | `batch/service.ts → deleteSession` | **A P** | |
| `session.reminder.24h` / `.15m` | scheduler | **P A** | dedupeKey per session+profile; expires after session end |
| `batch.closed` | `batch/service.ts → closeBatch` | **A E** | |
| `material.published` | `material/service.ts → create / uploadVideo / uploadDocument` | **A** | grouped per course per day |
| `exam.published` | `exam/service.ts → createExam` | **A P** | |
| `exam.opening` | scheduler (`openDate`) | **P A** | online-class exams |
| `exam.graded` | `exam/service.ts → gradeWrittenAnswers` | **A P** | auto-graded results are shown immediately, so no notification |
| `assignment.published` | `assignment/service.ts → create` | **A P** | |
| `assignment.due_soon` | scheduler (24h before `dueDate`, not yet submitted) | **P A** | |
| `assignment.graded` | `assignment/service.ts → gradeSubmission` | **A P** | |
| `certificate.issued` | `certificate/service.ts → issue*Certificate`, `issueOnlineFinalExamCertificates` | **A E P** | |
| `chat.digest` | `chat/socket.ts → send-message` (throttled) | **A** P | only if profile `chatEnabled` |

### 6.2 Account holder (account-level)

| Event key | Trigger | Channels |
|---|---|---|
| `billing.payment_succeeded` | `billing/webhook.ts → invoice.payment_succeeded` | **A E** |
| `billing.payment_failed` | `billing/webhook.ts → invoice.payment_failed` | **A E P** (mandatory) |
| `billing.subscription_cancelled` | `webhook.ts → customer.subscription.deleted` | **A E** |
| `billing.renewal_upcoming` | scheduler (3 days before `currentPeriodEnd`) | **E** |
| `waiver.approved` / `rejected` / `revoked` | `billing/service.ts → reviewWaiver / revokeWaiver` | **A E** |
| `waiver.expiring` | scheduler (7 days before `expiresAt`) | **A E** |
| `seat.assigned` / `profile.activated` | seat assignment flow | **A** |
| `security.password_changed` | `auth → change-password / reset-password` | **E** (mandatory) |
| `security.email_changed` | `user → change-email` (sent to the **old** address) | **E** (mandatory) |
| `security.new_device` | device registration / login on a new device | **E** |

Also part of the email work (transactional, outside the notification feed): **email verification** and **password reset**, closing the existing TODOs in `auth/service.ts`.

### 6.3 Instructor

| Event key | Trigger | Channels |
|---|---|---|
| `instructor.application_approved` / `rejected` | `instructor/service.ts → approve / reject` | **A E** |
| `course.approved` / `course.rejected` / `course.suspended` | `course/service.ts → approve / reject`, `admin/service.ts → suspendCourse` | **A E P** |
| `course.new_enrolment` | `enrolment/service.ts → enrol` | **A** (grouped daily) |
| `batch.full` | `enrol` (capacity reached) | **A** |
| `exam.needs_grading` | `exam/service.ts → submitExam` (written questions present) | **A P** |
| `assignment.submitted` | assignment submit | **A** (grouped per assignment) |
| `session.reminder.15m` | scheduler (own sessions) | **P A** |
| `chat.digest` | chat (throttled) | **A** P |
| `course.rated` | `rating/service.ts → create` | **A** |

### 6.4 Admin

| Event key | Trigger | Channels | groupKey (auto-resolve) |
|---|---|---|---|
| `admin.instructor_application` | instructor registration | **A E** | `instructor-app:<userId>` |
| `admin.course_review_requested` | `course/service.ts → create/update` when status becomes `PENDING_REVIEW` | **A E** | `course-review:<courseId>` |
| `admin.waiver_requested` | `billing/service.ts → requestWaiver` | **A E** | `waiver:<waiverId>` |
| `admin.chat_reported` | `chat/service.ts → reportMessage` | **A E P** | `chat-report:<messageId>` |
| `admin.payment_failed` | `webhook.ts → invoice.payment_failed` | **A** | — |
| `admin.daily_digest` (optional) | scheduler | **E** | — |

### 6.5 Scheduler jobs (run every minute, idempotent via `dedupeKey`)

| Job | Window | Recipients |
|---|---|---|
| Session reminders | sessions starting in 24h ±1m and 15m ±1m | enrolled (non-waitlisted) profiles + instructor |
| Exam opening | online exams with `openDate` within the next minute | enrolled profiles |
| Assignment due | `dueDate` in 24h, no submission | profiles in course/batch |
| Renewal / waiver expiry | daily at 09:00 UTC | account holders |
| Retention cleanup | daily | see §9 |

---

## 7. Content and localization

- Templates live in code: `notification/templates/<eventKey>.ts`, exporting `title(params, locale)`, `body(params, locale)`, an optional `email` (subject + HTML + text), a `push` (short title/body) and a deep-link `route(params)`.
- Text is rendered at creation time in the recipient's `User.locale` (en/bn/hi/ur/ar) and stored. **[DECIDE]** v1 English-only, with locale keys ready?
- **Child safety:** push previews for learner-profile notifications never include message text, grades or names of other learners. Lock-screen copy stays generic ("New update in Arabic Grammar"), and details appear only inside the app. Chat digests never include message content.
- **Deep links:** `data.route` uses the **app routes**, which mobile and web already share (`/my-courses/:courseId/lessons/:id`, `/instructor/courses/:id/exams/:examId/attempts`, …). For learner links, the client switches to `learnerProfileId` (asking for its PIN if needed) before navigating.

---

## 8. API

All endpoints are authenticated. A `learnerProfileId` must belong to the caller's account (404 otherwise).

| Method | Path | Purpose |
|---|---|---|
| GET | `/notifications?learnerProfileId=&scope=profile\|account\|all&category=&unreadOnly=&cursor=&limit=` | Cursor-paginated feed |
| GET | `/notifications/unread-count?learnerProfileId=` | `{ total, byProfile: { <id>: n }, account: n }`; `byProfile` drives badges on the profile picker |
| POST | `/notifications/:id/read` | Mark one read |
| POST | `/notifications/read-all` (body: `learnerProfileId?`, `category?`) | One `UPDATE … WHERE readAt IS NULL` |
| DELETE | `/notifications/:id` | Archive (soft) |
| GET / PUT | `/notifications/preferences?learnerProfileId=` | Category × channel matrix with defaults and mandatory flags |
| POST | `/notifications/push-tokens` `{ token, platform, deviceId?, appVersion? }` | Upsert by token, moving it to the current user if it changed hands |
| DELETE | `/notifications/push-tokens/:token` | On logout |
| POST | `/admin/notifications/broadcast` (phase 4) | Announcement to: all learners / all instructors / enrollees of a course / a batch |

`/notifications`, `/unread-count`, `/:id/read` and `/read-all` keep their current paths and response shapes, so the existing web instructor page keeps working.

---

## 9. Production concerns

| Concern | Approach |
|---|---|
| Idempotency | `@@unique([userId, dedupeKey])` plus `createMany({ skipDuplicates: true })`; delivery rows are unique per (notification, channel). |
| Atomicity | Notification + delivery rows are written in one transaction. Trigger calls run **after** the domain write commits, and a failure to notify never fails the user's action (log it and carry on). For critical events (payment failed, approval), call inside the same Prisma transaction. |
| Retries | Exponential backoff, max 5 attempts, then `DEAD`, with an admin view/metric for dead deliveries. |
| Provider failures | SES throttling or FCM 5xx → retry. FCM `UNREGISTERED` → invalidate the token, no retry. SES hard bounce → flag the email (phase 4: SNS bounce webhook). |
| Fan-out cost | Batch-sized inserts (e.g. 500 recipients per `createMany`) for batch-wide events; one socket emit per user room. |
| Performance | Indexed unread queries (`readAt IS NULL`), cursor pagination, unread count in one `groupBy` query. |
| Retention | Delete read notifications older than 90 days and unread ones older than 180 days; deliveries older than 30 days. **[DECIDE]** |
| Privacy | Cascade delete with the user/profile; no learner PII in push payloads; email unsubscribe link for non-mandatory categories (signed token → preference off). |
| Feature flags | `NOTIFY_EMAIL_ENABLED`, `NOTIFY_PUSH_ENABLED`, `NOTIFICATION_WORKER_ENABLED` so channels can be switched off per environment. |
| Observability | Structured logs per delivery (eventKey, channel, status, latency); counters for sent/failed/dead; alert when the dead count is above 0 per hour. |
| Security | Socket room join checks profile ownership; deep-link routes are relative only; templates escape HTML. |
| Testing | Unit: templates, preference resolution, recipient resolution. Integration: outbox worker against a test DB (retry/backoff, `SKIP LOCKED`). Contract tests for API shapes. Manual push test on real iOS and Android devices. |

---

## 10. Client work

### 10.1 Web (Next.js)

- One shared `NotificationBell` (unread badge, dropdown of the latest 10, "Mark all read", "View all") used in:
  - the landing `navbar.tsx` (learner: scoped to the active profile, plus the account section)
  - the instructor `navbar.tsx` (replacing the current implementation)
  - the admin `navbar.tsx` (**replacing the hardcoded fake list**)
- Pages: learner `/notifications`, keep `/instructor/notifications`, add `/admin/notifications`. A preferences tab under each role's settings.
- A Socket.IO listener in a provider, updating the React Query caches (`notifications`, `unread-count`) live.
- Web push (service worker): optional, phase 4.

### 10.2 Mobile (Flutter)

- Packages: `firebase_core`, `firebase_messaging`, `flutter_local_notifications`.
- Platform setup: Firebase project, `google-services.json` (Android), `GoogleService-Info.plist` plus APNs key (iOS), the Android 13+ `POST_NOTIFICATIONS` permission, and an Android notification channel.
- Lifecycle: register the token after login and on `onTokenRefresh`; delete it on logout; prompt for permission at a sensible moment (after first login, not at launch).
- Foreground messages are shown with a local notification; tapping one (from background or terminated state) routes via `data.route` through `go_router`, switching the learner profile first when needed.
- Screens: replace the `/instructor/notifications` placeholder; add a learner notifications screen plus a bell with badge in `learner_dashboard_layout.dart` and `landing_layout.dart`; add a preferences screen under settings.
- Live badge: listen to `notification:unread` on a shared socket connection (the chat already has a socket pattern to reuse).

---

## 11. Phased delivery

| Phase | Scope | Outcome |
|---|---|---|
| **1. Foundation + in-app** | Schema (§3) + migration; `NotificationService` with templates and recipient resolution; API (§8); Socket.IO realtime; wire the **core triggers**: enrolment, session added/updated/cancelled, exam/assignment published and graded, certificate issued, course approved/rejected, instructor approved/rejected, admin review queue (course, instructor, waiver, chat report); web bells for all three roles; mobile notification screens (in-app only). | Every role sees real, profile-scoped notifications live. |
| **2. Email** | SES v2 client, HTML/text layouts, delivery worker, preferences API + UI, unsubscribe links, **verification + password-reset emails**, billing and security emails. | Reliable email with retries; the auth email TODOs are closed. |
| **3. Push + reminders** | `PushToken` + endpoints, Firebase Admin, mobile FCM integration + deep links, scheduler (session/exam/assignment/renewal reminders), chat digest throttling. | Mobile push and time-based reminders. |
| **4. Polish** | Admin broadcast, daily digests, quiet hours, web push, bounce handling, dead-letter admin view, localization beyond English. | Full production feature set. |

---

## 12. Open decisions (please answer or edit)

1. **Learner feed scope:** should an account holder see all their profiles' notifications in one combined feed, or only the active profile's (with per-profile badges on the profile picker)? *Recommended: active profile only, plus the account section.*
2. **Account-level notifications** (billing, waiver): show them inside every learner profile's bell, or only on the account/profile-management screens?
3. **Queue:** Postgres outbox (recommended) or Redis/BullMQ? Is a managed Redis available on Render?
4. **Worker hosting:** in the API process first, or a separate Render background worker from day one?
5. **Push provider:** FCM for Android + iOS. OK? Is there an existing Firebase project?
6. **Email provider:** AWS SES as the env suggests? Is the sending domain verified and out of the SES sandbox?
7. **Admin recipients:** all Admin-role users, or permission-based?
8. **Chat notifications:** digest every 10 minutes (recommended), per-message, or none?
9. **Timezone:** add `User.timezone` captured from the client?
10. **Languages:** English-only for v1?
11. **Retention:** 90 days read / 180 days unread OK?
12. **Phase 1 trigger list:** confirm or trim the "core triggers" in §11.
