import { randomUUID } from "node:crypto";
import { env } from "#/config/env";
import { prisma } from "#/lib/prisma";
import { getMailer, MailerError, type MailAttachment } from "#/lib/mailer";
import { emailService } from "#/modules/email/service";
import { customEmail } from "#/modules/email/templates/admin/custom-email";
import { NotFoundError, ValidationError } from "#/shared/errors";

export type AdminEmailAudience = "INSTRUCTORS" | "LEARNERS" | "ALL" | "USERS";

export interface AdminEmailInput {
  audience: AdminEmailAudience;
  // Required when audience is USERS.
  userIds?: string[];
  subject: string;
  // Markdown from the rich text editor.
  body: string;
  greeting: boolean;
}

interface Recipient {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

// Attachment limits. Resend caps a whole email at 40MB after base64
// encoding; staying well under keeps delivery reliable for every inbox.
export const MAX_ATTACHMENTS = 5;
export const MAX_ATTACHMENTS_BYTES = 10 * 1024 * 1024;
export const ALLOWED_ATTACHMENT_EXTENSIONS = [
  "pdf",
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "txt",
  "csv",
];

// Pause between single sends (emails with attachments) to stay inside the
// provider's per-second rate limit.
const SINGLE_SEND_GAP_MS = 600;
const MAX_ATTEMPTS = 4;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ──────────────────────────────────
// Recipients
// ──────────────────────────────────

// Only active accounts with a verified email: unverified addresses may be
// mistyped, and inactive users can't act on the email anyway.
const reachable = { isActive: true, emailVerified: true } as const;
const recipientSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
} as const;

async function resolveRecipients(
  audience: AdminEmailAudience,
  userIds: string[] = [],
): Promise<Recipient[]> {
  if (audience === "USERS") {
    if (userIds.length === 0) {
      throw new ValidationError("Choose at least one person");
    }
    return prisma.user.findMany({
      where: { id: { in: userIds }, ...reachable },
      select: recipientSelect,
    });
  }

  const instructorsWhere = { role: { name: "Instructor" } };
  // Learner accounts: anyone holding an active learner profile (a parent
  // account gets one email for all its children's profiles).
  const learnersWhere = { learnerProfiles: { some: { deletedAt: null } } };

  return prisma.user.findMany({
    where: {
      ...reachable,
      ...(audience === "INSTRUCTORS"
        ? instructorsWhere
        : audience === "LEARNERS"
          ? learnersWhere
          : { OR: [instructorsWhere, learnersWhere] }),
    },
    select: recipientSelect,
  });
}

// ──────────────────────────────────
// Sending (runs in the background)
// ──────────────────────────────────

function messageFor(
  recipient: Recipient,
  input: Pick<AdminEmailInput, "subject" | "body" | "greeting">,
) {
  return customEmail({
    subject: input.subject,
    body: input.body,
    firstName: input.greeting ? recipient.firstName : undefined,
  });
}

// Without attachments: the provider's batch API, 100 emails per call.
async function sendBatched(
  recipients: Recipient[],
  input: AdminEmailInput,
): Promise<{ sent: number; failed: number }> {
  return emailService.sendMany({
    template: "admin.custom-email",
    messages: recipients.map((recipient) => ({
      to: recipient.email,
      data: {
        subject: input.subject,
        body: input.body,
        firstName: input.greeting ? recipient.firstName : undefined,
      },
    })),
  });
}

// With attachments: the batch API can't carry files, so emails go one by
// one, paced, with progress saved as it goes.
async function sendOneByOne(
  emailId: string,
  recipients: Recipient[],
  input: AdminEmailInput,
  attachments: MailAttachment[],
): Promise<{ sent: number; failed: number }> {
  const result = { sent: 0, failed: 0 };
  if (!env.EMAIL_ENABLED) return result;

  for (const [index, recipient] of recipients.entries()) {
    const content = messageFor(recipient, input);
    const idempotencyKey = `admin.custom-email/${emailId}/${recipient.id}`;
    for (let attempt = 1; ; attempt++) {
      try {
        await getMailer().send({
          to: recipient.email,
          subject: content.subject,
          html: content.html,
          text: content.text,
          attachments,
          idempotencyKey,
          tags: { template: "admin.custom-email", env: env.NODE_ENV },
        });
        result.sent++;
        break;
      } catch (error) {
        const retryable = error instanceof MailerError && error.retryable;
        if (!retryable || attempt >= MAX_ATTEMPTS) {
          result.failed++;
          console.error(
            `[admin-email] ${emailId} to user ${recipient.id} failed — ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
          break;
        }
        await sleep(SINGLE_SEND_GAP_MS * 2 ** attempt);
      }
    }

    // Save progress every 10 emails so the history shows it moving.
    if ((index + 1) % 10 === 0) {
      await prisma.adminEmail.update({
        where: { id: emailId },
        data: { sentCount: result.sent, failedCount: result.failed },
      });
    }
    if (index < recipients.length - 1) await sleep(SINGLE_SEND_GAP_MS);
  }
  return result;
}

async function deliver(
  emailId: string,
  recipients: Recipient[],
  input: AdminEmailInput,
  attachments: MailAttachment[],
) {
  let result = { sent: 0, failed: recipients.length };
  try {
    result =
      attachments.length > 0
        ? await sendOneByOne(emailId, recipients, input, attachments)
        : await sendBatched(recipients, input);
  } catch (error) {
    console.error(
      `[admin-email] ${emailId} stopped — ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

  // With email switched off nothing is sent but nothing failed either.
  const status = !env.EMAIL_ENABLED
    ? "SENT"
    : result.failed === 0
      ? "SENT"
      : result.sent === 0
        ? "FAILED"
        : "PARTIAL";

  await prisma.adminEmail.update({
    where: { id: emailId },
    data: {
      sentCount: result.sent,
      failedCount: result.failed,
      status,
      completedAt: new Date(),
    },
  });
}

// ──────────────────────────────────
// Public API
// ──────────────────────────────────

export const adminEmailService = {
  async preview(audience: AdminEmailAudience, userIds?: string[]) {
    if (audience === "USERS" && (!userIds || userIds.length === 0)) {
      return { recipientCount: 0 };
    }
    const recipients = await resolveRecipients(audience, userIds);
    return { recipientCount: recipients.length };
  },

  // Saves the email to history and starts sending in the background; the
  // response doesn't wait for delivery.
  async send(
    senderId: string,
    input: AdminEmailInput,
    attachments: MailAttachment[],
  ) {
    const recipients = await resolveRecipients(input.audience, input.userIds);
    if (recipients.length === 0) {
      throw new ValidationError(
        "No one in this audience has an active, verified email address",
      );
    }

    const email = await prisma.adminEmail.create({
      data: {
        id: randomUUID(),
        senderId,
        audience: input.audience,
        subject: input.subject,
        body: input.body,
        attachments: attachments.map((a) => ({
          name: a.filename,
          size: a.content.length,
          type: a.contentType ?? null,
        })),
        recipients:
          input.audience === "USERS"
            ? recipients.map((r) => ({
                id: r.id,
                name: `${r.firstName} ${r.lastName}`.trim(),
                email: r.email,
              }))
            : undefined,
        recipientCount: recipients.length,
      },
    });

    void deliver(email.id, recipients, input, attachments);

    return { id: email.id, recipientCount: recipients.length };
  },

  async list(page: number, limit: number) {
    const [total, emails] = await Promise.all([
      prisma.adminEmail.count(),
      prisma.adminEmail.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          sender: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
    ]);
    return { emails, total, page, limit, hasMore: page * limit < total };
  },

  async get(id: string) {
    const email = await prisma.adminEmail.findUnique({
      where: { id },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!email) throw new NotFoundError("Email not found");
    return email;
  },
};
