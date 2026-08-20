"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResetPasswordMutation } from "@/hooks/use-password-reset";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(10, "Password must be at least 10 characters")
      .max(128),
    confirmPassword: z
      .string()
      .min(10, "Password must be at least 10 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const resetPasswordMutation = useResetPasswordMutation();

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    if (!token) {
      resetPasswordMutation.mutate({
        token: "invalid",
        password: data.password,
      });
      return;
    }

    resetPasswordMutation.mutate({
      token,
      password: data.password,
    });
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <header className="w-full px-5 py-4 sm:px-8 sm:py-6 lg:px-10 lg:py-8">
        <Logo size="md" />
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-5 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <section className="w-full max-w-md bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-card p-6 sm:p-8 lg:p-10">
          {/* Heading */}
          <div className="mb-8 sm:mb-9">
            <h1 className="font-serif text-primary text-[30px] leading-[1.2] sm:text-[32px] lg:text-[36px]">
              Choose a new password
            </h1>
            <p className="mt-2 text-sm sm:text-[15px] leading-6 text-muted">
              At least 10 characters.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
            noValidate
          >
            {/* New Password */}
            <div>
              <Label
                htmlFor="password"
                className="block mb-2 text-sm font-semibold text-primary"
              >
                New password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  {...register("password")}
                  className="h-12 sm:h-[52px] pr-20"
                  aria-invalid={!!errors.password}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-1 text-sm font-medium text-muted hover:text-primary"
                  tabIndex={-1}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {showNewPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <Label
                htmlFor="confirmPassword"
                className="block mb-2 text-sm font-semibold text-primary"
              >
                Confirm new password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  {...register("confirmPassword")}
                  className="h-12 sm:h-[52px] pr-20"
                  aria-invalid={!!errors.confirmPassword}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-1 text-sm font-medium text-muted hover:text-primary"
                  tabIndex={-1}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="pt-1 sm:pt-2">
              <Button
                type="submit"
                className="w-full h-12 sm:h-[52px] bg-green hover:bg-green-dark text-white text-base font-semibold flex items-center justify-center shadow-sm"
                disabled={resetPasswordMutation.isPending}
              >
                {resetPasswordMutation.isPending
                  ? "Updating..."
                  : "Update password"}
              </Button>
            </div>
          </form>
        </section>
      </main>

      {/* Mobile Home Indicator */}
      <div className="flex justify-center pb-5 sm:hidden">
        <div className="w-32 h-1 rounded-full bg-gray-300" />
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-surface">
          <p className="text-muted">Loading...</p>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
