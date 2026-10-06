# Notification Rules

Plain-language rules for **who gets notified, when, and what they see**.
Each rule says whether it is a **push** notification (phone alert) or **in-app only** (shows under the bell, no phone alert).

Edit this file to add, remove or change rules. The technical design is in [notification-plan.md](notification-plan.md).

---

## General rules (apply to everyone)

1. **Every notification appears in-app** under the bell, with an unread badge. "Push" means it *also* alerts the phone.
2. **Tapping a notification opens the related screen** (the session, the exam result, the course, …).
3. **Learners:** notifications belong to a **learner profile**, not the whole account. Each profile sees only its own. Push alerts go to the account holder's phone and start with the profile name, e.g. *"Aisha · Your exam has been graded"*.
4. **Waitlisted learners** do not get batch or session notifications until they get a seat.
5. **Nobody is notified about their own action.** For example, an instructor who edits a session doesn't get a notification about it.
6. **Lock-screen text stays simple and safe for children.** No marks, grades, message text or other learners' names appear on the lock screen; full details are shown inside the app.
7. Users can turn off non-essential push alerts in Settings. Security and payment alerts can't be turned off.

---

## 1. Learner (learner profile)

### Classes and sessions (online class courses)

| When this happens | Who gets notified | Push? | Example message |
|---|---|---|---|
| Instructor **creates a new session** in a batch | All learners enrolled in that batch | ✅ Push | **New class scheduled** — "Tajweed Basics · Session 4" on Mon, 12 May at 7:00 PM |
| Instructor **changes the date or time** of a session | All learners enrolled in that batch | ✅ Push | **Class time changed** — "Session 4" moved to Tue, 13 May at 6:00 PM |
| Instructor **adds or changes the meeting link** | All learners enrolled in that batch | ✅ Push | **Meeting link ready** — Join link added for "Session 4" |
| Instructor **deletes a session** | All learners enrolled in that batch | ✅ Push | **Class cancelled** — "Session 4" on 12 May has been cancelled |
| Instructor changes **only the title or notes** of a session | All learners enrolled in that batch | ❌ In-app only | **Class updated** — Details for "Session 4" were updated |
| **24 hours before** a session starts | All learners enrolled in that batch | ✅ Push | **Class tomorrow** — "Session 4" starts tomorrow at 7:00 PM |
| **15 minutes before** a session starts | All learners enrolled in that batch | ✅ Push | **Class starting soon** — "Session 4" starts in 15 minutes. Tap to join |
| Instructor **closes the batch** | All learners enrolled in that batch | ✅ Push | **Batch closed** — "January Cohort" has been closed |

### Exams

| When this happens | Who gets notified | Push? | Example message |
|---|---|---|---|
| Instructor **creates an exam** (online class) | All learners enrolled in the course or batch | ✅ Push | **New exam** — "Midterm" is scheduled for 20 May at 5:00 PM |
| Instructor **creates an exam** (regular course) | All learners enrolled in the course | ❌ In-app only | **New exam available** — "Unit 1 Test" is now available |
| Instructor **changes the start time** of a scheduled exam | All learners enrolled | ✅ Push | **Exam time changed** — "Midterm" now starts 21 May at 5:00 PM |
| **15 minutes before** a scheduled exam opens | All learners enrolled | ✅ Push | **Exam starting soon** — "Midterm" opens in 15 minutes |
| Instructor **grades a learner's exam** (written answers) | **Only that learner** | ✅ Push | **Exam graded** — Your "Midterm" result is ready |
| Learner submits a fully auto-graded exam | — | No notification | (The result is shown on screen immediately) |

### Assignments

| When this happens | Who gets notified | Push? | Example message |
|---|---|---|---|
| Instructor **creates an assignment** for a batch | All learners in that batch | ✅ Push | **New assignment** — "Essay on Seerah" due 25 May |
| Instructor **creates an assignment** for the whole course | All learners enrolled in the course | ✅ Push | **New assignment** — "Essay on Seerah" due 25 May |
| **24 hours before the due date**, not yet submitted | Learners who **haven't submitted** | ✅ Push | **Assignment due tomorrow** — "Essay on Seerah" is due tomorrow |
| Instructor **grades an assignment** | **Only that learner** | ✅ Push | **Assignment graded** — "Essay on Seerah" has been graded. Tap to see feedback |

### Course content

| When this happens | Who gets notified | Push? | Example message |
|---|---|---|---|
| Instructor **uploads a new video or document** | All learners enrolled in the course | ❌ In-app only | **New lesson added** — "Lesson 5: Makharij" in Tajweed Basics |
| Several lessons uploaded on the same day | All learners enrolled | ❌ In-app only | Combined into one: **3 new lessons added** in Tajweed Basics |

### Enrolment and certificates

| When this happens | Who gets notified | Push? | Example message |
|---|---|---|---|
| Learner **enrols** in a course | That learner | ❌ In-app only | **Enrolled** — You're enrolled in "Tajweed Basics" |
| Learner is **added to a waitlist** | That learner | ❌ In-app only | **On the waitlist** — You're #3 on the waitlist for "January Cohort" |
| Learner **gets a seat from the waitlist** | That learner | ✅ Push | **You're in!** — A seat opened in "January Cohort" |
| A **certificate is issued** | That learner | ✅ Push | **Certificate ready** — Your certificate for "Tajweed Basics" is ready |

### Class chat

| When this happens | Who gets notified | Push? | Example message |
|---|---|---|---|
| New messages in the batch chat | Learners in that batch (with chat enabled), **except the sender** | ❌ In-app badge only | Unread badge on the chat |
| New messages while the learner is away from the chat | Same as above | ✅ Push, **at most once every 10 minutes** per batch | **New messages** — 5 new messages in "January Cohort" chat |
| Learner has the chat open | — | No push | (They're already reading it) |

---

## 2. Account holder (parent/guardian account)

These belong to the account, not to a single learner profile.

| When this happens | Push? | Example message |
|---|---|---|
| Subscription **payment succeeded** | ❌ In-app + email | **Payment received** — Thanks! Your payment of $20.00 was successful |
| Subscription **payment failed** | ✅ Push + email (can't be turned off) | **Payment failed** — Please update your payment method to keep access |
| Subscription **cancelled** | ❌ In-app + email | **Subscription cancelled** — Access ends on 30 June |
| Subscription **renews in 3 days** | ❌ Email only | **Renewal reminder** — Your plan renews on 1 June |
| **Waiver approved / rejected / revoked** | ✅ Push + email | **Waiver approved** — Your 50% waiver is now active |
| Waiver **expires in 7 days** | ❌ In-app + email | **Waiver ending soon** — Your waiver ends on 15 June |
| **Password changed** | Email only (can't be turned off) | Your password was changed. If this wasn't you, reset it now |
| **Email address changed** | Email to the **old** address (can't be turned off) | Your account email was changed |
| **New device signs in** | Email | New sign-in on "Pixel 8" |

---

## 3. Instructor

### Account and courses

| When this happens | Who gets notified | Push? | Example message |
|---|---|---|---|
| Admin **approves the instructor application** | That instructor | Email + in-app | **Welcome aboard!** — Your instructor application is approved |
| Admin **rejects the application** | That instructor | Email | **Application update** — Your application was not approved. Reason: … |
| Admin **approves a course** | The course's instructor | ✅ Push | **Course approved** — "Tajweed Basics" is now published |
| Admin **rejects a course** | The course's instructor | ✅ Push | **Course needs changes** — "Tajweed Basics" was not approved. Reason: … |
| Admin **suspends a course** | The course's instructor | ✅ Push | **Course suspended** — "Tajweed Basics" has been suspended |

### Learners and classes

| When this happens | Who gets notified | Push? | Example message |
|---|---|---|---|
| A learner **enrols** in their course | The course's instructor | ❌ In-app, grouped daily | **New enrolments** — 4 new learners joined "Tajweed Basics" today |
| A batch **becomes full** | The course's instructor | ❌ In-app only | **Batch full** — "January Cohort" has reached 30/30 |
| **15 minutes before** their own session | The course's instructor | ✅ Push | **Your class starts soon** — "Session 4" starts in 15 minutes |
| A learner **submits an exam with written answers** | The course's instructor | ✅ Push | **Exam needs grading** — Aisha submitted "Midterm" |
| Learners **submit an assignment** | The course's instructor | ❌ In-app, grouped per assignment | **New submissions** — 3 new submissions for "Essay on Seerah" |
| Ungraded work **older than 3 days** | The course's instructor | ✅ Push, once a day | **Grading reminder** — 5 submissions are waiting to be graded |
| A learner **rates the course** | The course's instructor | ❌ In-app only | **New rating** — "Tajweed Basics" received a 5★ review |
| New messages in their batch chat | The course's instructor | ✅ Push, at most once every 10 minutes per batch | **New messages** — 5 new messages in "January Cohort" chat |

---

## 4. Admin

Every admin gets these. When **one admin handles an item** (approves the course, reviews the waiver, …), the notification is **cleared for the other admins** too, so nothing is handled twice.

| When this happens | Push? | Example message |
|---|---|---|
| A new **instructor application** is submitted | Email + in-app | **New instructor application** — Ahmed Khan applied to teach |
| An instructor **submits a course for review** | Email + in-app | **Course review needed** — "Tajweed Basics" by Ahmed Khan |
| An account holder **requests a waiver** | Email + in-app | **Waiver request** — New waiver request from Sara Ali |
| A learner or instructor **reports a chat message** | ✅ Push + email | **Message reported** — A message in "January Cohort" chat was reported |
| A subscription **payment fails** | ❌ In-app only | **Payment failed** — Payment failed for sara@example.com |
| Every morning (optional) | Email digest | **Daily summary** — 3 courses to review, 2 waivers pending, 1 report |

---

## 5. Things that will NOT send notifications

- Learners saving notes, watching videos or making progress.
- Auto-graded exam results (shown immediately on screen).
- An instructor editing course details, questions or materials that are already published (except new lessons, which are in-app only).
- Your own actions (you won't be notified about something you did).
- Waitlisted learners, for batch, session and chat events.
- Archived or deleted learner profiles.

---

## 6. Questions to confirm

1. Should learners get **push** for new lessons, or keep that **in-app only**? (Current rule: in-app only.)
2. Session reminders at **24 hours and 15 minutes**: are both needed, or just 15 minutes?
3. Chat push **at most once every 10 minutes**, or no chat push at all?
4. Should instructors get a push for **every enrolment**, or the daily grouped summary? (Current rule: daily summary, in-app only.)
5. Should a learner's **account holder also get an email** when their exam or assignment is graded?
6. Is the admin **daily summary email** wanted?
