"use client";

import { Bell, Mail } from "lucide-react";
import type { SessionNotice } from "@/lib/session-notice";

interface SessionNoticeDialogProps {
  notice: SessionNotice;
  pending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Confirms a session change and says who will be notified, and how. */
export function SessionNoticeDialog({
  notice,
  pending,
  onConfirm,
  onCancel,
}: SessionNoticeDialogProps) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="session-notice-title"
      aria-describedby="session-notice-message"
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={pending ? undefined : onCancel}
      />

      <div className="relative bg-white rounded-xl p-6 w-full max-w-[420px] z-10">
        <h3
          id="session-notice-title"
          className="text-lg font-semibold text-[#0C1F33]"
        >
          {notice.title}
        </h3>
        <p
          id="session-notice-message"
          className="mt-2 text-sm leading-6 text-[#475569]"
        >
          {notice.message}
        </p>

        {notice.notify && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F1F5F9] px-3 py-1 text-xs font-semibold text-[#0C1F33]">
              <Bell className="w-3.5 h-3.5" /> In-app notification
            </span>
            {notice.email && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F1F5F9] px-3 py-1 text-xs font-semibold text-[#0C1F33]">
                <Mail className="w-3.5 h-3.5" /> Email
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="px-5 py-2.5 border border-[#E3E8EF] rounded-lg text-sm font-semibold text-[#0C1F33] disabled:opacity-50"
          >
            Go back
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            autoFocus
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50 ${
              notice.destructive
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[#22A146] hover:bg-[#1E9040]"
            }`}
          >
            {pending ? "Please wait..." : notice.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
