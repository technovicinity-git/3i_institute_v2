/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Logo } from "@/components/layout/logo";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateLearnerProfileMutation } from "@/hooks/use-learner-profiles";
import {
  DAYS,
  MONTHS,
  YEARS,
  formatDateToISO,
  calculateAge,
} from "@/lib/date-utils";

const addLearnerSchema = z
  .object({
    displayName: z.string().min(1, "Name is required").max(100),
    day: z.string().min(1, "Day is required"),
    month: z.string().min(1, "Month is required"),
    year: z.string().min(4, "Year is required"),
    pin: z
      .string()
      .length(4, "PIN must be exactly 4 digits")
      .regex(/^\d{4}$/, "PIN must be exactly 4 digits"),
    confirmPin: z.string().length(4, "PIN must be exactly 4 digits"),
  })
  .refine((data) => data.pin === data.confirmPin, {
    message: "PINs do not match",
    path: ["confirmPin"],
  });

type AddLearnerFormData = z.infer<typeof addLearnerSchema>;

export default function AddLearnerPage() {
  const router = useRouter();
  const createMutation = useCreateLearnerProfileMutation();

  const [initials, setInitials] = useState("L");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<AddLearnerFormData>({
    resolver: zodResolver(addLearnerSchema),
  });

  const onSubmit = (data: AddLearnerFormData) => {
    const dateOfBirth = formatDateToISO(data.day, data.month, data.year);
    const age = calculateAge(dateOfBirth);

    // Determine chat enabled based on age
    const chatEnabled = age >= 13;

    createMutation.mutate(
      {
        displayName: data.displayName,
        dateOfBirth,
        pin: data.pin,
        chatEnabled,
      },
      {
        onSuccess: () => {
          router.push("/profiles");
        },
        onError: (error: any) => {
          const message = error.response?.data?.error?.message;
          const details = error.response?.data?.error?.details;

          if (details?.fieldErrors) {
            const fieldErrors = details.fieldErrors as Record<string, string[]>;
            const firstError = Object.values(fieldErrors)[0]?.[0];
            toast.error(firstError ?? message ?? "Failed to create profile");
          } else {
            toast.error(message ?? "Failed to create profile");
          }
        },
      },
    );
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value.trim();
    setInitials((name.slice(0, 2) || "L").toUpperCase());
  };

  return (
    <div className="min-h-screen bg-surface text-primary">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-[60px] max-w-7xl items-center justify-between px-5 md:px-10">
          <Logo size="sm" href="/profiles" />
          <button
            onClick={() => router.push("/profiles")}
            className="text-sm font-semibold text-gray-600 hover:text-primary"
          >
            Back
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-[640px] rounded-2xl border border-gray-200 bg-white p-7 shadow-sm md:p-10">
          <Eyebrow className="mb-4">State A: Create</Eyebrow>
          <h1 className="font-serif text-4xl mb-4">Add a learner</h1>
          <p className="mb-8 max-w-md leading-relaxed text-gray-500">
            This won&apos;t cost anything yet — you&apos;ll only pay when
            they&apos;re ready to start a course.
          </p>

          {/* Avatar */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-green bg-white">
                <span className="font-serif text-3xl">{initials}</span>
              </div>
              <button
                type="button"
                aria-label="Add profile picture"
                className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow"
              >
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
                className="mb-2 block text-sm font-semibold"
              >
                Child&apos;s name
              </Label>
              <Input
                id="displayName"
                placeholder="e.g. Yusuf"
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
                Date of birth
              </Label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <select
                    {...register("day")}
                    className="w-full rounded-lg border border-gray-300 px-3 py-3 bg-white"
                    aria-label="Day"
                  >
                    <option value="">Day</option>
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
                    aria-label="Month"
                  >
                    <option value="">Month</option>
                    {MONTHS.map((m) => (
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
                    aria-label="Year"
                  >
                    <option value="">Year</option>
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
              <h3 className="mb-1 font-bold">Set a PIN</h3>
              <p className="mb-5 text-xs text-gray-500">
                You&apos;ll use this PIN to switch to this profile. Choose one
                only you know.
              </p>

              <div className="space-y-4">
                {/* PIN */}
                <div>
                  <Label className="mb-2 block text-xs text-gray-500">
                    4-Digit PIN
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

                {/* Confirm PIN */}
                <div>
                  <Label className="mb-2 block text-xs text-gray-500">
                    Confirm PIN
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
                onClick={() => router.push("/profiles")}
                className="w-1/3 py-4 border-gray-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-2/3 bg-green hover:bg-green-dark py-4 text-white font-bold"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Adding..." : "Add learner"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

// ──────────────────────────────────────
// PinInput Component
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
