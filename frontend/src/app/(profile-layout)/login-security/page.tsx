"use client";

import { useState, FormEvent } from "react";
import {
  useChangeEmailMutation,
  useChangePasswordMutation,
} from "@/hooks/use-security";
import { toast } from "sonner";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useQueryClient } from "@tanstack/react-query";

// ---- Reusable Input Field ----

interface FormFieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  hint?: string;
  autoComplete?: string;
}

function FormField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  hint,
  autoComplete = "off",
}: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-base font-semibold text-[#0C1F33]">{label}</label>
      <input
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 px-4 text-[15px] text-[#0C1F33] placeholder:text-[#475569] bg-white border border-[#E3E8EF] rounded-lg outline-none focus:border-[#94A3B8] transition-colors"
      />
      {hint && <p className="text-[13px] text-[#475569]">{hint}</p>}
    </div>
  );
}

// ---- Email Card ----

function EmailCard() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useUserProfile();
  const changeEmailMutation = useChangeEmailMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  const currentEmail = profile?.email ?? "";
  const isEmailVerified = profile?.emailVerified ?? false;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!newEmail || !currentPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    changeEmailMutation.mutate(
      { newEmail, currentPassword },
      {
        onSuccess: () => {
          setNewEmail("");
          setCurrentPassword("");
          setIsEditing(false);
          queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        },
      },
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white border border-[#E3E8EF] rounded-xl shadow-sm p-6 sm:p-8 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-[#E3E8EF] rounded-xl shadow-sm p-6 sm:p-8 flex flex-col gap-5"
    >
      <h2
        className="text-2xl sm:text-[32px] leading-tight text-[#0C1F33]"
        style={{ fontFamily: "'Marcellus', serif" }}
      >
        Email
      </h2>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-base text-[#0C1F33]">{currentEmail}</span>
          {!isEmailVerified && (
            <span className="text-[11px] font-semibold text-orange-500">
              Unverified — check your email for verification link
            </span>
          )}
          {isEmailVerified && (
            <span className="text-[11px] font-semibold text-[#22A146]">
              Verified ✓
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 text-sm font-semibold text-[#0C1F33] border border-[#E3E8EF] rounded-lg hover:bg-gray-50 transition-colors"
        >
          {isEditing ? "Cancel" : "Change email"}
        </button>
      </div>

      {isEditing && (
        <>
          <FormField
            label="New email"
            type="email"
            placeholder="Enter new email address"
            value={newEmail}
            onChange={setNewEmail}
            autoComplete="off"
          />

          <FormField
            label="Current password"
            type="password"
            autoComplete="new-password"
            placeholder="Enter current password"
            value={currentPassword}
            onChange={setCurrentPassword}
          />

          <button
            type="submit"
            disabled={changeEmailMutation.isPending}
            className="w-full h-12 bg-[#22A146] rounded-lg text-base font-bold text-[#0C1F33] hover:bg-[#1E9040] transition-colors disabled:opacity-50"
          >
            {changeEmailMutation.isPending ? "Saving..." : "Save email"}
          </button>

          <p className="text-[13px] text-[#475569] leading-relaxed">
            You&apos;ll need to verify your new email before it takes effect.
            Your account stays fully active in the meantime.
          </p>
        </>
      )}
    </form>
  );
}
// ---- Password Card ----

function PasswordCard() {
  const changePasswordMutation = useChangePasswordMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (newPassword.length < 10) {
      toast.error("Password must be at least 10 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    changePasswordMutation.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          setIsEditing(false);
        },
      },
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-[#E3E8EF] rounded-xl shadow-sm p-6 sm:p-8 flex flex-col gap-5"
    >
      <h2
        className="text-2xl sm:text-[32px] leading-tight text-[#0C1F33]"
        style={{ fontFamily: "'Marcellus', serif" }}
      >
        Password
      </h2>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <span className="text-base text-[#0C1F33]">••••••••••</span>
        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 text-sm font-semibold text-[#0C1F33] border border-[#E3E8EF] rounded-lg hover:bg-gray-50 transition-colors"
        >
          {isEditing ? "Cancel" : "Change password"}
        </button>
      </div>

      {isEditing && (
        <>
          <FormField
            label="Current password"
            type="password"
            placeholder="Enter current password"
            value={currentPassword}
            onChange={setCurrentPassword}
          />

          <FormField
            label="New password"
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={setNewPassword}
            hint="At least 10 characters"
          />

          <FormField
            label="Confirm new password"
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={setConfirmPassword}
          />

          <button
            type="submit"
            disabled={changePasswordMutation.isPending}
            className="w-full h-12 bg-[#22A146] rounded-lg text-base font-bold text-[#0C1F33] hover:bg-[#1E9040] transition-colors disabled:opacity-50"
          >
            {changePasswordMutation.isPending ? "Saving..." : "Save password"}
          </button>
        </>
      )}
    </form>
  );
}

// ---- Page ----

export default function LoginSecurityPage() {
  return (
    <section
      className="w-full min-h-full bg-[#FBF9F4] px-6 sm:px-10 lg:px-[120px] pt-10 sm:pt-14 pb-16 sm:pb-20"
      style={{ fontFamily: "'Figtree', sans-serif" }}
    >
      <div className="max-w-[640px] mx-auto flex flex-col gap-6">
        <h1
          className="text-3xl sm:text-[40px] leading-tight text-[#0C1F33] text-center"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          Login &amp; security
        </h1>

        <EmailCard />
        <PasswordCard />
      </div>
    </section>
  );
}
