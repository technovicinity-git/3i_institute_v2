/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { loadAppleScript } from "@/lib/social-auth";
import { DobModal } from "@/components/social/dob-modal";
import { useAppleLoginMutation } from "@/hooks/use-apple-auth";
import { toast } from "sonner";

export function AppleButton() {
  const appleLoginMutation = useAppleLoginMutation();
  const [showDobModal, setShowDobModal] = useState(false);
  const [appleData, setAppleData] = useState<{
    identityToken: string;
    firstName?: string;
    lastName?: string;
  } | null>(null);

  useEffect(() => {
    loadAppleScript()
      .then(() => {
        if (window.AppleID) {
          window.AppleID.init({
            clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID!,
            scope: "name email",
            redirectURI: process.env.NEXT_PUBLIC_APPLE_REDIRECT_URL!,
            usePopup: true,
          });
        }
      })
      .catch(() => {
        toast.error("Failed to load Apple sign-in");
      });
  }, []);

  const handleAppleClick = async () => {
    try {
      if (!window.AppleID) {
        toast.error("Apple sign-in not available");
        return;
      }

      const response = await window.AppleID.signIn();

      const identityToken = response.authorization?.id_token;
      const firstName = response.user?.name?.firstName;
      const lastName = response.user?.name?.lastName;

      if (!identityToken) {
        toast.error("No identity token received from Apple");
        return;
      }

      setAppleData({ identityToken, firstName, lastName });

      // Try login without DOB first
      appleLoginMutation.mutate(
        { identityToken, firstName, lastName },
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
    } catch (error) {
      console.error("Apple sign-in error:", error);
      toast.error("Apple sign-in failed");
    }
  };

  const handleDobSubmit = (dateOfBirth: string) => {
    if (!appleData) return;

    appleLoginMutation.mutate(
      {
        identityToken: appleData.identityToken,
        firstName: appleData.firstName,
        lastName: appleData.lastName,
        dateOfBirth,
      },
      {
        onSuccess: () => {
          setShowDobModal(false);
        },
      },
    );
  };

  return (
    <>
      <button
        type="button"
        onClick={handleAppleClick}
        className="w-full flex items-center justify-center gap-3 bg-white border border-primary text-primary py-3 rounded-element font-medium hover:bg-gray-50 transition-colors"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M15.42 1.412C16.402 0.22 17.062-1.523 16.883-3.237c-1.468.059-3.327.978-4.347 2.206-0.89 1.077-1.688 2.875-1.472 4.531 1.635.127 3.366-.889 4.356-2.088zm-3.528 5.767c-1.895-.127-3.69 1.054-4.664 1.054-0.975 0-2.484-1.033-4.041-1.01-2.03.023-3.905 1.184-4.945 3.003-2.124 3.682-.544 9.124 1.517 12.115 1.008 1.465 2.197 3.1 3.766 3.045 1.488-.057 2.05-.964 3.843-.964 1.774 0 2.296.964 3.842.942 1.605-.023 2.627-1.466 3.614-2.915 1.144-1.674 1.615-3.295 1.635-3.376-.036-.015-3.162-1.213-3.204-4.821-.036-3.023 2.463-4.475 2.576-4.545-1.425-2.081-3.636-2.366-4.417-2.43z"
            transform="translate(2, 4)"
          />
        </svg>
        Continue with Apple
      </button>

      <DobModal
        isOpen={showDobModal}
        provider="apple"
        onClose={() => setShowDobModal(false)}
        onSubmit={handleDobSubmit}
        isLoading={appleLoginMutation.isPending}
      />
    </>
  );
}
