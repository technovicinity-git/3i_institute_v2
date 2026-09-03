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

const loginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const { setUser, setAccessToken, setLoading } = useAuthStore();

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

      // Check if Admin
      if (userData.role !== "Admin") {
        toast.error("This account does not have admin access");
        setIsSubmitting(false);
        return;
      }

      setUser({ ...userData, role: "Admin" });
      setAccessToken(accessToken);
      setLoading(false);

      toast.success(`Welcome back, ${userData.firstName}!`);
      router.push("/admin/dashboard");
    } catch (error: any) {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F4] flex flex-col relative">
      <header className="w-full px-6 pt-6 sm:px-8 sm:pt-8 lg:px-10 lg:pt-10">
        <LandingLogo size="md" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 w-full max-w-md mx-auto">
        <div className="w-full bg-white rounded-xl sm:rounded-2xl shadow-card border border-surface-high p-8 sm:p-10">
          <div className="mb-8">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gold mb-2">
              Admin Portal
            </p>
            <h1 className="text-[2rem] leading-tight text-primary font-serif mb-2">
              Welcome back
            </h1>
            <p className="text-muted text-sm">
              Sign in to manage the platform.
            </p>
          </div>

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
                placeholder="admin@example.com"
                {...register("email")}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
              {errors.email && (
                <p className="text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-[#0C1F33]"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className="w-full px-4 py-3 pr-20 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted"
                >
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
              className="w-full bg-green text-white py-3 rounded-lg font-medium hover:bg-green-dark disabled:opacity-50"
            >
              {isSubmitting ? "Logging in..." : "Log in"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
