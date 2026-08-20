"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Logo } from "@/components/layout/logo";
import { useResendVerificationMutation } from "@/hooks/use-email-verification";

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "your email";

  const resendMutation = useResendVerificationMutation();

  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

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
        // Still reset countdown to prevent spam
        setCountdown(60);
        setCanResend(false);
      },
    });
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <header className="w-full px-6 pt-6 sm:px-8 sm:pt-8 lg:px-10 lg:pt-10">
        <Logo size="md" />
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-6 py-10 sm:px-8 sm:py-12 lg:px-8 lg:py-16">
        <section className="w-full max-w-lg bg-white rounded-xl sm:rounded-2xl border border-surface-high shadow-card px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12 flex flex-col items-center text-center">
          {/* Mail Icon */}
          <div
            className="w-20 h-20 rounded-full bg-surface-low flex items-center justify-center mb-7 sm:mb-8"
            aria-hidden="true"
          >
            <svg
              className="w-9 h-9 sm:w-10 sm:h-10 text-gold"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Heading */}
          <h1 className="font-serif text-primary text-[30px] leading-[1.2] sm:text-[34px] lg:text-4xl mb-4">
            Check your email
          </h1>

          {/* Description */}
          <p className="text-muted text-sm sm:text-base leading-6 max-w-md mb-8">
            We&apos;ve sent a verification link to{" "}
            <span className="font-semibold text-primary break-all">
              {email}
            </span>
          </p>

          {/* Resend Button */}
          <button
            onClick={handleResend}
            disabled={!canResend || resendMutation.isPending}
            className="w-full h-12 sm:h-[52px] bg-white border border-outline-variant text-outline font-medium text-sm sm:text-base rounded-xl hover:bg-surface-container hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {resendMutation.isPending ? "Sending..." : "Resend email"}
          </button>

          {/* Countdown */}
          <p className="text-sm text-outline mt-4" aria-live="polite">
            {canResend ? (
              "You can resend now"
            ) : (
              <>
                You can resend in <span>{countdown}</span> seconds
              </>
            )}
          </p>

          {/* Wrong Email */}
          <p className="text-sm text-muted mt-8">
            Wrong email?{" "}
            <a
              href="/register"
              className="text-green font-medium hover:underline underline-offset-4 decoration-2 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-sm"
            >
              Go back
            </a>
          </p>
        </section>
      </main>

      {/* Mobile Home Indicator */}
      <div className="flex justify-center pb-5 sm:hidden">
        <div className="w-32 h-1 rounded-full bg-gray-300" />
      </div>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-surface">
          <p className="text-muted">Loading...</p>
        </div>
      }
    >
      <CheckEmailContent />
    </Suspense>
  );
}
