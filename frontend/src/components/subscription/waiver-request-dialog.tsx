"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useApplyWaiverMutation } from "@/hooks/use-subscription";
import {
  subscriptionService,
  type ProfileSubscriptionStatus,
} from "@/services/subscription.service";

const MAX_IMAGES = 3;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MIN_EXPLANATION = 20;

/** Form where the account holder asks for a fee waiver for one profile. */
export function WaiverRequestDialog({
  profile,
  onOpenChange,
}: {
  profile: ProfileSubscriptionStatus | null;
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
          <WaiverForm
            key={profile.id}
            profile={profile}
            onDone={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function WaiverForm({
  profile,
  onDone,
}: {
  profile: ProfileSubscriptionStatus;
  onDone: () => void;
}) {
  const applyMutation = useApplyWaiverMutation();
  const fileInput = useRef<HTMLInputElement>(null);
  const [explanation, setExplanation] = useState("");
  const [images, setImages] = useState<string[]>([]);
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
      setImages((current) => [...current, result.url]);
    } catch {
      toast.error("Failed to upload the image");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const trimmed = explanation.trim();
  const canSubmit =
    trimmed.length >= MIN_EXPLANATION && !uploading && !applyMutation.isPending;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    applyMutation.mutate(
      {
        learnerProfileId: profile.id,
        explanation: trimmed,
        evidenceFiles: images,
      },
      {
        onSuccess: () => {
          toast.success(
            "Waiver request sent. We'll email you once it's reviewed.",
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
          Request a fee waiver for {profile.displayName}
        </DialogTitle>
        <DialogDescription className="text-sm text-[#475569]">
          If paying the full fee is difficult, tell us about your situation. If
          approved, you&apos;ll get a discount of 25–100% on{" "}
          {profile.displayName}&apos;s next one-month subscription, to use
          within 30 days.
        </DialogDescription>
      </div>

      <div>
        <label
          htmlFor="waiver-explanation"
          className="block text-[13px] font-semibold text-[#0C1F33] mb-1.5"
        >
          Your situation
        </label>
        <textarea
          id="waiver-explanation"
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          rows={5}
          maxLength={3000}
          placeholder="e.g. family income, number of children studying, recent changes in circumstances…"
          className="w-full px-4 py-2.5 border border-[#E3E8EF] rounded-lg text-sm text-[#0C1F33] bg-white outline-none focus:border-[#2D6CDF] resize-none"
          required
        />
        <p
          className={`text-xs mt-1 ${
            trimmed.length > 0 && trimmed.length < MIN_EXPLANATION
              ? "text-orange-600"
              : "text-[#64748B]"
          }`}
        >
          At least {MIN_EXPLANATION} characters · {trimmed.length}/3000
        </p>
      </div>

      <div>
        <p className="block text-[13px] font-semibold text-[#0C1F33] mb-1.5">
          Supporting documents{" "}
          <span className="font-normal text-[#64748B]">
            (optional, up to {MAX_IMAGES} images)
          </span>
        </p>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => void handleImage(e.target.files?.[0])}
        />
        <div className="flex gap-3 flex-wrap">
          {images.map((url, index) => (
            <div key={url} className="relative">
              <Image
                src={url}
                alt={`Supporting document ${index + 1}`}
                width={96}
                height={96}
                className="h-24 w-24 rounded-lg border border-[#E3E8EF] object-cover"
              />
              <button
                type="button"
                onClick={() =>
                  setImages((current) => current.filter((u) => u !== url))
                }
                aria-label="Remove image"
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border border-[#E3E8EF] flex items-center justify-center shadow-sm hover:bg-gray-50"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {images.length < MAX_IMAGES && (
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              disabled={uploading}
              className="h-24 w-24 flex flex-col items-center justify-center gap-1 border border-dashed border-[#CBD5E1] rounded-lg text-xs text-[#475569] hover:bg-gray-50 disabled:opacity-60"
            >
              {uploading ? (
                <div className="w-4 h-4 rounded-full border-2 border-[#12304E] border-t-transparent animate-spin" />
              ) : (
                <ImagePlus className="w-5 h-5" />
              )}
              {uploading ? "Uploading" : "Add image"}
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-[#64748B]">
        You can request {profile.waiver.applicationsLeft} more{" "}
        {profile.waiver.applicationsLeft === 1 ? "time" : "times"} for{" "}
        {profile.displayName} in the next 12 months.
      </p>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
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
          {applyMutation.isPending ? "Sending..." : "Send request"}
        </button>
      </div>
    </form>
  );
}
