// Supported interface languages. `User.locale` on the backend uses the same
// codes; registration and PATCH /users/me accept exactly these.
export const locales = ["en", "bn", "hi", "ur", "ar"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Cookie holding the active interface language. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

/**
 * Languages written right-to-left. The page layout is never mirrored for
 * them; only their text runs and aligns right-to-left (see globals.css).
 */
export const rtlLocales: readonly Locale[] = ["ar", "ur"];

/** Each language's name in its own script, for the language picker. */
export const localeNames: Record<Locale, string> = {
  en: "English",
  bn: "বাংলা",
  hi: "हिन्दी",
  ur: "اردو",
  ar: "العربية",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

