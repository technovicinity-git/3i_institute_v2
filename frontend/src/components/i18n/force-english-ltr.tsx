"use client";

import { useLayoutEffect } from "react";

/**
 * The admin and instructor panels are English-only. Marks the page English
 * while mounted, so the Arabic/Urdu right-to-left text rules (keyed on
 * <html lang>) don't apply there, including in dialogs rendered in portals.
 */
export function ForceEnglishLtr({ children }: { children: React.ReactNode }) {
  useLayoutEffect(() => {
    const html = document.documentElement;
    const previous = { dir: html.dir, lang: html.lang };
    html.dir = "ltr";
    html.lang = "en";
    return () => {
      html.dir = previous.dir;
      html.lang = previous.lang;
    };
  }, []);

  return (
    <div dir="ltr" lang="en">
      {children}
    </div>
  );
}
