"use client";

import { useRouter } from "next/navigation";
import { MailWarning } from "lucide-react";
import { useResendVerificationMutation } from "@/hooks/use-email-verification";

interface UnverifiedEmailNoticeProps {
  email: string;
  /** "Check your email" page for this portal; `?email=` is added. */
  checkEmailPath: string;
}

/**
 * Shown when login fails with EMAIL_NOT_VERIFIED: lets the user get a new
 * verification link (e.g. after the first one expired) without leaving.
 */
export function UnverifiedEmailNotice({
  email,
  checkEmailPath,
}: UnverifiedEmailNoticeProps) {
  const router = useRouter();
  const resendMutation = useResendVerificationMutation();

  const handleResend = () => {
    resendMutation.mutate(email, {
      onSuccess: () =>
        router.push(`${checkEmailPath}?email=${encodeURIComponent(email)}`),
    });
  };

  return (
    <div
      role="alert"
      className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
    >
      <div className="flex items-start gap-2">
        <MailWarning className="w-4 h-4 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold">Please verify your email first</p>
          <p className="mt-1">
            We sent a verification link to{" "}
            <span className="font-semibold">{email}</span>. If it has expired
            or you can&apos;t find it, we can send a new one.
          </p>
          <button
            type="button"
            onClick={handleResend}
            disabled={resendMutation.isPending}
            className="mt-2 font-semibold text-green hover:text-green-dark underline disabled:opacity-50 cursor-pointer"
          >
            {resendMutation.isPending
              ? "Sending..."
              : "Resend verification email"}
          </button>
        </div>
      </div>
    </div>
  );
}
