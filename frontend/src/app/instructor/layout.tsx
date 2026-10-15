import { NextIntlClientProvider } from "next-intl";
import englishMessages from "../../../messages/en.json";
import { ForceEnglishLtr } from "@/components/i18n/force-english-ltr";

// This panel isn't translated: shared components (e.g. sign-out toasts) use
// English here whatever the account's language is, and layout stays LTR.
export default function InstructorRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <NextIntlClientProvider locale="en" messages={englishMessages}>
      <ForceEnglishLtr>{children}</ForceEnglishLtr>
    </NextIntlClientProvider>
  );
}
