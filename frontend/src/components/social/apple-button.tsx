/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { loadAppleScript } from "@/lib/social-auth";
import { DobModal } from "@/components/social/dob-modal";
import { useAppleLoginMutation } from "@/hooks/use-apple-auth";
import { toast } from "sonner";
import { Button } from "../ui/button";

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
      <Button
        type="submit"
        className="w-full flex items-center justify-center gap-3 bg-white py-3 rounded-element font-medium hover:bg-green-dark shadow-sm"
        onClick={handleAppleClick}
        // className="w-full flex items-center justify-center gap-3 bg-white border border-primary text-primary py-3 rounded-element font-medium hover:bg-gray-50 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 128 128"
          id="apple"
        >
          <path
            d="M97.905 67.885c.174 18.8 16.494 25.057 16.674 25.137-.138.44-2.607 8.916-8.597 17.669-5.178 7.568-10.553 15.108-19.018 15.266-8.318.152-10.993-4.934-20.504-4.934-9.508 0-12.479 4.776-20.354 5.086-8.172.31-14.395-8.185-19.616-15.724-10.668-15.424-18.821-43.585-7.874-62.594 5.438-9.44 15.158-15.417 25.707-15.571 8.024-.153 15.598 5.398 20.503 5.398 4.902 0 14.106-6.676 23.782-5.696 4.051.169 15.421 1.636 22.722 12.324-.587.365-13.566 7.921-13.425 23.639m-15.633-46.166c4.338-5.251 7.258-12.563 6.462-19.836-6.254.251-13.816 4.167-18.301 9.416-4.02 4.647-7.54 12.087-6.591 19.216 6.971.54 14.091-3.542 18.43-8.796"
            fill="#000000"
          ></path>
        </svg>
        Continue with Apple
      </Button>

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
