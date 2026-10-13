import type { RenderedEmail } from "#/modules/email/templates/layout";

export interface EmailContent extends RenderedEmail {
  subject: string;
}

// A template is a pure function from its data to a finished email. Keep
// templates free of database or network access: callers load the data.
export type EmailTemplate<TData> = (data: TData) => EmailContent;
