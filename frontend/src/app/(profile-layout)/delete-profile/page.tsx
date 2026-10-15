"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

// ---- Props ----

interface DeleteProfileCardProps {
  profileName: string;
  destroyedItems?: string;
  survivesItems?: string;
  onDelete: () => void;
  dashboardHref?: string;
}

// ---- Component ----

export default function DeleteProfileCard({
  profileName = "Amina",
  destroyedItems,
  survivesItems,
  onDelete,
  dashboardHref = "/dashboard",
}: DeleteProfileCardProps) {
  const t = useTranslations("deleteProfile");
  const [confirmName, setConfirmName] = useState("");

  const isConfirmed =
    confirmName.trim().toLowerCase() === profileName.trim().toLowerCase();

  return (
    <div
      className="flex items-start justify-center w-full min-h-[calc(100vh-73px)] px-4 sm:px-6 py-12 sm:py-[94px]"
      style={{ fontFamily: "var(--font-body)" }}
    >
      <div className="w-full max-w-[480px] bg-white rounded-lg shadow-lg p-8 sm:p-10 flex flex-col gap-7">
        {/* Title */}
        <h1
          className="text-2xl sm:text-[32px] leading-tight text-[#0C1F33]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {t("title", { name: profileName })}
        </h1>

        {/* Destroyed list */}
        <div className="flex flex-col gap-3">
          <p className="text-base font-semibold text-[#0C1F33]">
            {t("destroyed")}
          </p>
          <p className="text-base text-[#0C1F33] leading-relaxed">
            {destroyedItems ?? t("destroyedItems")}
          </p>
        </div>

        {/* Divider */}
        <hr className="border-[#E3E8EF]" />

        {/* Survives list */}
        <div className="flex flex-col gap-3">
          <p className="text-base font-semibold text-[#0C1F33]">
            {t("survives")}
          </p>
          <p className="text-base text-[#0C1F33] leading-relaxed">
            {survivesItems ?? t("survivesItems")}
          </p>
        </div>

        {/* Confirmation input */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="confirm-name"
            className="text-base font-semibold text-[#0C1F33]"
          >
            {t("typeToConfirm")}
          </label>
          <input
            id="confirm-name"
            type="text"
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            placeholder={profileName}
            className="w-full h-12 px-4 text-[15px] text-[#475569] bg-white border border-[#E3E8EF] rounded-lg outline-none focus:border-[#94A3B8] transition-colors"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={onDelete}
            disabled={!isConfirmed}
            className={`w-full h-12 rounded-lg text-base font-semibold text-[#0C1F33] transition-colors ${
              isConfirmed
                ? "bg-red-600 hover:bg-red-700"
                : "bg-red-300 cursor-not-allowed"
            }`}
          >
            {t("confirm")}
          </button>
          <Link
            href={dashboardHref}
            className="text-sm font-semibold text-[#157A34] hover:text-[#116B2C] transition-colors"
          >
            {t("goBack")}
          </Link>
        </div>
      </div>
    </div>
  );
}
