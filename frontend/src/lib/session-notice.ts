import type { Session } from "@/types/batch";

// What enrolled learners will receive when an instructor adds, edits or
// deletes a session. Mirrors the backend rules in
// backend/src/modules/notification/events.ts (sessionScheduled,
// sessionUpdated, sessionCancelled), so the confirmation never promises
// something that won't be sent.

export interface SessionNotice {
  title: string;
  message: string;
  // false for a plain confirmation that notifies nobody
  notify: boolean;
  // true when learners also get an email, not only the in-app notification
  email: boolean;
  confirmLabel: string;
  destructive?: boolean;
}

type SessionFields = Pick<
  Session,
  "title" | "scheduledAt" | "durationMinutes" | "meetingLink" | "notes"
>;

type SessionChange =
  | { action: "add"; after: SessionFields }
  | { action: "edit"; before: SessionFields; after: SessionFields }
  | { action: "delete"; before: SessionFields };

const learners = (count: number) =>
  `${count} enrolled ${count === 1 ? "learner" : "learners"}`;

const startsInFuture = (session: SessionFields) =>
  new Date(session.scheduledAt).getTime() > Date.now();

const endsInPast = (session: SessionFields) =>
  new Date(session.scheduledAt).getTime() + session.durationMinutes * 60_000 <
  Date.now();

// Returns null when nobody will be notified (no learners, a past session,
// or nothing changed): the action then needs no notification warning.
export function describeSessionNotice(
  change: SessionChange,
  learnerCount: number,
): SessionNotice | null {
  if (learnerCount <= 0) return null;
  const who = learners(learnerCount);

  if (change.action === "add") {
    if (!startsInFuture(change.after)) return null;
    return {
      title: "Notify learners about this class?",
      message: `${who} will get a notification and an email about this new class.`,
      notify: true,
      email: true,
      confirmLabel: "Add & notify",
    };
  }

  if (change.action === "delete") {
    if (!startsInFuture(change.before)) return null;
    return {
      title: "Cancel this class?",
      message: `${who} will get a notification and an email that this class has been cancelled. This can't be undone.`,
      notify: true,
      email: true,
      confirmLabel: "Delete & notify",
      destructive: true,
    };
  }

  const { before, after } = change;
  if (endsInPast(after)) return null;

  const timeChanged =
    new Date(before.scheduledAt).getTime() !==
      new Date(after.scheduledAt).getTime() ||
    before.durationMinutes !== after.durationMinutes;
  if (timeChanged) {
    return {
      title: "Notify learners about the new time?",
      message: `${who} will get a notification and an email with the new class time.`,
      notify: true,
      email: true,
      confirmLabel: "Save & notify",
    };
  }

  const linkChanged =
    (before.meetingLink ?? "") !== (after.meetingLink ?? "") &&
    !!after.meetingLink;
  if (linkChanged) {
    return {
      title: "Notify learners about the join link?",
      message: `${who} will get a notification that the join link was ${before.meetingLink ? "updated" : "added"}. No email is sent for link changes.`,
      notify: true,
      email: false,
      confirmLabel: "Save & notify",
    };
  }

  const detailsChanged =
    before.title !== after.title ||
    (before.notes ?? "") !== (after.notes ?? "");
  if (detailsChanged) {
    return {
      title: "Notify learners about this update?",
      message: `${who} will get an in-app notification that the class details were updated. No email is sent for these changes.`,
      notify: true,
      email: false,
      confirmLabel: "Save & notify",
    };
  }

  return null;
}

// Deleting a session nobody will hear about still needs a confirmation.
export const plainDeleteConfirmation: SessionNotice = {
  title: "Delete this session?",
  message: "This can't be undone.",
  notify: false,
  email: false,
  confirmLabel: "Delete",
  destructive: true,
};
