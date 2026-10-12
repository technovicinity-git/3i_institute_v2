"use client";

import { useState, type ReactNode } from "react";
import { XCircle } from "lucide-react";
import { ConfirmDialog, type ConfirmTone } from "@/components/ui/confirm-dialog";

/**
 * Confirm dialog that requires a written reason, e.g. when rejecting an
 * application. Same look as `useConfirm()`; the confirm button stays disabled
 * until a reason is entered.
 */
export function ReasonDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Reject",
  tone = "danger",
  label = "Reason",
  placeholder = "Explain why…",
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  tone?: ConfirmTone;
  label?: string;
  placeholder?: string;
  /** Runs with the trimmed reason; the dialog closes when it resolves. */
  onConfirm: (reason: string) => unknown | Promise<unknown>;
}) {
  const [reason, setReason] = useState("");

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setReason("");
        onOpenChange(next);
      }}
      title={title}
      description={description}
      confirmLabel={confirmLabel}
      tone={tone}
      icon={XCircle}
      confirmDisabled={!reason.trim()}
      onConfirm={() => onConfirm(reason.trim())}
    >
      <label className="mt-4 block text-left">
        <span className="text-xs font-semibold text-[#64748B]">{label}</span>
        <textarea
          autoFocus
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder={placeholder}
          className="mt-1 w-full rounded-lg border border-[#E3E8EF] px-3 py-2 text-sm text-[#0C1F33] outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
        />
      </label>
    </ConfirmDialog>
  );
}
