"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Logo } from "@/components/layout/logo";
import { AuthCard } from "@/components/ui/auth-card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegisterMutation } from "@/hooks/use-register";
import { GoogleButton } from "@/components/social/google-button";
import { AppleButton } from "@/components/social/apple-button";
import { LandingLogo } from "@/components/landing/logo";
import { Eye, EyeClosed } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useChangeLocale } from "@/hooks/use-change-locale";
import { localeNames, locales, type Locale } from "@/i18n/config";

type Translate = ReturnType<typeof useTranslations<"auth.validation">>;

// Built per render so validation messages use the current language
const createRegisterSchema = (t: Translate) =>
  z.object({
    firstName: z.string().min(1, t("firstNameRequired")).max(100),
    lastName: z.string().min(1, t("lastNameRequired")).max(100),
    email: z.string().email(t("emailInvalid")).toLowerCase().trim(),
    password: z.string().min(10, t("passwordMin")).max(128),
    dateOfBirth: z.string().refine(
      (value) => {
        const date = new Date(value);
        if (isNaN(date.getTime())) return false;
        const today = new Date();
        const eighteenYearsAgo = new Date(
          today.getFullYear() - 18,
          today.getMonth(),
          today.getDate(),
        );
        return date <= eighteenYearsAgo;
      },
      { message: t("mustBe18") },
    ),
    locale: z.enum(locales),
  });

type RegisterFormData = z.infer<ReturnType<typeof createRegisterSchema>>;

export default function RegisterPage() {
  const t = useTranslations("auth.register");
  const tAuth = useTranslations("auth");
  const tValidation = useTranslations("auth.validation");
  const currentLocale = useLocale();
  const { changeLocale } = useChangeLocale();
  const registerMutation = useRegisterMutation();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(createRegisterSchema(tValidation)),
    defaultValues: {
      // The language the page is shown in becomes the account's default
      locale: currentLocale,
    },
  });

  // Keep the saved language in step with the page language, including
  // when it's changed from the header picker
  useEffect(() => {
    setValue("locale", currentLocale);
  }, [currentLocale, setValue]);

  // Choosing a language switches the page right away, and it's saved as
  // the account's language when the account is created.
  const handleLocaleChange = (locale: Locale) => {
    setValue("locale", locale);
    if (locale !== currentLocale) void changeLocale(locale);
  };

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col relative">
      <header className="w-full px-6 pt-6 sm:px-8 sm:pt-8 lg:px-10 lg:pt-10 flex items-center justify-between">
        <LandingLogo size="md" />
        <LanguageSwitcher />
      </header>

      {/* Main */}
      <main className="w-full flex-grow flex items-center justify-center pt-16 pb-8 ">
        <AuthCard maxWidth="max-w-[500px]">
          {/* Card Header */}
          <div className="mb-8">
            <Eyebrow className="mb-2">{t("eyebrow")}</Eyebrow>
            <h1 className="text-3xl font-serif text-primary mb-2">
              {t("title")}
            </h1>
            <p className="text-sm text-muted">{t("subtitle")}</p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
            noValidate
          >
            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium">
                {t("firstName")}
              </Label>
              <Input
                id="firstName"
                placeholder={t("firstNamePlaceholder")}
                {...register("firstName")}
                className="py-2.5"
                aria-invalid={!!errors.firstName}
              />
              {errors.firstName && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium">
                {t("lastName")}
              </Label>
              <Input
                id="lastName"
                placeholder={t("lastNamePlaceholder")}
                {...register("lastName")}
                className="py-2.5"
                aria-invalid={!!errors.lastName}
              />
              {errors.lastName && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.lastName.message}
                </p>
              )}
            </div>

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
                className="py-2.5"
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                {tAuth("passwordLabel")}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  {...register("password")}
                  dir="ltr"
                  className="py-2.5 pe-16 font-mono"
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 end-0 flex items-center pe-3 text-xs text-muted hover:text-primary font-medium cursor-pointer transition-colors"
                  tabIndex={-1}
                  aria-label={
                    showPassword ? tAuth("hidePassword") : tAuth("showPassword")
                  }
                >
                  {showPassword ? <Eye size={20} /> : <EyeClosed size={20} />}
                </button>
              </div>
              <p className="mt-1.5 text-[11px] text-muted">
                {t("passwordHint")}
              </p>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="text-sm font-medium">
                {t("dateOfBirth")}
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...register("dateOfBirth")}
                className="py-2.5"
                aria-invalid={!!errors.dateOfBirth}
                max={
                  new Date(
                    new Date().getFullYear() - 18,
                    new Date().getMonth(),
                    new Date().getDate(),
                  )
                    .toISOString()
                    .split("T")[0]
                }
              />
              <p className="mt-1.5 text-[11px] text-muted">
                {t("dateOfBirthHint")}
              </p>
              {errors.dateOfBirth && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.dateOfBirth.message}
                </p>
              )}
            </div>

            {/* Language */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t("language")}</Label>
              <div
                className="flex flex-wrap gap-2"
                role="radiogroup"
                aria-label={t("language")}
              >
                {locales.map((code) => (
                  <button
                    key={code}
                    type="button"
                    role="radio"
                    lang={code}
                    aria-checked={currentLocale === code}
                    onClick={() => handleLocaleChange(code)}
                    className={`px-4 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                      currentLocale === code
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-primary border-outline-variant hover:border-gray-300"
                    }`}
                  >
                    {localeNames[code]}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[11px] text-muted">
                {t("languageHint")}
              </p>
              <input type="hidden" {...register("locale")} />
            </div>

            {/* Submit */}
            <div className="pt-2">
              <Button type="submit" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? t("submitting") : t("submit")}
              </Button>
            </div>
          </form>

          {/* Divider */}
          <div className="flex items-center justify-center gap-3 my-6">
            <div className="flex-1 h-px bg-outline-variant" />
            <span className="text-[11px] text-muted font-medium uppercase tracking-wider">
              {tAuth("or")}
            </span>
            <div className="flex-1 h-px bg-outline-variant" />
          </div>

          {/* Social Logins */}
          <div className="space-y-3">
            <GoogleButton />
            <AppleButton />
          </div>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-[13px] text-muted">
              {t("haveAccount")}{" "}
              <a
                href="/login"
                className="text-green font-semibold hover:underline"
              >
                {t("logIn")}
              </a>
            </p>
          </div>
        </AuthCard>
      </main>
    </div>
  );
}
