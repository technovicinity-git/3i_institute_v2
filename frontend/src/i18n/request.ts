import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import {
  defaultLocale,
  isLocale,
  LOCALE_COOKIE,
  rtlLocales,
  type Locale,
} from "@/i18n/config";

/** Best supported match from the browser's Accept-Language header. */
function fromAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null;
  const preferred = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { tag: tag!.toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  for (const { tag } of preferred) {
    const base = tag.split("-")[0];
    if (isLocale(base)) return base;
  }
  return null;
}

// The interface language comes from a cookie (set from the account's saved
// language on sign-in, or by the language picker), falling back to the
// browser's language. URLs stay the same in every language.
export default getRequestConfig(async () => {
  const cookieLocale = (await cookies()).get(LOCALE_COOKIE)?.value;
  const locale: Locale = isLocale(cookieLocale)
    ? cookieLocale
    : (fromAcceptLanguage((await headers()).get("accept-language")) ??
      defaultLocale);

  const messages = (await import(`../../messages/${locale}.json`)).default;
  // Untranslated keys fall back to English instead of showing the key.
  const fallback =
    locale === defaultLocale
      ? messages
      : (await import(`../../messages/${defaultLocale}.json`)).default;

  const merged = deepMerge(fallback, messages);
  return {
    locale,
    messages: rtlLocales.includes(locale) ? markRightToLeft(merged) : merged,
    onError(error) {
      if (error.code !== "MISSING_MESSAGE") console.error(error);
    },
  };
});

type Messages = Record<string, unknown>;

const ARABIC_SCRIPT = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;
const RLM = "‏";

/**
 * Text direction is detected per paragraph from its first strong letter
 * (globals.css). Arabic/Urdu messages that open with Latin text or a value,
 * like "3i انسٹی ٹیوٹ" or "{name} کے لیے", would be read as left-to-right,
 * so each one starts with an invisible right-to-left mark.
 */
function markRightToLeft(messages: Messages): Messages {
  const result: Messages = {};
  for (const [key, value] of Object.entries(messages)) {
    result[key] =
      typeof value === "string"
        ? ARABIC_SCRIPT.test(value) && !value.startsWith(RLM)
          ? RLM + value
          : value
        : value && typeof value === "object"
          ? markRightToLeft(value as Messages)
          : value;
  }
  return result;
}

function deepMerge(base: Messages, override: Messages): Messages {
  const result: Messages = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const current = result[key];
    result[key] =
      value && typeof value === "object" && current && typeof current === "object"
        ? deepMerge(current as Messages, value as Messages)
        : value;
  }
  return result;
}
