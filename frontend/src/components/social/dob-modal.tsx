"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DAYS, monthOptions, YEARS } from "@/lib/date-utils";
import { useLocale, useTranslations } from "next-intl";

interface DobModalProps {
  isOpen: boolean;
  provider: "google" | "apple";
  onClose: () => void;
  onSubmit: (dateOfBirth: string) => void;
  isLoading?: boolean;
}

export function DobModal({
  isOpen,
  provider,
  onClose,
  onSubmit,
  isLoading = false,
}: DobModalProps) {
  const t = useTranslations("auth.social");
  const tCommon = useTranslations("common");
  const tRegister = useTranslations("auth.register");
  const locale = useLocale();
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setDay("");
      setMonth("");
      setYear("");
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!day || !month || !year) {
      setError(t("selectDob"));
      return;
    }

    const dateOfBirth = `${year}-${month}-${day}`;
    const dob = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();

    if (age < 13) {
      setError(t("tooYoung"));
      return;
    }

    setError(null);
    onSubmit(dateOfBirth);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md md:max-w-lg bg-white rounded-2xl border border-gray-100 p-6 md:p-10">
        <DialogHeader className="mb-6 md:mb-8">
          <div className="mb-6 md:mb-8 inline-flex w-fit">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-sm text-muted">
              <svg
                aria-hidden="true"
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              {t("signingInWith", {
                provider: provider === "google" ? "Google" : "Apple",
              })}
            </span>
          </div>

          <DialogTitle className="font-serif text-[32px] md:text-4xl leading-tight text-primary mb-4 tracking-tight">
            {t("oneMoreStep")}
          </DialogTitle>
          <p className="text-muted text-base leading-relaxed">
            {t("dobReason")}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <fieldset>
            <legend className="block text-sm font-semibold text-primary mb-3">
              {tRegister("dateOfBirth")}
            </legend>
            <div className="grid grid-cols-[30%_1fr_33%] gap-3">
              <div>
                <label className="sr-only" htmlFor="dob-day">
                  {t("day")}
                </label>
                <select
                  id="dob-day"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 md:px-4 py-3 text-muted text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="" disabled>
                    {t("dayPlaceholder")}
                  </option>
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="sr-only" htmlFor="dob-month">
                  {t("month")}
                </label>
                <select
                  id="dob-month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 md:px-4 py-3 text-muted text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="" disabled>
                    {t("month")}
                  </option>
                  {monthOptions(locale).map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="sr-only" htmlFor="dob-year">
                  {t("year")}
                </label>
                <select
                  id="dob-year"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 md:px-4 py-3 text-muted text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="" disabled>
                    {t("yearPlaceholder")}
                  </option>
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </fieldset>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button
            type="submit"
            className="w-full bg-green hover:bg-green-dark text-white font-medium text-base md:text-lg py-3.5 px-4 rounded-lg"
            disabled={isLoading}
          >
            {isLoading ? tCommon("pleaseWait") : tCommon("continue")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
