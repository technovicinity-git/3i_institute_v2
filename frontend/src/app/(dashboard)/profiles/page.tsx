"use client";

import { useState, useRef } from "react";
import { Logo } from "@/components/layout/logo";
import { Eyebrow } from "@/components/ui/eyebrow";
import { useLogoutMutation } from "@/hooks/use-auth-mutations";

// Temporary mock data — will be fetched from API later
const MOCK_LEARNERS = [
  { id: "1", name: "Yusuf", initials: "YS", age: "Ages 9-12", pin: "1234" },
  { id: "2", name: "Amina", initials: "AM", age: "Ages 6-8", pin: "1234" },
  { id: "3", name: "Ibrahim", initials: "IB", age: "Ages 13-15", pin: "1234" },
];

export default function ProfilesPage() {
  const logoutMutation = useLogoutMutation();
  const [selectedProfile, setSelectedProfile] = useState<
    (typeof MOCK_LEARNERS)[0] | null
  >(null);
  const [showPinScreen, setShowPinScreen] = useState(false);

  return (
    <div className="min-h-screen bg-surface text-primary">
      {/* Header */}
      <header className="border-b border-gray-200 bg-surface">
        <div className="mx-auto flex h-[60px] max-w-7xl items-center justify-between px-5 md:px-10">
          <Logo size="sm" href="/dashboard" />
          <button
            onClick={() => logoutMutation.mutate()}
            className="text-sm font-semibold text-gray-600 hover:text-primary"
          >
            Log out
          </button>
        </div>
      </header>

      {/* Main */}
      <main>
        {!showPinScreen ? (
          <section className="mx-auto flex min-h-[calc(100vh-60px)] max-w-5xl flex-col items-center justify-center px-5 py-10">
            <div className="mb-10 text-center">
              <Eyebrow className="mb-3">
                International Islamic Institute
              </Eyebrow>
              <h1 className="font-serif text-[30px] md:text-[34px]">
                Who&apos;s learning today?
              </h1>
            </div>

            <div className="grid w-full max-w-3xl grid-cols-2 gap-4 md:grid-cols-4">
              {MOCK_LEARNERS.map((learner) => (
                <button
                  key={learner.id}
                  onClick={() => {
                    setSelectedProfile(learner);
                    setShowPinScreen(true);
                  }}
                  className="group flex min-h-[190px] flex-col items-center justify-center rounded-xl border border-gray-300 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md active:scale-95"
                >
                  <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-avatar-bg text-avatar-text transition group-hover:bg-[#c8e6c9]">
                    <span className="font-serif text-2xl">
                      {learner.initials}
                    </span>
                  </div>
                  <span className="font-semibold">{learner.name}</span>
                  <span className="mt-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                    {learner.age}
                  </span>
                </button>
              ))}

              <button
                onClick={() => (window.location.href = "/profiles/add")}
                className="group flex min-h-[190px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-transparent p-5 transition hover:border-primary hover:bg-white active:scale-95"
              >
                <span className="mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-gray-300 bg-white">
                  <span className="text-3xl">+</span>
                </span>
                <span className="font-semibold">Add learner</span>
              </button>
            </div>
          </section>
        ) : (
          <PinEntryScreen
            profile={selectedProfile!}
            onCancel={() => setShowPinScreen(false)}
            onSuccess={() => {
              setShowPinScreen(false);
              window.location.href = "/dashboard";
            }}
          />
        )}
      </main>
    </div>
  );
}

// PIN Entry Screen
function PinEntryScreen({
  profile,
  onCancel,
  onSuccess,
}: {
  profile: { name: string; initials: string; pin: string };
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const [pinValues, setPinValues] = useState(["", "", "", ""]);
  const [error, setError] = useState(false);
  const inputRefs = Array.from({ length: 4 }, () =>
    useRef<HTMLInputElement>(null),
  );

  const handlePinChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newValues = [...pinValues];
    newValues[index] = value;
    setPinValues(newValues);
    setError(false);

    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    if (index === 3 && value) {
      const enteredPin = newValues.join("");
      if (enteredPin === profile.pin) {
        onSuccess();
      } else {
        setError(true);
        setTimeout(() => {
          setPinValues(["", "", "", ""]);
          inputRefs[0].current?.focus();
        }, 500);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pinValues[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-60px)] items-center justify-center overflow-hidden p-5">
      <div className="absolute inset-0 bg-[#9fa6ac]" />
      <div className="relative z-10 w-full max-w-[340px] rounded-3xl bg-white p-6 text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-avatar-bg">
          <span className="font-serif text-2xl text-avatar-text">
            {profile.initials}
          </span>
        </div>
        <h1 className="font-serif mb-6 text-3xl">{profile.name}</h1>
        <p className="mb-4 font-semibold">Enter your PIN</p>

        <div className="mb-6 flex justify-center gap-3">
          {pinValues.map((value, index) => (
            <input
              key={index}
              ref={inputRefs[index]}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={value}
              onChange={(e) => handlePinChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`h-14 w-14 rounded-xl border text-center text-2xl font-bold bg-white focus:outline-none ${
                index === pinValues.findIndex((v) => v === "") && !error
                  ? "border-blue-600 ring-2 ring-blue-100"
                  : error
                    ? "border-red-500"
                    : "border-gray-300"
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="mb-4 text-sm text-red-600">
            That PIN doesn&apos;t match. Try again.
          </p>
        )}

        <p className="mb-6 px-2 text-sm text-muted">
          Forgot? Ask a parent to reset it from the dashboard
        </p>

        <button
          onClick={onCancel}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 font-semibold hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
