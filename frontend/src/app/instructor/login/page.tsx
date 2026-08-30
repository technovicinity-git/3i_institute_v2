/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { LandingLogo } from "@/components/landing/logo";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { useProfileStore } from "@/stores/profile-store";

const loginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function InstructorLoginPage() {
  const router = useRouter();
  const { setUser, setAccessToken, setLoading } = useAuthStore();
  const { setActiveProfile } = useProfileStore();

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);

    try {
      const response = await apiClient.post("/auth/login", data);
      const { user: userData, accessToken } = response.data.data;

      // Check if user has Instructor role
      if (userData.role !== "Instructor") {
        toast.error("This account is not an instructor account");
        setIsSubmitting(false);
        return;
      }

      // Set auth state
      setUser({
        ...userData,
        role: "Instructor",
      });
      setAccessToken(accessToken);
      setLoading(false);

      // Clear active profile
      setActiveProfile(null);
      localStorage.removeItem("activeProfile");

      toast.success(`Welcome back, ${userData.firstName}!`);
      router.push("/instructor/dashboard");
    } catch (error: any) {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F4] flex flex-col relative">
      {/* Logo */}
      <header className="w-full px-6 pt-6 sm:px-8 sm:pt-8 lg:px-10 lg:pt-10">
        <LandingLogo size="md" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 w-full max-w-md mx-auto">
        <div className="w-full bg-white rounded-xl sm:rounded-2xl shadow-card border border-surface-high p-8 sm:p-10">
          {/* Header */}
          <div className="mb-8">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gold mb-2">
              Instructor Portal
            </p>
            <h1 className="text-[2rem] leading-tight text-primary font-serif mb-2">
              Welcome back
            </h1>
            <p className="text-muted text-sm">
              Sign in to your instructor dashboard.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
            noValidate
          >
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-[#0C1F33]"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                placeholder="instructor@example.com"
                {...register("email")}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors text-slate-900 placeholder:text-slate-400"
              />
              {errors.email && (
                <p className="text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2 relative">
              <div className="flex justify-between items-center">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-[#0C1F33]"
                >
                  Password
                </label>
                <a
                  href="/forgot-password"
                  className="text-sm text-green hover:text-green-dark font-medium"
                >
                  Forgot password?
                </a>
              </div>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className="w-full px-4 py-3 pr-20 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-sm text-muted hover:text-primary"
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green text-white py-3 rounded-lg font-medium hover:bg-green-dark transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? "Logging in..." : "Log in"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8 flex items-center">
            <div className="flex-grow border-t border-gray-200" />
            <span className="flex-shrink-0 mx-4 text-muted text-sm">or</span>
            <div className="flex-grow border-t border-gray-200" />
          </div>

          {/* Register link */}
          <div className="text-center text-sm text-muted">
            Want to become an instructor?{" "}
            <a
              href="/instructor/register"
              className="text-green hover:text-green-dark font-medium"
            >
              Apply now
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
