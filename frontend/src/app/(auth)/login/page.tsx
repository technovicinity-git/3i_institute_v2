"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoginMutation } from "@/hooks/use-login";
import { GoogleButton } from "@/components/social/google-button";
import { AppleButton } from "@/components/social/apple-button";

const loginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const loginMutation = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col relative">
      {/* Desktop branding */}
      <div className="hidden sm:flex absolute top-8 left-8 items-center gap-2 pointer-events-none">
        <Logo size="sm" />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 w-full max-w-md mx-auto">
        {/* Mobile logo */}
        <header className="mb-8 flex items-center gap-2 sm:hidden">
          <Logo size="md" />
        </header>

        <div className="w-full bg-white rounded-card shadow-card border border-surface-high p-8 sm:p-10">
          {/* Card Header */}
          <div className="mb-8">
            <h1 className="text-[2rem] leading-tight text-primary font-serif mb-2">
              Welcome back
            </h1>
            <p className="text-muted text-sm">
              Please enter your credentials to log in.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
            noValidate
          >
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
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
                  Password
                </Label>
                <a
                  href="/forgot-password"
                  className="text-sm text-green hover:text-green-dark font-medium transition-colors"
                >
                  Forgot password?
                </a>
              </div>

              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className="px-4 py-3 pr-24 tracking-[0.2em]"
                  aria-invalid={!!errors.password}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-sm text-muted hover:text-primary bg-white px-1"
                  tabIndex={-1}
                >
                  <span className="w-4 h-4 rounded-full bg-muted inline-block" />
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-green text-white py-3 rounded-element font-medium hover:bg-green-dark shadow-sm"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Logging in..." : "Log in"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8 flex items-center">
            <div className="flex-grow border-t border-surface-high" />
            <span className="flex-shrink-0 mx-4 text-muted text-sm">or</span>
            <div className="flex-grow border-t border-surface-high" />
          </div>

          {/* Social buttons */}

          <div className="space-y-4">
            <GoogleButton />
            <AppleButton />
          </div>
          {/* <div className="space-y-4">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 bg-white border border-primary text-primary py-3 rounded-element font-medium hover:bg-gray-50 transition-colors"
              onClick={() => toast.info("Google login coming soon")}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                  fill="currentColor"
                />
              </svg>
              Continue with Google
            </button>

            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 bg-white border border-primary text-primary py-3 rounded-element font-medium hover:bg-gray-50 transition-colors"
              onClick={() => toast.info("Apple login coming soon")}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M15.42 1.412C16.402 0.22 17.062-1.523 16.883-3.237c-1.468.059-3.327.978-4.347 2.206-0.89 1.077-1.688 2.875-1.472 4.531 1.635.127 3.366-.889 4.356-2.088zm-3.528 5.767c-1.895-.127-3.69 1.054-4.664 1.054-0.975 0-2.484-1.033-4.041-1.01-2.03.023-3.905 1.184-4.945 3.003-2.124 3.682-.544 9.124 1.517 12.115 1.008 1.465 2.197 3.1 3.766 3.045 1.488-.057 2.05-.964 3.843-.964 1.774 0 2.296.964 3.842.942 1.605-.023 2.627-1.466 3.614-2.915 1.144-1.674 1.615-3.295 1.635-3.376-.036-.015-3.162-1.213-3.204-4.821-.036-3.023 2.463-4.475 2.576-4.545-1.425-2.081-3.636-2.366-4.417-2.43z"
                  transform="translate(2, 4)"
                />
              </svg>
              Continue with Apple
            </button>
          </div> */}

          {/* Footer */}
          <div className="text-center mt-10 text-sm text-muted">
            New to 3i?{" "}
            <a
              href="/register"
              className="text-green hover:text-green-dark font-medium transition-colors"
            >
              Create an account
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
