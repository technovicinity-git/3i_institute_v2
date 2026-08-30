"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import InstructorSidebar from "@/components/instructor/sidebar";
import InstructorNavbar from "@/components/instructor/navbar";
import { useAuthStore } from "@/stores/auth-store";
import { apiClient } from "@/lib/api-client";

export default function InstructorCommonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, setUser, setAccessToken, isLoading, setLoading } =
    useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const restoreSession = async () => {
      // If user already loaded and is Instructor, just set loading false
      if (user && user.role === "Instructor") {
        setLoading(false);
        return;
      }

      try {
        // Try refresh token
        const refreshResponse = await apiClient.post("/auth/refresh", {});
        const { accessToken } = refreshResponse.data.data;
        setAccessToken(accessToken);

        // Get user profile
        const userResponse = await apiClient.get("/users/me");
        const userData = userResponse.data.data;

        // Check if Instructor
        if (
          userData.role?.name === "Instructor" ||
          userData.role === "Instructor"
        ) {
          setUser({
            ...userData,
            role: userData.role?.name ?? userData.role ?? "Instructor",
          });
          setLoading(false);
        } else {
          // Not an instructor
          setUser(null);
          setAccessToken(null);
          setLoading(false);
          router.replace("/instructor/login");
        }
      } catch {
        // No valid session
        setUser(null);
        setAccessToken(null);
        setLoading(false);
        router.replace("/instructor/login");
      }
    };

    restoreSession();
  }, [user, setUser, setAccessToken, setLoading, router]);

  // Loading
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FBF9F4]">
        <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
      </div>
    );
  }

  // No user
  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#FBF9F4]">
      <div className="hidden lg:block shrink-0 h-full">
        <InstructorSidebar />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 h-full">
            <InstructorSidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <InstructorNavbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
