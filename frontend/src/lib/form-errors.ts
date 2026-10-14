/* eslint-disable @typescript-eslint/no-explicit-any */

export type FieldErrors<K extends string> = Partial<Record<K, string>>;

export interface ApiFormError<K extends string> {
  /** Errors to show under specific inputs. */
  fieldErrors: FieldErrors<K>;
  /** Error to show at the top of the form (not tied to one input). */
  formError: string | null;
}

/**
 * Splits an API error into per-field messages and a form-level message so a
 * form can show "Current password is incorrect" under the right input
 * instead of a toast.
 *
 * - Zod `details.fieldErrors` keys are used as-is when they are in `fields`.
 * - `messageToField` routes known server messages (matched case-insensitively
 *   by substring) to a field, e.g. `{ "current password": "currentPassword" }`.
 */
export function parseApiFormError<K extends string>(
  error: unknown,
  fields: readonly K[],
  messageToField: Record<string, K> = {},
  fallback = "Something went wrong. Please try again.",
): ApiFormError<K> {
  const err = error as any;
  const response = err?.response;

  if (!response) {
    return {
      fieldErrors: {},
      formError:
        "Couldn't reach the server. Check your internet connection and try again.",
    };
  }

  if (response.status === 429) {
    return {
      fieldErrors: {},
      formError: "Too many attempts. Please wait a moment and try again.",
    };
  }

  const message: string | undefined = response.data?.error?.message;
  const fieldErrors: FieldErrors<K> = {};

  const zodFieldErrors = response.data?.error?.details?.fieldErrors as
    | Record<string, string[] | undefined>
    | undefined;
  if (zodFieldErrors) {
    for (const [key, messages] of Object.entries(zodFieldErrors)) {
      if ((fields as readonly string[]).includes(key) && messages?.[0]) {
        fieldErrors[key as K] = messages[0];
      }
    }
  }

  if (message) {
    const lower = message.toLowerCase();
    for (const [needle, field] of Object.entries(messageToField)) {
      if (lower.includes(needle.toLowerCase())) {
        fieldErrors[field] ??= message;
        return { fieldErrors, formError: null };
      }
    }
  }

  const hasFieldErrors = Object.keys(fieldErrors).length > 0;
  return {
    fieldErrors,
    formError: hasFieldErrors ? null : (message ?? fallback),
  };
}
