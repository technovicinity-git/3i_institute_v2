import { isLocale, localeNames } from "@/i18n/config";

/** A course's teaching language, named in its own script. */
export function languageLabel(code: string): string {
  return isLocale(code) ? localeNames[code] : code;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);
}
