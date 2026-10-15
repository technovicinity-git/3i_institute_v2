import type { Metadata } from "next";
import {
  Inter,
  Libre_Caslon_Text,
  Noto_Naskh_Arabic,
  Noto_Sans_Bengali,
  Noto_Sans_Devanagari,
} from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { LocaleSync } from "@/components/i18n/locale-sync";
import { QueryProvider } from "@/lib/query-provider";
import { Toaster } from "sonner";
import { ConfirmProvider } from "@/components/ui/confirm-dialog";
import { AccountStatusWatcher } from "@/components/layout/account-status-watcher";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const libreCaslon = Libre_Caslon_Text({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-libre-caslon",
  display: "swap",
});

// Script fonts for Bengali, Hindi, Arabic and Urdu. They sit after Inter in
// the font stack (globals.css) and are split by unicode-range, so a browser
// only downloads one when text in that script is on the page.
const notoBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  variable: "--font-bengali",
  display: "swap",
  preload: false,
});

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-devanagari",
  display: "swap",
  preload: false,
});

const notoArabic = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  variable: "--font-arabic",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: "3i International Islamic Institute",
    template: "%s | 3i",
  },
  description:
    "Online Islamic education platform delivering self-paced and live-taught courses.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    // Always left-to-right: Arabic and Urdu keep the same layout, and only their
    // text runs right-to-left (globals.css).
    <html lang={locale} dir="ltr" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${libreCaslon.variable} ${notoBengali.variable} ${notoDevanagari.variable} ${notoArabic.variable} antialiased`}
      >
        <NextIntlClientProvider>
          <QueryProvider>
            <ConfirmProvider>
              {children}
              <AccountStatusWatcher />
              <LocaleSync />
            </ConfirmProvider>
            <Toaster position="top-right" richColors />
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
