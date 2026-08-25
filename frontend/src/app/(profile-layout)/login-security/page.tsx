"use client";

import { useState, FormEvent } from "react";

// ---- Reusable Input Field ----

interface FormFieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  hint?: string;
}

function FormField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  hint,
}: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-base font-semibold text-[#0C1F33]">{label}</label>
      <input
        type={type}
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
  const [isEditing, setIsEditing] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const currentEmail = "sarah@example.com";

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    console.log("Save email:", { newEmail, currentPassword });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-[#E3E8EF] rounded-xl shadow-sm p-6 sm:p-8 flex flex-col gap-5"
    >
      {/* Section title */}
      <h2
        className="text-2xl sm:text-[32px] leading-tight text-[#0C1F33]"
        style={{ fontFamily: "'Marcellus', serif" }}
      >
        Email
      </h2>

      {/* Current email + change button */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <span className="text-base text-[#0C1F33]">{currentEmail}</span>
        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 text-sm font-semibold text-[#0C1F33] border border-[#E3E8EF] rounded-lg hover:bg-gray-50 transition-colors"
        >
          Change email
        </button>
      </div>

      {/* Editable fields */}
      {isEditing && (
        <>
          <FormField
            label="New email"
            type="email"
            placeholder="Enter new email address"
            value={newEmail}
            onChange={setNewEmail}
          />

          <FormField
            label="Current password"
            type="password"
            placeholder="••••••••••••"
            value={currentPassword}
            onChange={setCurrentPassword}
          />

          <button
            type="submit"
            className="w-full h-12 bg-[#22A146] rounded-lg text-base font-bold text-[#0C1F33] hover:bg-[#1E9040] transition-colors"
          >
            Save email
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
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    console.log("Save password:", {
      currentPassword,
      newPassword,
      confirmPassword,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-[#E3E8EF] rounded-xl shadow-sm p-6 sm:p-8 flex flex-col gap-5"
    >
      {/* Section title */}
      <h2
        className="text-2xl sm:text-[32px] leading-tight text-[#0C1F33]"
        style={{ fontFamily: "'Marcellus', serif" }}
      >
        Password
      </h2>

      <FormField
        label="Current password"
        type="password"
        placeholder="••••••••••••"
        value={currentPassword}
        onChange={setCurrentPassword}
      />

      <FormField
        label="New password"
        type="password"
        placeholder="••••••••••••"
        value={newPassword}
        onChange={setNewPassword}
        hint="At least 10 characters"
      />

      <FormField
        label="Confirm new password"
        type="password"
        placeholder="••••••••••••"
        value={confirmPassword}
        onChange={setConfirmPassword}
      />

      <button
        type="submit"
        className="w-full h-12 bg-[#22A146] rounded-lg text-base font-bold text-[#0C1F33] hover:bg-[#1E9040] transition-colors"
      >
        Save password
      </button>
    </form>
  );
}

// ---- Page ----

export default function LoginSecurityPage() {
  return (
    <section
      className="w-full px-6 sm:px-10 lg:px-[120px] pt-10 sm:pt-14 pb-16 sm:pb-20"
      style={{ fontFamily: "'Figtree', sans-serif" }}
    >
      <div className="max-w-[640px] mx-auto flex flex-col gap-6">
        {/* Page title */}
        <h1
          className="text-3xl sm:text-[40px] leading-tight text-[#0C1F33] text-center"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          Login &amp; security
        </h1>

        {/* Email card */}
        <EmailCard />

        {/* Password card */}
        <PasswordCard />
      </div>
    </section>
  );
}
