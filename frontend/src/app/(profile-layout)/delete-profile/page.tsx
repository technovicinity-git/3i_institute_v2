"use client";

import { useState } from "react";
import Link from "next/link";

// ---- Props ----

interface DeleteProfileCardProps {
  profileName: string;
  destroyedItems: string;
  survivesItems: string;
  onDelete: () => void;
  dashboardHref?: string;
}

// ---- Component ----

export default function DeleteProfileCard({
  profileName = "Amina",
  destroyedItems = "progress, enrolments, exam results, chat messages",
  survivesItems = "certificates, moderation records",
  onDelete,
  dashboardHref = "/dashboard",
}: DeleteProfileCardProps) {
  const [confirmName, setConfirmName] = useState("");

  const isConfirmed =
    confirmName.trim().toLowerCase() === profileName.trim().toLowerCase();

  return (
    <div
      className="flex items-start justify-center w-full min-h-[calc(100vh-73px)] px-4 sm:px-6 py-12 sm:py-[94px]"
      style={{ fontFamily: "'Figtree', sans-serif" }}
    >
      <div className="w-full max-w-[480px] bg-white rounded-lg shadow-lg p-8 sm:p-10 flex flex-col gap-7">
        {/* Title */}
        <h1
          className="text-2xl sm:text-[32px] leading-tight text-[#0C1F33]"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          Delete {profileName}&apos;s profile?
        </h1>

        {/* Destroyed list */}
        <div className="flex flex-col gap-3">
          <p className="text-base font-semibold text-[#0C1F33]">
            This will be destroyed:
          </p>
          <p className="text-base text-[#0C1F33] leading-relaxed">
            {destroyedItems}
          </p>
        </div>

        {/* Divider */}
        <hr className="border-[#E3E8EF]" />

        {/* Survives list */}
        <div className="flex flex-col gap-3">
          <p className="text-base font-semibold text-[#0C1F33]">
            This will survive:
          </p>
          <p className="text-base text-[#0C1F33] leading-relaxed">
            {survivesItems}
          </p>
        </div>

        {/* Confirmation input */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="confirm-name"
            className="text-base font-semibold text-[#0C1F33]"
          >
            Type the profile&apos;s name to confirm
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
            Delete profile
          </button>
          <Link
            href={dashboardHref}
            className="text-sm font-semibold text-[#157A34] hover:text-[#116B2C] transition-colors"
          >
            No, go back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
