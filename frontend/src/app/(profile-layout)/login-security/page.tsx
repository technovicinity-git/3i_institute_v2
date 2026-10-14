"use client";

import { useId, useRef, useState, type FormEvent, type RefObject } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Circle,
  Eye,
  EyeOff,
  Loader2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useChangeEmailMutation,
  useChangePasswordMutation,
} from "@/hooks/use-security";
import { useUserProfile } from "@/hooks/use-user-profile";
import { parseApiFormError, type FieldErrors } from "@/lib/form-errors";

const MIN_PASSWORD = 10;
const MAX_PASSWORD = 128;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---- Reusable pieces ----

interface FormFieldProps {
  label: string;
  type?: "text" | "email" | "password";
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  hint?: string;
  error?: string;
  autoComplete?: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  children?: React.ReactNode;
}

function FormField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  hint,
  error,
  autoComplete = "off",
  inputRef,
  children,
}: FormFieldProps) {
  const id = useId();
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-base font-semibold text-[#0C1F33]">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          ref={inputRef}
          type={isPassword && revealed ? "text" : type}
          autoComplete={autoComplete}
          autoCapitalize="none"
          spellCheck={false}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={cn(
            "w-full h-12 px-4 text-base sm:text-[15px] text-[#0C1F33] placeholder:text-[#94A3B8] bg-white border rounded-lg outline-none transition-colors",
            isPassword && "pr-12",
            error
              ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/15"
              : "border-[#E3E8EF] focus:border-[#94A3B8] focus:ring-2 focus:ring-[#12304E]/10",
          )}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((r) => !r)}
            className="absolute right-1 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-md text-[#64748B] hover:text-[#0C1F33] hover:bg-gray-50"
            aria-label={revealed ? "Hide password" : "Show password"}
            aria-pressed={revealed}
          >
            {revealed ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="flex items-start gap-1.5 text-[13px] font-medium text-red-600"
        >
          <AlertCircle className="w-4 h-4 mt-px shrink-0" />
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-[13px] text-[#475569]">
            {hint}
          </p>
        )
      )}
      {children}
    </div>
  );
}

function FormAlert({
  tone,
  message,
  onDismiss,
}: {
  tone: "error" | "success";
  message: string;
  onDismiss?: () => void;
}) {
  const Icon = tone === "error" ? AlertCircle : CheckCircle2;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-lg border px-4 py-3 text-sm",
        tone === "error"
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-green-200 bg-green-50 text-[#1B7A37]",
      )}
    >
      <Icon className="w-5 h-5 shrink-0" />
      <p className="flex-1 leading-relaxed">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="-m-1 p-1 rounded opacity-70 hover:opacity-100"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

function Requirement({ met, label }: { met: boolean; label: string }) {
  return (
    <li
      className={cn(
        "flex items-center gap-1.5 text-[13px]",
        met ? "text-[#1B7A37]" : "text-[#64748B]",
      )}
    >
      {met ? (
        <Check className="w-3.5 h-3.5" />
      ) : (
        <Circle className="w-3.5 h-3.5" />
      )}
      {label}
    </li>
  );
}

function SubmitButton({ pending, label }: { pending: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full h-12 inline-flex items-center justify-center gap-2 bg-[#22A146] rounded-lg text-base font-bold text-[#0C1F33] hover:bg-[#1E9040] transition-colors disabled:opacity-60"
    >
      {pending && <Loader2 className="w-4 h-4 animate-spin" />}
      {pending ? "Saving..." : label}
    </button>
  );
}

const cardClass =
  "bg-white border border-[#E3E8EF] rounded-xl shadow-sm p-5 sm:p-8 flex flex-col gap-5";

const toggleButtonClass =
  "px-4 py-2 text-sm font-semibold text-[#0C1F33] border border-[#E3E8EF] rounded-lg hover:bg-gray-50 transition-colors";

// ---- Email Card ----

type EmailField = "newEmail" | "currentPassword";

function EmailCard() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useUserProfile();
  const changeEmailMutation = useChangeEmailMutation({ toasts: false });

  const [isEditing, setIsEditing] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors<EmailField>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const currentEmail = profile?.email ?? "";
  const isEmailVerified = profile?.emailVerified ?? false;

  function reset() {
    setNewEmail("");
    setCurrentPassword("");
    setErrors({});
    setFormError(null);
  }

  function toggleEditing() {
    if (isEditing) reset();
    setSuccess(null);
    setIsEditing(!isEditing);
  }

  function focusFirst(next: FieldErrors<EmailField>) {
    if (next.newEmail) emailRef.current?.focus();
    else if (next.currentPassword) passwordRef.current?.focus();
  }

  function validate(): FieldErrors<EmailField> {
    const next: FieldErrors<EmailField> = {};
    const email = newEmail.trim().toLowerCase();
    if (!email) next.newEmail = "Enter your new email address.";
    else if (!EMAIL_PATTERN.test(email))
      next.newEmail = "Enter a valid email address, like name@example.com.";
    else if (email === currentEmail.toLowerCase())
      next.newEmail = "This is already your email address.";
    if (!currentPassword)
      next.currentPassword = "Enter your current password to confirm.";
    return next;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) {
      focusFirst(next);
      return;
    }

    changeEmailMutation.mutate(
      { newEmail: newEmail.trim().toLowerCase(), currentPassword },
      {
        onSuccess: () => {
          reset();
          setIsEditing(false);
          setSuccess(
            "Email updated. Check your new inbox for a verification link.",
          );
          queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        },
        onError: (error) => {
          const parsed = parseApiFormError<EmailField>(
            error,
            ["newEmail", "currentPassword"],
            {
              "current password": "currentPassword",
              "already in use": "newEmail",
              email: "newEmail",
            },
            "We couldn't update your email. Please try again.",
          );
          setErrors(parsed.fieldErrors);
          setFormError(parsed.formError);
          if (parsed.fieldErrors.currentPassword) setCurrentPassword("");
          focusFirst(parsed.fieldErrors);
        },
      },
    );
  }

  if (isLoading) {
    return (
      <div className={cn(cardClass, "items-center justify-center")}>
        <div className="w-6 h-6 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={cardClass}>
      <h2
        className="text-2xl sm:text-[32px] leading-tight text-[#0C1F33]"
        style={{ fontFamily: "'Marcellus', serif" }}
      >
        Email
      </h2>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-base text-[#0C1F33] break-all">
            {currentEmail}
          </span>
          {isEmailVerified ? (
            <span className="text-[11px] font-semibold text-[#22A146]">
              Verified ✓
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-orange-500">
              Unverified — check your email for verification link
            </span>
          )}
        </div>
        <button type="button" onClick={toggleEditing} className={toggleButtonClass}>
          {isEditing ? "Cancel" : "Change email"}
        </button>
      </div>

      {success && (
        <FormAlert
          tone="success"
          message={success}
          onDismiss={() => setSuccess(null)}
        />
      )}

      {isEditing && (
        <>
          {formError && <FormAlert tone="error" message={formError} />}

          <FormField
            label="New email"
            type="email"
            placeholder="Enter new email address"
            value={newEmail}
            onChange={(v) => {
              setNewEmail(v);
              setErrors((p) => ({ ...p, newEmail: undefined }));
            }}
            error={errors.newEmail}
            autoComplete="email"
            inputRef={emailRef}
          />

          <FormField
            label="Current password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter current password"
            value={currentPassword}
            onChange={(v) => {
              setCurrentPassword(v);
              setErrors((p) => ({ ...p, currentPassword: undefined }));
            }}
            error={errors.currentPassword}
            hint="We ask for your password to confirm it's you."
            inputRef={passwordRef}
          />

          <SubmitButton
            pending={changeEmailMutation.isPending}
            label="Save email"
          />

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

type PasswordField = "currentPassword" | "newPassword" | "confirmPassword";

function PasswordCard() {
  const changePasswordMutation = useChangePasswordMutation({ toasts: false });
  const { data: profile } = useUserProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors<PasswordField>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const currentRef = useRef<HTMLInputElement>(null);
  const newRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);

  const longEnough = newPassword.length >= MIN_PASSWORD;
  const differs = newPassword.length > 0 && newPassword !== currentPassword;
  const matches = confirmPassword.length > 0 && confirmPassword === newPassword;

  function reset() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setErrors({});
    setFormError(null);
  }

  function toggleEditing() {
    if (isEditing) reset();
    setSuccess(null);
    setIsEditing(!isEditing);
  }

  function clearError(field: PasswordField) {
    setErrors((p) => ({ ...p, [field]: undefined }));
  }

  function focusFirst(next: FieldErrors<PasswordField>) {
    if (next.currentPassword) currentRef.current?.focus();
    else if (next.newPassword) newRef.current?.focus();
    else if (next.confirmPassword) confirmRef.current?.focus();
  }

  function validate(): FieldErrors<PasswordField> {
    const next: FieldErrors<PasswordField> = {};
    if (!currentPassword)
      next.currentPassword = "Enter your current password.";
    if (!newPassword) next.newPassword = "Enter a new password.";
    else if (newPassword.length < MIN_PASSWORD)
      next.newPassword = `Use at least ${MIN_PASSWORD} characters (${MIN_PASSWORD - newPassword.length} more).`;
    else if (newPassword.length > MAX_PASSWORD)
      next.newPassword = `Use ${MAX_PASSWORD} characters or fewer.`;
    else if (newPassword === currentPassword)
      next.newPassword = "Choose a password different from your current one.";
    if (!confirmPassword)
      next.confirmPassword = "Re-enter your new password.";
    else if (confirmPassword !== newPassword)
      next.confirmPassword = "Passwords don't match.";
    return next;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) {
      focusFirst(next);
      return;
    }

    changePasswordMutation.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          reset();
          setIsEditing(false);
          setSuccess(
            "Password updated. Use your new password the next time you log in.",
          );
        },
        onError: (error) => {
          const parsed = parseApiFormError<PasswordField>(
            error,
            ["currentPassword", "newPassword"],
            {
              "current password": "currentPassword",
              password: "newPassword",
            },
            "We couldn't update your password. Please try again.",
          );
          setErrors(parsed.fieldErrors);
          setFormError(parsed.formError);
          if (parsed.fieldErrors.currentPassword) setCurrentPassword("");
          focusFirst(parsed.fieldErrors);
        },
      },
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={cardClass}>
      <h2
        className="text-2xl sm:text-[32px] leading-tight text-[#0C1F33]"
        style={{ fontFamily: "'Marcellus', serif" }}
      >
        Password
      </h2>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <span className="text-base text-[#0C1F33]">••••••••••</span>
        <button type="button" onClick={toggleEditing} className={toggleButtonClass}>
          {isEditing ? "Cancel" : "Change password"}
        </button>
      </div>

      {success && (
        <FormAlert
          tone="success"
          message={success}
          onDismiss={() => setSuccess(null)}
        />
      )}

      {isEditing && (
        <>
          {formError && <FormAlert tone="error" message={formError} />}

          {/* Lets password managers associate the new password with the account. */}
          <input
            type="text"
            name="username"
            autoComplete="username"
            value={profile?.email ?? ""}
            readOnly
            hidden
          />

          <FormField
            label="Current password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter current password"
            value={currentPassword}
            onChange={(v) => {
              setCurrentPassword(v);
              clearError("currentPassword");
            }}
            error={errors.currentPassword}
            inputRef={currentRef}
          />

          <FormField
            label="New password"
            type="password"
            autoComplete="new-password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(v) => {
              setNewPassword(v);
              clearError("newPassword");
            }}
            error={errors.newPassword}
            inputRef={newRef}
          >
            <ul className="flex flex-col gap-1" aria-label="Password requirements">
              <Requirement
                met={longEnough}
                label={`At least ${MIN_PASSWORD} characters`}
              />
              <Requirement met={differs} label="Different from your current password" />
            </ul>
          </FormField>

          <FormField
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(v) => {
              setConfirmPassword(v);
              clearError("confirmPassword");
            }}
            error={errors.confirmPassword}
            inputRef={confirmRef}
          >
            {!errors.confirmPassword && confirmPassword.length > 0 && (
              <p
                className={cn(
                  "flex items-center gap-1.5 text-[13px]",
                  matches ? "text-[#1B7A37]" : "text-[#64748B]",
                )}
              >
                {matches ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Circle className="w-3.5 h-3.5" />
                )}
                {matches ? "Passwords match" : "Passwords don't match yet"}
              </p>
            )}
          </FormField>

          <SubmitButton
            pending={changePasswordMutation.isPending}
            label="Save password"
          />
        </>
      )}
    </form>
  );
}

// ---- Page ----

export default function LoginSecurityPage() {
  return (
    <section
      className="w-full min-h-full bg-[#FBF9F4] px-4 sm:px-10 lg:px-[120px] pt-8 sm:pt-14 pb-16 sm:pb-20"
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
