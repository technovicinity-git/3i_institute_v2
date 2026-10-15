"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useChangeLocale } from "@/hooks/use-change-locale";
import { localeNames, locales, type Locale } from "@/i18n/config";

/** Globe button with the current language; opens the list of languages. */
export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const t = useTranslations("language");
  const { changeLocale, isPending } = useChangeLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const select = (next: Locale) => {
    setOpen(false);
    if (next !== locale) void changeLocale(next);
  };

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={t("changeTo")}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={isPending}
        className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-medium text-[#12304E] hover:bg-gray-50 disabled:opacity-60 transition-colors"
      >
        <Globe className={`w-4 h-4 ${isPending ? "animate-spin" : ""}`} />
        <span className="hidden sm:inline">{localeNames[locale]}</span>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t("label")}
          className="absolute end-0 mt-2 w-44 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1.5"
        >
          {locales.map((code) => (
            <li key={code}>
              <button
                type="button"
                role="option"
                aria-selected={code === locale}
                lang={code}
                dir="auto"
                onClick={() => select(code)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-2 text-sm text-start hover:bg-gray-50 ${
                  code === locale ? "font-semibold text-[#12304E]" : "text-[#334155]"
                }`}
              >
                {localeNames[code]}
                {code === locale && <Check className="w-4 h-4 text-[#22A146]" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
