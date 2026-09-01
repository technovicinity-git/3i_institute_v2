"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Mail } from "lucide-react";
import { useResendVerificationMutation } from "@/hooks/use-email-verification";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "sarah@example.com";

  const resendMutation = useResendVerificationMutation();
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResend = () => {
    if (!canResend) return;

    resendMutation.mutate(email, {
      onSuccess: () => {
        setCountdown(60);
        setCanResend(false);
      },
      onError: () => {
        setCountdown(60);
        setCanResend(false);
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#FBF9F4] flex items-center justify-center px-4">
      <div className="w-full max-w-[480px] bg-white rounded-lg px-9 py-9 flex flex-col items-center">
        {/* Envelope Icon */}
        <div className="w-20 h-20 rounded-full bg-[#12304E] flex items-center justify-center mt-1">
          <Mail className="w-12 h-12 text-white" strokeWidth={2} />
        </div>

        {/* Text */}
        <div className="mt-7 text-center w-full max-w-[408px]">
          <h2
            className="text-[40px] leading-[48px] text-[#0C1F33]"
            style={{ fontFamily: "'Marcellus', serif" }}
          >
            Check your email
          </h2>
          <p className="mt-3 text-base text-[#475569] leading-6">
            We&apos;ve sent a verification link to{" "}
            <span className="font-semibold text-[#0C1F33]">{email}</span>. Click
            the link to continue.
          </p>
        </div>

        {/* Resend */}
        <div className="mt-7 w-full max-w-[408px]">
          <button
            onClick={handleResend}
            disabled={!canResend || resendMutation.isPending}
            className={`w-full h-12 rounded-lg border text-[15px] font-semibold transition-colors ${
              canResend
                ? "border-[#E3E8EF] bg-white text-[#0C1F33] hover:bg-gray-50 cursor-pointer"
                : "border-[#E3E8EF] bg-white text-[#0C1F33] opacity-50 cursor-not-allowed"
            }`}
          >
            {resendMutation.isPending ? "Sending..." : "Resend email"}
          </button>
          <p className="mt-3 text-[13px] text-[#475569] text-center">
            {canResend
              ? "You can resend the verification email now"
              : `You can resend in ${countdown} seconds`}
          </p>
        </div>

        {/* Wrong email */}
        <a
          href="/instructor/register"
          className="mt-7 text-sm font-semibold text-[#157A34] underline hover:text-[#0F5C27]"
        >
          Wrong email? Go back
        </a>
      </div>
    </div>
  );
}

export default function InstructorVerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
