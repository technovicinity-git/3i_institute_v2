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
      <div className="hidden sm:flex absolute top-8 left-8 items-center gap-2">
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
