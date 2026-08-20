/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import {
  loadGoogleScript,
  isGoogleInitialized,
  setGoogleInitialized,
} from "@/lib/social-auth";
import { DobModal } from "@/components/social/dob-modal";
import { useGoogleLoginMutation } from "@/hooks/use-google-auth";
import { toast } from "sonner";

export function GoogleButton() {
  const googleLoginMutation = useGoogleLoginMutation();
  const [showDobModal, setShowDobModal] = useState(false);
  const [idToken, setIdToken] = useState<string | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId) {
      console.warn("NEXT_PUBLIC_GOOGLE_CLIENT_ID not set");
      return;
    }

    loadGoogleScript()
      .then(() => {
        if (window.google?.accounts?.id && !isGoogleInitialized()) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });
          setGoogleInitialized(true);
        }
      })
      .catch(() => {
        toast.error("Failed to load Google sign-in");
      });
  }, []);

  const handleCredentialResponse = (response: { credential: string }) => {
    const token = response.credential;
    setIdToken(token);

    googleLoginMutation.mutate(
      { idToken: token },
      {
        onError: (error: any) => {
          const message = error.response?.data?.error?.message;
          if (
            message?.includes("date of birth") ||
            message?.includes("Date of birth") ||
            error.response?.status === 422
          ) {
            setShowDobModal(true);
          }
        },
      },
    );
  };

  const handleDobSubmit = (dateOfBirth: string) => {
    if (!idToken) return;

    googleLoginMutation.mutate(
      { idToken, dateOfBirth },
      {
        onSuccess: () => {
          setShowDobModal(false);
        },
      },
    );
  };

  const handleGoogleClick = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      toast.error("Google sign-in is not available");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleGoogleClick}
        className="w-full flex items-center justify-center gap-3 bg-white border border-primary text-primary py-3 rounded-element font-medium hover:bg-gray-50 transition-colors"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
            fill="currentColor"
          />
        </svg>
        Continue with Google
      </button>

      <DobModal
        isOpen={showDobModal}
        provider="google"
        onClose={() => setShowDobModal(false)}
        onSubmit={handleDobSubmit}
        isLoading={googleLoginMutation.isPending}
      />
    </>
  );
}
