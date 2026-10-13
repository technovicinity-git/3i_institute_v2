import { randomUUID } from "node:crypto";
import { env } from "#/config/env";
import { getMailer, MailerError, type MailResult } from "#/lib/mailer";
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

const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 500;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Logs never include the email body or full address: bodies carry one-time
// tokens, and addresses are personal data.
function maskEmail(email: string): string {
  const [local = "", domain = ""] = email.split("@");
  return `${local.slice(0, 2)}***@${domain}`;
}

export class EmailService {
  // Renders a template and sends it, retrying temporary provider errors
  // (rate limits, 5xx, network) with exponential backoff. Throws on final
  // failure. Returns null when email is switched off (EMAIL_ENABLED=false).
  async send<TName extends EmailTemplateName>(
    input: SendEmailInput<TName>,
  ): Promise<MailResult | null> {
    if (!env.EMAIL_ENABLED) return null;

    const render = emailTemplates[input.template] as EmailTemplate<
      EmailTemplateData<TName>
    >;
    const content = render(input.data);
    const mailer = getMailer();
    // One key for all attempts: a retry after a timeout can't send twice.
    const idempotencyKey = `${input.template}/${randomUUID()}`;

    for (let attempt = 1; ; attempt++) {
      try {
        return await mailer.send({
          to: input.to,
          subject: content.subject,
          html: content.html,
          text: content.text,
          replyTo: input.replyTo,
          tags: { template: input.template, env: env.NODE_ENV },
          idempotencyKey,
        });
      } catch (error) {
        const retryable = error instanceof MailerError && error.retryable;
        if (!retryable || attempt >= MAX_ATTEMPTS) throw error;
        await sleep(BASE_DELAY_MS * 2 ** (attempt - 1));
      }
    }
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
        const reason =
          error instanceof MailerError
            ? `${error.code ?? "network"}: ${error.message}`
            : error instanceof Error
              ? error.message
              : String(error);
        console.error(
          `[email] ${input.template} to ${maskEmail(input.to)} failed — ${reason}`,
        );
      });
  }
}

export const emailService = new EmailService();
