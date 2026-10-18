import type { Locale } from "@/i18n/config";
import type messages from "../../messages/en.json";

// English is the source of truth: keys used with useTranslations() are
// type-checked against messages/en.json.
declare module "next-intl" {
  interface AppConfig {
    Locale: Locale;
    Messages: typeof messages;
  }
}
