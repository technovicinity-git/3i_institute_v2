"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { BadgePercent, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateSubscriptionRequestMutation } from "@/hooks/use-subscription";
import {
  subscriptionService,
  discountedPrice,
  formatMoney,
  type PaymentSettings,
  type ProfileSubscriptionStatus,
} from "@/services/subscription.service";

const OTHER_METHOD = "Other";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function today(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

const inputClass =
  "w-full px-4 py-2.5 border border-[#E3E8EF] rounded-lg text-sm text-[#0C1F33] bg-white outline-none focus:border-[#2D6CDF]";
const labelClass = "block text-[13px] font-semibold text-[#0C1F33] mb-1.5";

/** Form where the account holder submits a manual payment for review. */
export function ApplySubscriptionDialog({
  profile,
  payment,
  onOpenChange,
}: {
  profile: ProfileSubscriptionStatus | null;
  payment: PaymentSettings;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={profile !== null} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto gap-5 bg-white text-[#0C1F33] rounded-xl border border-[#E3E8EF] ring-0 p-6"
        overlayClassName="bg-black/40"
      >
        {profile && (
          // Keyed so the form resets for each profile
          <ApplyForm
            key={profile.id}
            profile={profile}
            payment={payment}
            onDone={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ApplyForm({
  profile,
  payment,
  onDone,
}: {
  profile: ProfileSubscriptionStatus;
  payment: PaymentSettings;
  onDone: () => void;
}) {
  const createMutation = useCreateSubscriptionRequestMutation();
  const fileInput = useRef<HTMLInputElement>(null);

  // An approved waiver is applied automatically by the server
  const waiver = profile.waiver.usable;
  const fullyWaived = (waiver?.percent ?? 0) >= 100;
  const amountDue = discountedPrice(payment.monthlyPrice, waiver?.percent ?? 0);

  const [paymentMethod, setPaymentMethod] = useState(
    payment.accounts[0]?.label ?? OTHER_METHOD,
  );
  const [amount, setAmount] = useState(String(amountDue));
  const [transactionId, setTransactionId] = useState("");
  const [senderAccount, setSenderAccount] = useState("");
  const [paidAt, setPaidAt] = useState(today());
  const [note, setNote] = useState("");
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleImage = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Image must be 5 MB or smaller");
      return;
    }
    setUploading(true);
    try {
      const result = await subscriptionService.uploadPaymentProof(file);
      setProofUrl(result.url);
    } catch {
      toast.error("Failed to upload the image");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const amountNumber = Number(amount);
  const canSubmit =
    (fullyWaived ||
      (!!paymentMethod &&
        amountNumber > 0 &&
        transactionId.trim().length >= 3 &&
        !!paidAt)) &&
    !uploading &&
    !createMutation.isPending;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    createMutation.mutate(
      fullyWaived
        ? { learnerProfileId: profile.id, note: note.trim() || undefined }
        : {
            learnerProfileId: profile.id,
            paymentMethod,
            amount: amountNumber,
            transactionId: transactionId.trim(),
            senderAccount: senderAccount.trim() || undefined,
            // Noon local time so the date doesn't shift across timezones
            paidAt: new Date(`${paidAt}T12:00:00`).toISOString(),
            note: note.trim() || undefined,
            proofImageUrl: proofUrl ?? undefined,
          },
      {
        onSuccess: () => {
          toast.success(
            fullyWaived
              ? `Submitted. We'll subscribe ${profile.displayName} once it's approved.`
              : `Payment submitted. We'll subscribe ${profile.displayName} once it's verified.`,
          );
          onDone();
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5 pr-6">
        <DialogTitle
          className="text-2xl text-[#0C1F33] font-normal"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          {profile.isSubscribed ? "Renew" : "Apply for"} {profile.displayName}
          &apos;s subscription
        </DialogTitle>
        <DialogDescription className="text-sm text-[#475569]">
          {fullyWaived
            ? `${profile.displayName}'s fee waiver covers the whole month, so no payment is needed. An admin will approve it and subscribe ${profile.displayName} for one month.`
            : `Enter the details of your ${formatMoney(amountDue, payment.currency)} payment. An admin will check it and subscribe ${profile.displayName} for one month.`}
        </DialogDescription>
      </div>

      {waiver && (
        <div className="flex items-start gap-3 px-4 py-3 bg-[#22A146]/10 border border-[#22A146]/30 rounded-lg">
          <BadgePercent className="w-5 h-5 text-[#157A34] shrink-0 mt-0.5" />
          <div className="text-sm text-[#0C1F33]">
            <p className="font-semibold">
              {waiver.percent}% fee waiver applied
            </p>
            <p className="text-[#475569]">
              {fullyWaived ? (
                "Nothing to pay this month."
              ) : (
                <>
                  <span className="line-through">
                    {formatMoney(payment.monthlyPrice, payment.currency)}
                  </span>{" "}
                  → {formatMoney(amountDue, payment.currency)}. The waiver is
                  used once this subscription is approved.
                </>
              )}
            </p>
          </div>
        </div>
      )}

      {!fullyWaived && (
        <>
          <div>
            <label className={labelClass} htmlFor="payment-method">
              Paid to
            </label>
            <select
              id="payment-method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className={inputClass}
            >
              {payment.accounts.map((account) => (
                <option key={account.id} value={account.label}>
                  {account.label} · {account.accountNumber}
                </option>
              ))}
              <option value={OTHER_METHOD}>Other</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="amount">
                Amount ({payment.currency})
              </label>
              <input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="paid-at">
                Payment date
              </label>
              <input
                id="paid-at"
                type="date"
                max={today()}
                value={paidAt}
                onChange={(e) => setPaidAt(e.target.value)}
                className={inputClass}
                required
              />
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="transaction-id">
              Transaction ID / reference
            </label>
            <input
              id="transaction-id"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="e.g. 9KD7X2LQ1P"
              maxLength={100}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="sender-account">
              Paid from{" "}
              <span className="font-normal text-[#64748B]">(optional)</span>
            </label>
            <input
              id="sender-account"
              value={senderAccount}
              onChange={(e) => setSenderAccount(e.target.value)}
              placeholder="Your account or mobile number"
              maxLength={100}
              className={inputClass}
            />
          </div>
        </>
      )}

      <div>
        <label className={labelClass} htmlFor="note">
          Note <span className="font-normal text-[#64748B]">(optional)</span>
        </label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          maxLength={1000}
          className={`${inputClass} resize-none`}
        />
      </div>

      {!fullyWaived && (
        <div>
          <p className={labelClass}>
            Payment screenshot / receipt{" "}
            <span className="font-normal text-[#64748B]">(optional)</span>
          </p>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void handleImage(e.target.files?.[0])}
          />
          {proofUrl ? (
            <div className="relative w-fit">
              <Image
                src={proofUrl}
                alt="Payment proof"
                width={160}
                height={160}
                className="h-32 w-auto rounded-lg border border-[#E3E8EF] object-cover"
              />
              <button
                type="button"
                onClick={() => setProofUrl(null)}
                aria-label="Remove image"
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border border-[#E3E8EF] flex items-center justify-center shadow-sm hover:bg-gray-50"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-3 border border-dashed border-[#CBD5E1] rounded-lg text-sm text-[#475569] hover:bg-gray-50 disabled:opacity-60"
            >
              {uploading ? (
                <div className="w-4 h-4 rounded-full border-2 border-[#12304E] border-t-transparent animate-spin" />
              ) : (
                <ImagePlus className="w-4 h-4" />
              )}
              {uploading ? "Uploading..." : "Add image"}
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-1">
        <button
          type="button"
          onClick={onDone}
          className="px-5 py-2.5 border border-[#E3E8EF] rounded-lg text-sm font-semibold text-[#475569] hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className="px-5 py-2.5 bg-[#22A146] rounded-lg text-sm font-bold text-[#0C1F33] hover:bg-[#1E9040] disabled:opacity-50"
        >
          {createMutation.isPending
            ? "Submitting..."
            : fullyWaived
              ? "Submit"
              : "Submit payment"}
        </button>
      </div>
    </form>
  );
}
