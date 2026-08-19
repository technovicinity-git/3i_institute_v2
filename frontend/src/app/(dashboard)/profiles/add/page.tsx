"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Logo } from "@/components/layout/logo";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const addLearnerSchema = z.object({
  displayName: z.string().min(1, "Name is required").max(100),
  day: z.string().min(1),
  month: z.string().min(1),
  year: z.string().min(4).max(4),
  pin: z
    .string()
    .length(4)
    .regex(/^\d{4}$/, "PIN must be exactly 4 digits"),
  confirmPin: z.string().length(4),
});

type AddLearnerFormData = z.infer<typeof addLearnerSchema>;

const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const YEARS = Array.from({ length: 25 }, (_, i) =>
  String(new Date().getFullYear() - 5 - i),
);

export default function AddLearnerPage() {
  const [initials, setInitials] = useState("L");
  const [pinValues, setPinValues] = useState(["", "", "", ""]);
  const [confirmPinValues, setConfirmPinValues] = useState(["", "", "", ""]);
  const pinRefs = Array.from({ length: 4 }, () =>
    useRef<HTMLInputElement>(null),
  );
  const confirmPinRefs = Array.from({ length: 4 }, () =>
    useRef<HTMLInputElement>(null),
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<AddLearnerFormData>({
    resolver: zodResolver(addLearnerSchema),
  });

  const handlePinChange = (
    index: number,
    value: string,
    refs: React.MutableRefObject<HTMLInputElement | null>[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    fieldName: "pin" | "confirmPin",
  ) => {
    if (!/^\d*$/.test(value)) return;

    setter((prev) => {
      const newValues = [...prev];
      newValues[index] = value;
      setValue(fieldName, newValues.join(""));
      return newValues;
    });

    if (value && index < 3) {
      refs[index + 1].current?.focus();
    }
  };

  const handlePinKeyDown = (
    index: number,
    e: React.KeyboardEvent,
    refs: React.MutableRefObject<HTMLInputElement | null>[],
  ) => {
    if (e.key === "Backspace" && index > 0) {
      const currentValue = refs[index].current?.value;
      if (!currentValue) {
        refs[index - 1].current?.focus();
      }
    }
  };

  const onSubmit = (data: AddLearnerFormData) => {
    if (data.pin !== data.confirmPin) {
      alert("PINs do not match");
      return;
    }
    const dateOfBirth = `${data.year}-${String(MONTHS.indexOf(data.month) + 1).padStart(2, "0")}-${data.day.padStart(2, "0")}`;
    console.log("Create profile:", { ...data, dateOfBirth });
    // TODO: Call API
  };

  return (
    <div className="min-h-screen bg-surface text-primary">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-[60px] max-w-7xl items-center justify-between px-5 md:px-10">
          <Logo size="sm" href="/dashboard" />
          <button className="text-sm font-semibold text-gray-600 hover:text-primary">
            Log out
          </button>
        </div>
      </header>

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
              <button className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow">
                <span className="text-lg">📷</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <div>
              <Label className="mb-2 block text-sm font-semibold">
                Child&apos;s name
              </Label>
              <Input
                placeholder="e.g. Yusuf"
                {...register("displayName")}
                onChange={(e) => {
                  register("displayName").onChange(e);
                  const name = e.target.value.trim();
                  setInitials((name.slice(0, 2) || "L").toUpperCase());
                }}
                className="px-4 py-3"
              />
              {errors.displayName && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.displayName.message}
                </p>
              )}
            </div>

            {/* DOB */}
            <div>
              <Label className="mb-2 block text-sm font-semibold">
                Date of birth
              </Label>
              <div className="grid grid-cols-3 gap-3">
                <select
                  {...register("day")}
                  className="rounded-lg border border-gray-300 px-4 py-3"
                >
                  <option value="">Day</option>
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <select
                  {...register("month")}
                  className="rounded-lg border border-gray-300 px-4 py-3"
                >
                  <option value="">Month</option>
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <select
                  {...register("year")}
                  className="rounded-lg border border-gray-300 px-4 py-3"
                >
                  <option value="">Year</option>
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* PIN */}
            <div className="rounded-xl bg-surface p-5">
              <h3 className="mb-1 font-bold">Set a PIN</h3>
              <p className="mb-5 text-xs text-gray-500">
                You&apos;ll use this PIN to switch to this profile. Choose one
                only you know.
              </p>
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block text-xs text-gray-500">
                    4-Digit PIN
                  </Label>
                  <div className="flex gap-2">
                    {pinValues.map((value, i) => (
                      <input
                        key={i}
                        ref={pinRefs[i]}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={value}
                        onChange={(e) =>
                          handlePinChange(
                            i,
                            e.target.value,
                            pinRefs,
                            setPinValues,
                            "pin",
                          )
                        }
                        onKeyDown={(e) => handlePinKeyDown(i, e, pinRefs)}
                        className="w-12 h-14 border border-gray-200 rounded-lg text-center font-bold text-lg bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block text-xs text-gray-500">
                    Confirm PIN
                  </Label>
                  <div className="flex gap-2">
                    {confirmPinValues.map((value, i) => (
                      <input
                        key={i}
                        ref={confirmPinRefs[i]}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={value}
                        onChange={(e) =>
                          handlePinChange(
                            i,
                            e.target.value,
                            confirmPinRefs,
                            setConfirmPinValues,
                            "confirmPin",
                          )
                        }
                        onKeyDown={(e) =>
                          handlePinKeyDown(i, e, confirmPinRefs)
                        }
                        className="w-12 h-14 border border-gray-200 rounded-lg text-center font-bold text-lg bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => (window.location.href = "/profiles")}
                className="w-1/3 py-4"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-2/3 bg-green hover:bg-green-dark py-4 text-white font-bold"
              >
                Add learner
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
