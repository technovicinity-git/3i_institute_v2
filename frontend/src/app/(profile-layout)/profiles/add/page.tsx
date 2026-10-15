/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateLearnerProfileMutation } from "@/hooks/use-learner-profiles";
import { useLearnerAvatarUploadMutation } from "@/hooks/use-avatar-upload";
import {
  DAYS,
  monthOptions,
  YEARS,
  formatDateToISO,
  calculateAge,
} from "@/lib/date-utils";
import { useLocale, useTranslations } from "next-intl";

type ValidationT = ReturnType<typeof useTranslations<"learnerForm.validation">>;

// Built per render so validation messages use the current language
const createSchema = (t: ValidationT) =>
  z
    .object({
      displayName: z.string().min(1, t("nameRequired")).max(100),
      day: z.string().min(1, t("dayRequired")),
      month: z.string().min(1, t("monthRequired")),
      year: z.string().min(4, t("yearRequired")),
      pin: z
        .string()
        .length(4, t("pinFormat"))
        .regex(/^\d{4}$/, t("pinFormat")),
      confirmPin: z.string().length(4, t("pinFormat")),
    })
    .refine((data) => data.pin === data.confirmPin, {
      message: t("pinMismatch"),
      path: ["confirmPin"],
    });

type AddLearnerFormData = z.infer<ReturnType<typeof createSchema>>;

export default function AddLearnerPage() {
  const t = useTranslations("learnerForm");
  const tCommon = useTranslations("common");
  const tToast = useTranslations("learnerForm.toasts");
  const tSocial = useTranslations("auth.social");
  const tValidation = useTranslations("learnerForm.validation");
  const locale = useLocale();
  const router = useRouter();
  const createMutation = useCreateLearnerProfileMutation();
  const avatarUploadMutation = useLearnerAvatarUploadMutation();

  const [initials, setInitials] = useState("L");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AddLearnerFormData>({
    resolver: zodResolver(createSchema(tValidation)),
  });

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      toast.error(tCommon("invalidImageType"));
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(tCommon("imageTooLarge"));
      return;
    }

    // Save file and show preview
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Reset input
    e.target.value = "";
  };

  const removeAvatar = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const onSubmit = (data: AddLearnerFormData) => {
    const dateOfBirth = formatDateToISO(data.day, data.month, data.year);
    const age = calculateAge(dateOfBirth);
    const chatEnabled = age >= 13;

    createMutation.mutate(
      {
        displayName: data.displayName,
        dateOfBirth,
        pin: data.pin,
        chatEnabled,
      },
      {
        onSuccess: (createdProfile) => {
          // If avatar selected, upload it
          if (selectedFile && createdProfile?.id) {
            avatarUploadMutation.mutate(
              {
                learnerProfileId: createdProfile.id,
                file: selectedFile,
              },
              {
                onSuccess: () => {
                  router.push("/profile-management");
                },
                onError: () => {
                  // Still navigate even if avatar upload fails
                  router.push("/profile-management");
                },
              },
            );
          } else {
            router.push("/profile-management");
          }
        },
        onError: (error: any) => {
          const message = error.response?.data?.error?.message;
          const details = error.response?.data?.error?.details;

          if (details?.fieldErrors) {
            const fieldErrors = details.fieldErrors as Record<string, string[]>;
            const firstError = Object.values(fieldErrors)[0]?.[0];
            toast.error(firstError ?? message ?? tToast("createFailed"));
          } else {
            toast.error(message ?? tToast("createFailed"));
          }
        },
      },
    );
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value.trim();
    setInitials((name.slice(0, 2) || "L").toUpperCase());
  };

  // Cleanup preview on unmount
  useState(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  });

  return (
    <div className="text-primary min-h-full bg-[#FBF9F4]">
      <main className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-[640px] rounded-2xl border border-gray-200 bg-white p-7 shadow-sm md:p-10">
          <Eyebrow className="mb-4">{t("eyebrow")}</Eyebrow>
          <h1 className="font-serif text-4xl mb-4">{t("addTitle")}</h1>
          <p className="mb-8 max-w-md leading-relaxed text-gray-500">
            {t("addSubtitle")}
          </p>

          {/* Avatar */}
          <div className="mb-8 flex flex-col items-center gap-3">
            <div className="relative">
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-green bg-white overflow-hidden">
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt={t("photoPreview")}
                    width={112}
                    height={112}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="font-serif text-3xl">{initials}</span>
                )}
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Upload button */}
              <button
                type="button"
                onClick={handleAvatarClick}
                disabled={avatarUploadMutation.isPending}
                aria-label={t("addPhoto")}
                className="absolute bottom-0 end-0 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {avatarUploadMutation.isPending ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"
                    />
                    <circle cx="12" cy="13" r="3" />
                  </svg>
                )}
              </button>
            </div>

            {/* Remove avatar option */}
            {previewUrl && (
              <button
                type="button"
                onClick={removeAvatar}
                className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
              >
                {t("removePhoto")}
              </button>
            )}
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
                className="mb-2 block text-sm font-semibold"
              >
                {t("name")}
              </Label>
              <Input
                id="displayName"
                placeholder={t("namePlaceholder")}
                {...register("displayName")}
                onChange={(e) => {
                  register("displayName").onChange(e);
                  handleNameChange(e);
                }}
                className="px-4 py-3"
                aria-invalid={!!errors.displayName}
              />
              {errors.displayName && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.displayName.message}
                </p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <Label className="mb-2 block text-sm font-semibold">
                {t("dateOfBirth")}
              </Label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <select
                    {...register("day")}
                    className="w-full rounded-lg border border-gray-300 px-3 py-3 bg-white"
                    aria-label={tSocial("day")}
                  >
                    <option value="">{tSocial("day")}</option>
                    {DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  {errors.day && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.day.message}
                    </p>
                  )}
                </div>

                <div>
                  <select
                    {...register("month")}
                    className="w-full rounded-lg border border-gray-300 px-3 py-3 bg-white"
                    aria-label={tSocial("month")}
                  >
                    <option value="">{tSocial("month")}</option>
                    {monthOptions(locale).map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                  {errors.month && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.month.message}
                    </p>
                  )}
                </div>

                <div>
                  <select
                    {...register("year")}
                    className="w-full rounded-lg border border-gray-300 px-3 py-3 bg-white"
                    aria-label={tSocial("year")}
                  >
                    <option value="">{tSocial("year")}</option>
                    {YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                  {errors.year && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.year.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* PIN Section */}
            <div className="rounded-xl bg-surface p-5">
              <h3 className="mb-1 font-bold">{t("setPinTitle")}</h3>
              <p className="mb-5 text-xs text-gray-500">{t("setPinHint")}</p>

              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block text-xs text-gray-500">
                    {t("pin")}
                  </Label>
                  <Controller
                    name="pin"
                    control={control}
                    render={({ field }) => (
                      <PinInput
                        value={field.value}
                        onChange={field.onChange}
                        error={!!errors.pin}
                      />
                    )}
                  />
                  {errors.pin && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.pin.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="mb-2 block text-xs text-gray-500">
                    {t("confirmPin")}
                  </Label>
                  <Controller
                    name="confirmPin"
                    control={control}
                    render={({ field }) => (
                      <PinInput
                        value={field.value}
                        onChange={field.onChange}
                        error={!!errors.confirmPin}
                      />
                    )}
                  />
                  {errors.confirmPin && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.confirmPin.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/profile-management")}
                className="w-1/3 py-4 border-gray-300"
              >
                {tCommon("cancel")}
              </Button>
              <Button
                type="submit"
                className="w-2/3 bg-green hover:bg-green-dark py-4 text-white font-bold"
                disabled={
                  createMutation.isPending || avatarUploadMutation.isPending
                }
              >
                {createMutation.isPending
                  ? t("adding")
                  : avatarUploadMutation.isPending
                    ? t("uploadingAvatar")
                    : t("submitAdd")}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

// ──────────────────────────────────────
// PinInput Component (unchanged)
// ──────────────────────────────────────

interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}

function PinInput({ value, onChange, error }: PinInputProps) {
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
    <div className="flex gap-2" dir="ltr">
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
