"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoginMutation } from "@/hooks/use-login";
import { GoogleButton } from "@/components/social/google-button";
import { AppleButton } from "@/components/social/apple-button";
import { LandingLogo } from "@/components/landing/logo";
import Link from "next/link";
import { Eye, EyeClosed } from "lucide-react";
import { UnverifiedEmailNotice } from "@/components/auth/unverified-email-notice";
import { apiErrorCode, apiErrorMessage } from "@/lib/api-error";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";

type Translate = ReturnType<typeof useTranslations<"auth.validation">>;

// Built per render so validation messages use the current language
const createLoginSchema = (t: Translate) =>
  z.object({
    email: z.string().email(t("emailInvalid")).toLowerCase().trim(),
    password: z.string().min(1, t("passwordRequired")),
  });

type LoginFormData = z.infer<ReturnType<typeof createLoginSchema>>;

export default function LoginPage() {
  const t = useTranslations("auth.login");
  const tAuth = useTranslations("auth");
  const tValidation = useTranslations("auth.validation");
  const loginMutation = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(createLoginSchema(tValidation)),
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const loginErrorMessage = apiErrorMessage(loginMutation.error);
  const unverifiedEmail =
    apiErrorCode(loginMutation.error) === "EMAIL_NOT_VERIFIED"
      ? loginMutation.variables?.email
      : undefined;

  return (
    <div className="min-h-screen bg-surface flex flex-col relative">
      {/* Logo */}
      <header className="w-full px-6 pt-6 sm:px-8 sm:pt-8 lg:px-10 lg:pt-10 flex items-center justify-between">
        <LandingLogo size="md" />
        <LanguageSwitcher />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 w-full max-w-md mx-auto">
        {/* Mobile logo */}
        <header className="mb-8 flex items-center gap-2 sm:hidden">
          <Link href="/" className="flex items-center gap-2">
            <LandingLogo asLink={false} size="sm" textColor="dark" />
          </Link>
        </header>

        <div className="w-full bg-white rounded-xl sm:rounded-2xl shadow-card border border-surface-high p-8 sm:p-10">
          {/* Card Header */}
          <div className="mb-8">
            <h1 className="text-[2rem] leading-tight text-primary font-serif mb-2">
              {t("title")}
            </h1>
            <p className="text-muted text-sm">{t("subtitle")}</p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
            noValidate
          >
            {/* Server error */}
            {unverifiedEmail ? (
              <UnverifiedEmailNotice
                email={unverifiedEmail}
                checkEmailPath="/check-email"
              />
            ) : (
              loginErrorMessage && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {loginErrorMessage}
                </div>
              )
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                {tAuth("emailLabel")}
              </Label>
              <Input
                id="email"
                type="email"
                dir="ltr"
                placeholder="sarah@example.com"
                {...register("email")}
                className="px-4 py-3"
                aria-invalid={!!errors.email}
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2 relative">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-sm font-medium">
                  {tAuth("passwordLabel")}
                </Label>
                <a
                  href="/forgot-password"
                  className="text-sm text-green hover:text-green-dark font-medium transition-colors"
                >
                  {t("forgotPassword")}
                </a>
              </div>

              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  dir="ltr"
                  className="px-4 py-3 pe-24 tracking-[0.2em]"
                  aria-invalid={!!errors.password}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-sm text-muted hover:text-primary px-1 cursor-pointer transition-colors"
                  tabIndex={-1}
                  aria-label={
                    showPassword ? tAuth("hidePassword") : tAuth("showPassword")
                  }
                >
                  {/* <span className="w-4 h-4 rounded-full bg-muted inline-block" /> */}

                  {showPassword ? <Eye size={20} /> : <EyeClosed size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <Button type="submit" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? t("submitting") : t("submit")}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8 flex items-center">
            <div className="flex-grow border-t border-surface-high" />
            <span className="flex-shrink-0 mx-4 text-muted text-sm">
              {tAuth("or")}
            </span>
            <div className="flex-grow border-t border-surface-high" />
          </div>

          {/* Social buttons */}

          <div className="space-y-4">
            <GoogleButton />
            <AppleButton />
          </div>

          {/* Footer */}
          <div className="text-center mt-10 text-sm text-muted">
            {t("newHere")}{" "}
            <a
              href="/register"
              className="text-green hover:text-green-dark font-medium transition-colors"
            >
              {t("createAccount")}
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
