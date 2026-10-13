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

// Most messages one batch call may carry (a Resend limit).
export const MAX_BATCH_SIZE = 100;

export interface Mailer {
  readonly name: string;
  send(message: MailMessage): Promise<MailResult>;
  // Up to MAX_BATCH_SIZE messages in one provider call. All or nothing:
  // on error none of them were sent, so the whole batch can be retried.
  sendBatch(
    messages: Omit<MailMessage, "idempotencyKey">[],
    idempotencyKey?: string,
  ): Promise<MailResult[]>;
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

type ResendResponse<T> =
  | { data: T; error: null }
  | {
      data: null;
      error: { message: string; name: string };
    };

class ResendMailer implements Mailer {
  readonly name = "resend";
  private readonly client: Resend;
  private readonly from: string;

  constructor(apiKey: string) {
    this.client = new Resend(apiKey);
    this.from = `${env.MAIL_FROM_NAME} <${env.MAIL_FROM}>`;
  }

  async send(message: MailMessage): Promise<MailResult> {
    const data = await this.call(() =>
      this.client.emails.send(
        this.toPayload(message),
        message.idempotencyKey
          ? { idempotencyKey: message.idempotencyKey }
          : undefined,
      ),
    );
    return { id: data.id };
  }

  async sendBatch(
    messages: Omit<MailMessage, "idempotencyKey">[],
    idempotencyKey?: string,
  ): Promise<MailResult[]> {
    if (messages.length === 0) return [];
    if (messages.length > MAX_BATCH_SIZE) {
      throw new MailerError(
        `A batch can hold at most ${MAX_BATCH_SIZE} emails`,
        false,
      );
    }
    const data = await this.call(() =>
      this.client.batch.send(
        messages.map((message) => this.toPayload(message)),
        idempotencyKey ? { idempotencyKey } : undefined,
      ),
    );
    return data.data.map(({ id }) => ({ id }));
  }

  private toPayload(message: Omit<MailMessage, "idempotencyKey">) {
    return {
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
    };
  }

  // Runs a Resend call and turns its `{ data, error }` result into a value
  // or a MailerError that says whether a retry can help.
  private async call<T>(request: () => Promise<ResendResponse<T>>): Promise<T> {
    let response: ResendResponse<T>;
    try {
      response = await request();
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
    return response.data;
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

  async sendBatch(
    messages: Omit<MailMessage, "idempotencyKey">[],
  ): Promise<MailResult[]> {
    const results: MailResult[] = [];
    for (const message of messages) results.push(await this.send(message));
    return results;
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
