"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { LOCALE_COOKIE, type Locale } from "@/i18n/config";

const ONE_YEAR = 60 * 60 * 24 * 365;

/** Sets the cookie the server reads to pick the interface language. */
export function setLocaleCookie(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
}

/**
 * Switches the interface language. Signed-in users also get it saved on
 * their account (`User.locale`), so it follows them to other devices and is
 * used for emails.
 */
export function useChangeLocale() {
  const router = useRouter();
  const t = useTranslations("language");
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [isPending, startTransition] = useTransition();

  const changeLocale = async (
    locale: Locale,
    { saveToAccount = true }: { saveToAccount?: boolean } = {},
  ) => {
    setLocaleCookie(locale);
    if (saveToAccount && user && user.locale !== locale) {
      try {
        await apiClient.patch("/users/me", { locale });
        setUser({ ...user, locale });
      } catch {
        toast.error(t("saveFailed"));
      }
    }
    // Re-renders server components with the new language's messages
    startTransition(() => router.refresh());
  };

  return { changeLocale, isPending };
}
