"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPasswordMutation } from "@/hooks/use-password-reset";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const forgotPasswordMutation = useForgotPasswordMutation();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPasswordMutation.mutate(data.email, {
      onSuccess: () => {
        setSubmitted(true);
      },
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-surface flex flex-col">
        <main className="flex-1 w-full max-w-[1120px] mx-auto px-5 md:px-10 py-8 md:py-12 lg:py-16 flex items-start md:items-center justify-center">
          <div className="w-full max-w-[520px]">
            <header className="flex items-center mb-8 md:mb-10">
              <Logo size="md" />
            </header>

            <section className="bg-white rounded-xl border border-outline-variant/40 p-0 md:p-10 flex flex-col">
              <div className="flex flex-col gap-2 mb-8 md:mb-10 text-center">
                <div className="w-16 h-16 rounded-full bg-avatar-bg flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green"
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
                <h1 className="font-serif text-primary text-[30px] md:text-[32px] leading-[1.2]">
                  Check your email
                </h1>
                <p className="text-[15px] md:text-base leading-6 text-muted">
                  If an account with that email exists, we&apos;ve sent a
                  password reset link.
                </p>
              </div>

              <div className="text-center">
                <a
                  href="/login"
                  className="text-sm font-semibold text-green underline underline-offset-4 hover:text-green-dark"
                >
                  Back to log in
                </a>
              </div>
            </section>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <main className="flex-1 w-full max-w-[1120px] mx-auto px-5 md:px-10 py-8 md:py-12 lg:py-16 flex items-start md:items-center justify-center">
        <div className="w-full max-w-[520px]">
          {/* Logo */}
          <header className="flex items-center mb-8 md:mb-10">
            <Logo size="md" />
          </header>

          {/* Card */}
          <section className="bg-white rounded-xl border border-outline-variant/40 p-0 md:p-10 flex flex-col">
            <div className="flex flex-col gap-2 mb-8 md:mb-10">
              <h1 className="font-serif text-primary text-[30px] md:text-[32px] leading-[1.2]">
                Reset your password
              </h1>
              <p className="text-[15px] md:text-base leading-6 text-muted">
                Enter the email on your account and we&apos;ll send you a link.
              </p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col"
              noValidate
            >
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="email"
                  className="text-sm leading-5 font-semibold text-primary"
                >
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="sarah@example.com"
                  {...register("email")}
                  className="h-12 px-4"
                  aria-invalid={!!errors.email}
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 mt-6 bg-green hover:bg-green-dark text-white text-sm font-semibold flex items-center justify-center rounded-lg"
                disabled={forgotPasswordMutation.isPending}
              >
                {forgotPasswordMutation.isPending
                  ? "Sending..."
                  : "Send reset link"}
              </Button>
            </form>

            <div className="w-full text-center mt-6">
              <a
                href="/login"
                className="text-sm font-semibold text-green underline underline-offset-4 hover:text-green-dark"
              >
                Back to log in
              </a>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
