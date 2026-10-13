import { randomUUID } from "node:crypto";
import { env } from "#/config/env";
import {
  getMailer,
  MAX_BATCH_SIZE,
  MailerError,
  type MailMessage,
  type MailResult,
} from "#/lib/mailer";
import {
  emailTemplates,
  type EmailTemplateData,
  type EmailTemplateName,
} from "#/modules/email/templates/index";
import type { EmailTemplate } from "#/modules/email/templates/types";

export interface SendEmailInput<TName extends EmailTemplateName> {
  to: string;
  template: TName;
  data: EmailTemplateData<TName>;
  replyTo?: string;
}

export interface SendManyInput<TName extends EmailTemplateName> {
  template: TName;
  // One entry per recipient, each with its own template data.
  messages: { to: string; data: EmailTemplateData<TName> }[];
}

export interface SendManyResult {
  sent: number;
  failed: number;
}

const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 500;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Logs never include the email body or full address: bodies carry one-time
// tokens, and addresses are personal data.
function maskEmail(email: string): string {
  const [local = "", domain = ""] = email.split("@");
  return `${local.slice(0, 2)}***@${domain}`;
}

function describeError(error: unknown): string {
  if (error instanceof MailerError) {
    return `${error.code ?? "network"}: ${error.message}`;
  }
  return error instanceof Error ? error.message : String(error);
}

// Runs a provider call, retrying temporary errors (rate limits, 5xx,
// network) with exponential backoff. Throws on final failure.
async function withRetry<T>(call: () => Promise<T>): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await call();
    } catch (error) {
      const retryable = error instanceof MailerError && error.retryable;
      if (!retryable || attempt >= MAX_ATTEMPTS) throw error;
      await sleep(BASE_DELAY_MS * 2 ** (attempt - 1));
    }
  }
}

function render<TName extends EmailTemplateName>(
  template: TName,
  data: EmailTemplateData<TName>,
  to: string,
  replyTo?: string,
): Omit<MailMessage, "idempotencyKey"> {
  const renderTemplate = emailTemplates[template] as EmailTemplate<
    EmailTemplateData<TName>
  >;
  const content = renderTemplate(data);
  return {
    to,
    subject: content.subject,
    html: content.html,
    text: content.text,
    replyTo,
    tags: { template, env: env.NODE_ENV },
  };
}

export class EmailService {
  // Renders a template and sends it, retrying temporary provider errors.
  // Throws on final failure. Returns null when email is switched off
  // (EMAIL_ENABLED=false).
  async send<TName extends EmailTemplateName>(
    input: SendEmailInput<TName>,
  ): Promise<MailResult | null> {
    if (!env.EMAIL_ENABLED) return null;

    const message = render(input.template, input.data, input.to, input.replyTo);
    // One key for all attempts: a retry after a timeout can't send twice.
    const idempotencyKey = `${input.template}/${randomUUID()}`;
    return withRetry(() => getMailer().send({ ...message, idempotencyKey }));
  }

  // Fire-and-forget version for request handlers: the API response doesn't
  // wait for the provider, and an email failure never fails the user's
  // action. Failures are logged. `onSent` runs after a successful send.
  sendInBackground<TName extends EmailTemplateName>(
    input: SendEmailInput<TName>,
    onSent?: (result: MailResult) => Promise<unknown>,
  ): void {
    void this.send(input)
      .then(async (result) => {
        if (result && onSent) await onSent(result);
      })
      .catch((error: unknown) => {
        console.error(
          `[email] ${input.template} to ${maskEmail(input.to)} failed — ${describeError(error)}`,
        );
      });
  }

  // Sends the same template to many recipients (e.g. everyone in a batch)
  // through the provider's batch API: one call per 100 emails instead of
  // one per email, which keeps large fan-outs inside the rate limit.
  // Never throws; a failed chunk is logged and counted.
  async sendMany<TName extends EmailTemplateName>(
    input: SendManyInput<TName>,
  ): Promise<SendManyResult> {
    const result: SendManyResult = { sent: 0, failed: 0 };
    if (!env.EMAIL_ENABLED || input.messages.length === 0) return result;

    const messages = input.messages.map(({ to, data }) =>
      render(input.template, data, to),
    );

    for (let i = 0; i < messages.length; i += MAX_BATCH_SIZE) {
      const chunk = messages.slice(i, i + MAX_BATCH_SIZE);
      const idempotencyKey = `${input.template}/batch/${randomUUID()}`;
      try {
        await withRetry(() => getMailer().sendBatch(chunk, idempotencyKey));
        result.sent += chunk.length;
      } catch (error) {
        result.failed += chunk.length;
        console.error(
          `[email] ${input.template} batch of ${chunk.length} failed — ${describeError(error)}`,
        );
      }
    }
    return result;
  }
}

export const emailService = new EmailService();
