"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useAuthStore } from "@/stores/auth-store";
import { isLocale } from "@/i18n/config";
import { setLocaleCookie } from "@/hooks/use-change-locale";

/**
 * After sign-in (or a session restore), applies the language saved on the
 * account, so a user who picked Bengali on their phone sees Bengali on the
 * web too. Runs once per signed-in user; switching language afterwards
 * updates the account itself.
 */
export function LocaleSync() {
  const router = useRouter();
  const locale = useLocale();
  const user = useAuthStore((state) => state.user);
  const syncedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!user) {
      syncedFor.current = null;
      return;
    }
    if (syncedFor.current === user.id) return;
    syncedFor.current = user.id;

    if (isLocale(user.locale) && user.locale !== locale) {
      setLocaleCookie(user.locale);
      router.refresh();
    }
  }, [user, locale, router]);

  return null;
}
