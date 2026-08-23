"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/layout/logo";
import { Eyebrow } from "@/components/ui/eyebrow";
import { useLogoutMutation } from "@/hooks/use-auth-mutations";
import Image from "next/image";
import {
  useLearnerProfiles,
  useVerifyPinMutation,
} from "@/hooks/use-learner-profiles";
import { useProfileStore } from "@/stores/profile-store";
import type { LearnerProfile } from "@/services/learner.service";
import { toast } from "sonner";

function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const dob = new Date(dateOfBirth);
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

function getAgeLabel(age: number): string {
  if (age >= 18) return "Adult";
  if (age >= 13) return "Ages 13-17";
  if (age >= 9) return "Ages 9-12";
  if (age >= 6) return "Ages 6-8";
  return "Ages 5 and under";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ProfilesPage() {
  const router = useRouter();
  const logoutMutation = useLogoutMutation();
  const { data: profiles, isLoading, error } = useLearnerProfiles();
  const { setActiveProfile } = useProfileStore();

  const [selectedProfile, setSelectedProfile] = useState<LearnerProfile | null>(
    null,
  );
  const [showPinScreen, setShowPinScreen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleProfileClick = (profile: LearnerProfile) => {
    setSelectedProfile(profile);
    setShowPinScreen(true);
  };

  const handlePinSuccess = (profile: LearnerProfile) => {
    setActiveProfile(profile);
    setShowPinScreen(false);
    // Use router.push with a small delay to ensure state is set
    setTimeout(() => {
      router.push("/dashboard");
    }, 100);
  };
  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center flex-col gap-4">
        <p className="text-red-600 font-medium">Failed to load profiles</p>
        <button
          onClick={() => window.location.reload()}
          className="text-green font-semibold hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-primary">
      {/* Header */}
      <header className="border-b border-gray-200 bg-surface">
        <div className="mx-auto flex h-[60px] max-w-7xl items-center justify-between px-5 md:px-10">
          <Logo size="sm" href="/dashboard" />
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/seats")}
              className="text-sm font-semibold text-green hover:underline"
            >
              Manage seats
            </button>
            <button
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="text-sm font-semibold text-gray-600 hover:text-primary disabled:opacity-50"
            >
              {logoutMutation.isPending ? "Logging out..." : "Log out"}
            </button>
          </div>
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
              {profiles?.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => handleProfileClick(profile)}
                  className="group flex min-h-[190px] flex-col items-center justify-center rounded-xl border border-gray-300 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md active:scale-95"
                >
                  <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-avatar-bg text-avatar-text transition group-hover:bg-[#c8e6c9]">
                    {profile.avatarUrl ? (
                      <Image
                        src={profile.avatarUrl}
                        alt={profile.displayName}
                        width={80}
                        height={80}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <span className="font-serif text-2xl">
                        {getInitials(profile.displayName)}
                      </span>
                    )}
                  </div>
                  <span className="font-semibold">{profile.displayName}</span>
                  <span className="mt-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                    {getAgeLabel(calculateAge(profile.dateOfBirth))}
                  </span>
                  {!profile.isActive && (
                    <span className="mt-1 text-[10px] text-orange-500 font-medium">
                      No seat
                    </span>
                  )}
                </button>
              ))}

              {/* Add learner button */}
              <button
                onClick={() => router.push("/profiles/add")}
                className="group flex min-h-[190px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-transparent p-5 transition hover:border-primary hover:bg-white active:scale-95"
              >
                <span className="mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-gray-300 bg-white">
                  <span className="text-3xl text-gray-400">+</span>
                </span>
                <span className="font-semibold">Add learner</span>
              </button>
            </div>
          </section>
        ) : (
          selectedProfile && (
            <PinEntryScreen
              profile={selectedProfile}
              onCancel={() => setShowPinScreen(false)}
              onSuccess={() => handlePinSuccess(selectedProfile)}
            />
          )
        )}
      </main>
    </div>
  );
}

// ──────────────────────────────────────
// PIN Entry Screen
// ──────────────────────────────────────
function PinEntryScreen({
  profile,
  onCancel,
  onSuccess,
}: {
  profile: LearnerProfile;
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const router = useRouter();
  const verifyPinMutation = useVerifyPinMutation();
  const { setActiveProfile } = useProfileStore();

  const [pinValues, setPinValues] = useState(["", "", "", ""]);
  const [error, setError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = Array.from({ length: 4 }, () =>
    useRef<HTMLInputElement>(null),
  );

  const handlePinChange = useCallback(
    (index: number, value: string) => {
      if (!/^\d*$/.test(value)) return;

      const newValues = [...pinValues];
      newValues[index] = value;
      setPinValues(newValues);
      setError(false);

      if (value && index < 3) {
        inputRefs[index + 1]?.current?.focus();
      }

      if (index === 3 && value) {
        const enteredPin = newValues.join("");
        setIsVerifying(true);

        verifyPinMutation.mutate(
          { profileId: profile.id, pin: enteredPin },
          {
            onSuccess: () => {
              setActiveProfile(profile);
              setIsVerifying(false);
              toast.success(`Welcome, ${profile.displayName}!`);
              router.push("/dashboard");
            },
            onError: () => {
              setIsVerifying(false);
              setError(true);
              setTimeout(() => {
                setPinValues(["", "", "", ""]);
                inputRefs[0]?.current?.focus();
              }, 500);
            },
          },
        );
      }
    },
    [
      pinValues,
      profile,
      verifyPinMutation,
      setActiveProfile,
      router,
      inputRefs,
    ],
  );

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pinValues[index] && index > 0) {
      inputRefs[index - 1]?.current?.focus();
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-60px)] items-center justify-center overflow-hidden p-5">
      {/* Gray overlay */}
      <div className="absolute inset-0 bg-[#9fa6ac]" />

      <div className="relative z-10 w-full max-w-[340px] rounded-3xl bg-white p-6 text-center shadow-xl">
        {/* Avatar */}
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-avatar-bg">
          <span className="font-serif text-2xl text-avatar-text">
            {getInitials(profile.displayName)}
          </span>
        </div>

        {/* Name */}
        <h1 className="font-serif mb-6 text-3xl text-primary">
          {profile.displayName}
        </h1>

        <p className="mb-4 font-semibold text-primary">Enter your PIN</p>

        {/* PIN Boxes */}
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
              autoFocus={index === 0}
              className={`h-14 w-14 rounded-xl border text-center text-2xl font-bold bg-white focus:outline-none ${
                error
                  ? "border-red-500"
                  : value
                    ? "border-gray-300"
                    : "border-blue-600 ring-2 ring-blue-100"
              }`}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="mb-4 text-sm text-red-600">
            That PIN doesn&apos;t match. Try again.
          </p>
        )}

        {/* Help text */}
        <p className="mb-6 px-2 text-sm text-muted">
          Forgot? Ask a parent to reset it from the dashboard
        </p>

        {/* Cancel */}
        <button
          onClick={onCancel}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 font-semibold text-primary hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
