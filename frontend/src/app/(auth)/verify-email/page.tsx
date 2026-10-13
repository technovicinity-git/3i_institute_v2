"use client";

import { useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Logo } from "@/components/layout/logo";
import { useVerifyEmailMutation } from "@/hooks/use-email-verification";
import { postVerifyRoute } from "@/services/email.service";
import { ExpiredVerificationLink } from "@/components/auth/expired-verification-link";
import { apiErrorCode } from "@/lib/api-error";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const verifyMutation = useVerifyEmailMutation();

  const token = searchParams.get("token");
  // The token is single-use: make sure it is submitted only once, even when
  // React runs effects twice in development.
  const submitted = useRef(false);

  useEffect(() => {
    if (submitted.current) return;
    submitted.current = true;

    if (!token) {
      toast.error("Invalid verification link");
      router.push("/login");
      return;
    }

    verifyMutation.mutate(token, {
      onSuccess: (result) => {
        // Instructor accounts verified from an older learner link still
        // land in the instructor portal.
        setTimeout(() => {
          router.push(postVerifyRoute(result));
        }, 2000);
      },
      onError: (error) => {
        // An expired link offers a new one instead of leaving the page.
        if (apiErrorCode(error) === "VERIFICATION_LINK_EXPIRED") return;
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      },
    });
  }, [token, verifyMutation, router]);

  const linkExpired =
    apiErrorCode(verifyMutation.error) === "VERIFICATION_LINK_EXPIRED";

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="w-full px-6 pt-6 sm:px-8 sm:pt-8 lg:px-10 lg:pt-10">
        <Logo size="md" />
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-10">
        <section className="w-full max-w-lg bg-white rounded-xl sm:rounded-2xl border border-surface-high shadow-card px-6 py-10 sm:px-10 sm:py-12 flex flex-col items-center text-center">
          {verifyMutation.isPending ? (
            <>
              <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mb-6" />
              <h1 className="font-serif text-2xl text-primary mb-2">
                Verifying your email...
              </h1>
              <p className="text-muted text-sm">Please wait a moment</p>
            </>
          ) : verifyMutation.isSuccess ? (
            <>
              <div className="w-20 h-20 rounded-full bg-avatar-bg flex items-center justify-center mb-6">
                <svg
                  className="w-10 h-10 text-green"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="font-serif text-2xl text-primary mb-2">
                Email Verified!
              </h1>
              <p className="text-muted text-sm mb-4">
                Your email has been verified. Redirecting to login...
              </p>
            </>
          ) : linkExpired && token ? (
            <>
              <h1 className="font-serif text-2xl text-primary mb-2">
                This link has expired
              </h1>
              <p className="text-muted text-sm mb-6">
                Verification links are valid for 24 hours. We can send a new
                one to the same email address.
              </p>
              <ExpiredVerificationLink token={token} loginHref="/login" />
            </>
          ) : verifyMutation.isError ? (
            <>
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6">
                <svg
                  className="w-10 h-10 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h1 className="font-serif text-2xl text-primary mb-2">
                Verification Failed
              </h1>
              <p className="text-muted text-sm mb-4">
                This verification link is invalid or has already been used.
                Redirecting to login...
              </p>
            </>
          ) : null}
        </section>
      </main>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-surface">
          <p className="text-muted">Loading...</p>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
