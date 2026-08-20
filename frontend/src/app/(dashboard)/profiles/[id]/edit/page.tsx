"use client";

import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Logo } from "@/components/layout/logo";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useLearnerProfile,
  useUpdateLearnerProfileMutation,
} from "@/hooks/use-profile-edit";
import { useResetPinMutation } from "@/hooks/use-learner-profiles";

const editProfileSchema = z.object({
  displayName: z.string().min(1, "Name is required").max(100),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

const resetPinSchema = z.object({
  newPin: z
    .string()
    .length(4, "PIN must be exactly 4 digits")
    .regex(/^\d{4}$/, "PIN must be exactly 4 digits"),
  confirmNewPin: z.string().length(4, "PIN must be exactly 4 digits"),
});

type ResetPinFormData = z.infer<typeof resetPinSchema>;

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function EditProfilePage() {
  const params = useParams();
  const router = useRouter();
  const profileId = params.id as string;

  const { data: profile, isLoading: profileLoading } =
    useLearnerProfile(profileId);
  const updateMutation = useUpdateLearnerProfileMutation();
  const resetPinMutation = useResetPinMutation();

  const [showResetPin, setShowResetPin] = useState(false);
  const [initials, setInitials] = useState("XX");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    values: {
      displayName: profile?.displayName ?? "",
    },
  });

  const resetPinForm = useForm<ResetPinFormData>({
    resolver: zodResolver(resetPinSchema),
  });

  const onSubmit = (data: EditProfileFormData) => {
    updateMutation.mutate(
      {
        profileId,
        input: {
          displayName: data.displayName,
        },
      },
      {
        onSuccess: () => {
          router.push("/profiles");
        },
      },
    );
  };

  const handleResetPin = (data: ResetPinFormData) => {
    if (data.newPin !== data.confirmNewPin) {
      toast.error("PINs do not match");
      return;
    }

    resetPinMutation.mutate(
      { profileId, pin: data.newPin },
      {
        onSuccess: () => {
          setShowResetPin(false);
          resetPinForm.reset();
        },
      },
    );
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-outline-variant px-6 py-4 flex items-center justify-between">
        <Logo size="md" href="/profiles" />
        <button
          onClick={() => router.push("/profiles")}
          className="text-primary font-medium hover:opacity-80"
        >
          Back
        </button>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="bg-white rounded-2xl shadow-card border border-outline-variant p-8 md:p-12 w-full max-w-md">
          <Eyebrow className="mb-3">State B: Edit</Eyebrow>
          <h1 className="text-4xl font-serif text-primary mb-10">
            Edit {profile?.displayName}&apos;s profile
          </h1>

          {/* Avatar */}
          <div className="flex justify-center mb-10">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-full border-2 border-green flex items-center justify-center bg-surface text-green text-3xl font-serif">
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.displayName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(profile?.displayName ?? "XX")
                )}
              </div>
              <button
                aria-label="Change profile picture"
                className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-sm border border-white"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                  <circle cx="12" cy="13" r="3" />
                </svg>
              </button>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
            noValidate
          >
            {/* Name */}
            <div>
              <Label
                htmlFor="displayName"
                className="block text-sm font-semibold mb-2"
              >
                Child&apos;s name
              </Label>
              <Input
                id="displayName"
                {...register("displayName")}
                className="px-4 py-3"
                aria-invalid={!!errors.displayName}
                readOnly={profile?.nameLocked}
              />
              {profile?.nameLocked && (
                <p className="mt-1 text-xs text-orange-500">
                  Name is locked because a certificate has been issued.
                </p>
              )}
              {errors.displayName && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.displayName.message}
                </p>
              )}
            </div>

            {/* Security PIN */}
            <div>
              <Label className="block text-sm font-semibold mb-2">
                Security PIN
              </Label>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowResetPin(!showResetPin)}
                className="w-full px-4 py-3 border-primary text-primary font-semibold hover:bg-surface"
              >
                {profile?.hasPin ? "Reset PIN" : "Set PIN"}
              </Button>
            </div>

            {/* Reset PIN form */}
            {showResetPin && (
              <div className="rounded-xl bg-surface p-5 space-y-4">
                <h3 className="font-bold text-sm">Set new PIN</h3>

                <div>
                  <Label className="mb-2 block text-xs text-gray-500">
                    New 4-Digit PIN
                  </Label>
                  <Controller
                    name="newPin"
                    control={resetPinForm.control}
                    render={({ field }) => (
                      <PinInput
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        error={!!resetPinForm.formState.errors.newPin}
                      />
                    )}
                  />
                  {resetPinForm.formState.errors.newPin && (
                    <p className="mt-1 text-xs text-red-600">
                      {resetPinForm.formState.errors.newPin.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="mb-2 block text-xs text-gray-500">
                    Confirm New PIN
                  </Label>
                  <Controller
                    name="confirmNewPin"
                    control={resetPinForm.control}
                    render={({ field }) => (
                      <PinInput
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        error={!!resetPinForm.formState.errors.confirmNewPin}
                      />
                    )}
                  />
                  {resetPinForm.formState.errors.confirmNewPin && (
                    <p className="mt-1 text-xs text-red-600">
                      {resetPinForm.formState.errors.confirmNewPin.message}
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowResetPin(false)}
                    className="w-1/3 py-2 border-gray-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={resetPinForm.handleSubmit(handleResetPin)}
                    className="w-2/3 bg-green hover:bg-green-dark py-2 text-white"
                    disabled={resetPinMutation.isPending}
                  >
                    {resetPinMutation.isPending ? "Saving..." : "Save PIN"}
                  </Button>
                </div>
              </div>
            )}

            {/* Submit */}
            <div className="pt-4">
              <Button
                type="submit"
                className="w-full bg-green hover:bg-green-dark text-white py-3 font-semibold shadow-sm"
                disabled={updateMutation.isPending || profile?.nameLocked}
              >
                {updateMutation.isPending ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

// ──────────────────────────────────────
// PinInput Component (same as Add Learner)
// ──────────────────────────────────────

interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}

function PinInput({ value = "", onChange, error }: PinInputProps) {
  const inputRefs = Array.from({ length: 4 }, () =>
    useRef<HTMLInputElement>(null),
  );
  const digits = (value ?? "").split("");

  const handleChange = (index: number, newDigit: string) => {
    if (!/^\d*$/.test(newDigit)) return;

    const newDigits = [...digits];
    newDigits[index] = newDigit;
    onChange(newDigits.join("").slice(0, 4));

    if (newDigit && index < 3) {
      inputRefs[index + 1]?.current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs[index - 1]?.current?.focus();
    }
  };

  return (
    <div className="flex gap-2">
      {[0, 1, 2, 3].map((index) => (
        <input
          key={index}
          ref={inputRefs[index]}
          type="password"
          inputMode="numeric"
          maxLength={1}
          value={digits[index] ?? ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          className={`w-12 h-14 border rounded-lg text-center font-bold text-lg bg-white focus:outline-none focus:ring-2 ${
            error
              ? "border-red-400 focus:border-red-500 focus:ring-red-100"
              : "border-gray-200 focus:border-blue-600 focus:ring-blue-100"
          }`}
        />
      ))}
    </div>
  );
}
