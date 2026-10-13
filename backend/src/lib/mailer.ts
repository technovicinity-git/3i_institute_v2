import { Resend } from "resend";
import { env } from "#/config/env";

// Low-level email transport. Application code sends email through
// `emailService` (modules/email), which renders templates and handles
// retries; this file only knows how to hand a finished message to a provider.

export interface MailMessage {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  // Provider-side labels for filtering in the Resend dashboard.
  tags?: Record<string, string>;
  // Same key on a retry = the provider sends the email at most once.
  idempotencyKey?: string;
}

export interface MailResult {
  id: string;
}

export class MailerError extends Error {
  constructor(
    message: string,
    public readonly retryable: boolean,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "MailerError";
  }
}

export interface Mailer {
  readonly name: string;
  send(message: MailMessage): Promise<MailResult>;
}

// Resend error codes worth retrying; everything else (bad address, invalid
// key, quota) fails the same way on every attempt.
const RETRYABLE_RESEND_ERRORS = new Set([
  "rate_limit_exceeded",
  "application_error",
  "internal_server_error",
  "concurrent_idempotent_requests",
]);

// Resend tag values allow only ASCII letters, numbers, `_` and `-`.
const toTagValue = (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, "_");

class ResendMailer implements Mailer {
  readonly name = "resend";
  private readonly client: Resend;
  private readonly from: string;

  constructor(apiKey: string) {
    this.client = new Resend(apiKey);
    this.from = `${env.MAIL_FROM_NAME} <${env.MAIL_FROM}>`;
  }

  async send(message: MailMessage): Promise<MailResult> {
    let response;
    try {
      response = await this.client.emails.send(
        {
          from: this.from,
          to: message.to,
          subject: message.subject,
          html: message.html,
          text: message.text,
          replyTo: message.replyTo ?? env.MAIL_REPLY_TO,
          tags: Object.entries(message.tags ?? {}).map(([name, value]) => ({
            name: toTagValue(name),
            value: toTagValue(value),
          })),
        },
        message.idempotencyKey
          ? { idempotencyKey: message.idempotencyKey }
          : undefined,
      );
    } catch (error) {
      // Network failure before Resend answered.
      throw new MailerError(
        error instanceof Error ? error.message : "Network error",
        true,
      );
    }

    if (response.error) {
      throw new MailerError(
        response.error.message,
        RETRYABLE_RESEND_ERRORS.has(response.error.name),
        response.error.name,
      );
    }

    return { id: response.data.id };
  }
}

// Fallback when no API key is set. In development it prints the whole email
// so links (verification, password reset) can be copied from the server log.
// The body is never logged in production: it contains one-time tokens.
class ConsoleMailer implements Mailer {
  readonly name = "console";

  constructor(private readonly includeBody: boolean) {}

  async send(message: MailMessage): Promise<MailResult> {
    const id = `console-${Date.now()}`;
    console.info(
      [
        "──────── 📧 Email (not sent: RESEND_API_KEY is not set) ────────",
        `To:      ${[message.to].flat().join(", ")}`,
        `Subject: ${message.subject}`,
        ...(this.includeBody ? ["", message.text] : []),
        "────────────────────────────────────────────────────────────────",
      ].join("\n"),
    );
    return { id };
  }
}

let mailer: Mailer | undefined;

export function getMailer(): Mailer {
  if (mailer) return mailer;

  if (env.RESEND_API_KEY) {
    mailer = new ResendMailer(env.RESEND_API_KEY);
  } else {
    if (env.NODE_ENV === "production") {
      console.error(
        "❌ RESEND_API_KEY is not set: emails will be logged, not delivered.",
      );
    }
    mailer = new ConsoleMailer(env.NODE_ENV !== "production");
  }
  return mailer;
}
