"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Logo } from "@/components/layout/logo";
import { AuthCard } from "@/components/ui/auth-card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegisterMutation } from "@/hooks/use-register";

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z
    .string()
    .min(10, "Password must be at least 10 characters")
    .max(128),
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
    { message: "You must be at least 18 years old" },
  ),
  locale: z.enum(["en", "bn", "hi", "ur", "ar"]),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "bn", label: "বাংলা" },
  { code: "hi", label: "हिन्दी" },
  { code: "ur", label: "اردو" },
  { code: "ar", label: "العربية" },
] as const;

export default function RegisterPage() {
  const registerMutation = useRegisterMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedLocale, setSelectedLocale] = useState<string>("en");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      locale: "en",
    },
  });

  const handleLocaleChange = (locale: string) => {
    setSelectedLocale(locale);
    setValue("locale", locale as RegisterFormData["locale"]);
  };

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center py-10 relative px-4">
      {/* Header */}
      <header className="w-full max-w-6xl absolute top-0 left-0 p-8">
        <Logo size="sm" />
      </header>

      {/* Main */}
      <main className="w-full flex-grow flex items-center justify-center pt-16 pb-8">
        <AuthCard maxWidth="max-w-[500px]">
          {/* Card Header */}
          <div className="mb-8">
            <Eyebrow className="mb-2">Create your account</Eyebrow>
            <h1 className="text-3xl font-serif text-primary mb-2">
              Start your journey
            </h1>
            <p className="text-sm text-muted">
              One account. Add your children whenever you&apos;re ready.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
            noValidate
          >
            {/* First Name */}
            <div>
              <Label
                htmlFor="firstName"
                className="text-xs font-semibold mb-1.5 block"
              >
                First name
              </Label>
              <Input
                id="firstName"
                placeholder="e.g. Sarah"
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
            <div>
              <Label
                htmlFor="lastName"
                className="text-xs font-semibold mb-1.5 block"
              >
                Last name
              </Label>
              <Input
                id="lastName"
                placeholder="e.g. Ahmed"
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
            <div>
              <Label
                htmlFor="email"
                className="text-xs font-semibold mb-1.5 block"
              >
                Email address
              </Label>
              <Input
                id="email"
                type="email"
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
            <div>
              <Label
                htmlFor="password"
                className="text-xs font-semibold mb-1.5 block"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  {...register("password")}
                  className="py-2.5 pr-16 font-mono"
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted hover:text-primary font-medium"
                  tabIndex={-1}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <p className="mt-1.5 text-[11px] text-muted">
                At least 10 characters
              </p>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <Label
                htmlFor="dateOfBirth"
                className="text-xs font-semibold mb-1.5 block"
              >
                Date of birth
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
                Must be 18 or older
              </p>
              {errors.dateOfBirth && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.dateOfBirth.message}
                </p>
              )}
            </div>

            {/* Language */}
            <div>
              <Label className="text-xs font-semibold mb-2 block">
                Preferred Language / ভাষা / भाषा / اردو
              </Label>
              <div
                className="flex flex-wrap gap-2"
                role="radiogroup"
                aria-label="Language selection"
              >
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    role="radio"
                    aria-checked={selectedLocale === lang.code}
                    onClick={() => handleLocaleChange(lang.code)}
                    className={`px-4 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                      selectedLocale === lang.code
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-primary border-outline-variant hover:border-gray-300"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
              <input type="hidden" {...register("locale")} />
            </div>

            {/* Submit */}
            <div className="pt-2">
              <Button
                type="submit"
                className="w-full bg-green hover:bg-green-dark text-white py-3 rounded-lg shadow-sm"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending
                  ? "Creating account..."
                  : "Create account"}
              </Button>
            </div>
          </form>

          {/* Divider */}
          <div className="flex items-center justify-center gap-3 my-6">
            <div className="flex-1 h-px bg-outline-variant" />
            <span className="text-[11px] text-muted font-medium uppercase tracking-wider">
              or
            </span>
            <div className="flex-1 h-px bg-outline-variant" />
          </div>

          {/* Social Logins */}
          <div className="space-y-3">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 bg-white border border-primary/30 hover:bg-gray-50 text-primary font-medium py-2.5 px-4 rounded-lg text-sm transition-colors"
              onClick={() => toast.info("Google login coming soon")}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                  fill="currentColor"
                />
              </svg>
              Continue with Google
            </button>

            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 bg-white border border-primary/30 hover:bg-gray-50 text-primary font-medium py-2.5 px-4 rounded-lg text-sm transition-colors"
              onClick={() => toast.info("Apple login coming soon")}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M15.42 1.412C16.402 0.22 17.062-1.523 16.883-3.237c-1.468.059-3.327.978-4.347 2.206-0.89 1.077-1.688 2.875-1.472 4.531 1.635.127 3.366-.889 4.356-2.088zm-3.528 5.767c-1.895-.127-3.69 1.054-4.664 1.054-0.975 0-2.484-1.033-4.041-1.01-2.03.023-3.905 1.184-4.945 3.003-2.124 3.682-.544 9.124 1.517 12.115 1.008 1.465 2.197 3.1 3.766 3.045 1.488-.057 2.05-.964 3.843-.964 1.774 0 2.296.964 3.842.942 1.605-.023 2.627-1.466 3.614-2.915 1.144-1.674 1.615-3.295 1.635-3.376-.036-.015-3.162-1.213-3.204-4.821-.036-3.023 2.463-4.475 2.576-4.545-1.425-2.081-3.636-2.366-4.417-2.43z"
                  transform="translate(2, 4)"
                />
              </svg>
              Continue with Apple
            </button>
          </div>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-[13px] text-muted">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-green font-semibold hover:underline"
              >
                Log in
              </a>
            </p>
          </div>
        </AuthCard>
      </main>
    </div>
  );
}
