"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

/** Code input that opens /verify/{code}. */
export function VerifyForm({ initialCode = "" }: { initialCode?: string }) {
  const t = useTranslations("verify");
  const router = useRouter();
  const [code, setCode] = useState(initialCode);
  // Codes are printed in upper-case hex; tolerate spaces and dashes.
  const normalised = code.replace(/[\s-]/g, "").toUpperCase();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (normalised) router.push(`/verify/${normalised}`);
      }}
      className="flex flex-col gap-3 sm:flex-row"
    >
      <label className="sr-only" htmlFor="verify-code">
        {t("codeLabel")}
      </label>
      <input
        id="verify-code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder={t("codePlaceholder")}
        dir="ltr"
        autoComplete="off"
        spellCheck={false}
        className="h-12 flex-1 rounded-lg border border-[#E3E8EF] bg-white px-4 font-mono text-sm tracking-wide text-[#0C1F33] outline-none focus:border-[#12304E] focus:ring-2 focus:ring-[#12304E]/10"
      />
      <button
        type="submit"
        disabled={!normalised}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#12304E] px-6 text-sm font-semibold text-white hover:bg-[#1a4268] disabled:opacity-50"
      >
        <Search className="h-4 w-4" />
        {t("submit")}
      </button>
    </form>
  );
}
