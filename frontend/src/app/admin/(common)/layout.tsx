"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/sidebar";
import AdminNavbar from "@/components/admin/navbar";
import { useAuthStore } from "@/stores/auth-store";
import { apiClient } from "@/lib/api-client";

export default function AdminCommonLayout({
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
      if (user && user.role === "Admin") {
        setLoading(false);
        return;
      }

      try {
        const refreshResponse = await apiClient.post("/auth/refresh", {});
        const { accessToken } = refreshResponse.data.data;
        setAccessToken(accessToken);

        const userResponse = await apiClient.get("/users/me");
        const userData = userResponse.data.data;

        if (userData.role?.name === "Admin" || userData.role === "Admin") {
          setUser({
            ...userData,
            role: userData.role?.name ?? userData.role ?? "Admin",
          });
          setLoading(false);
        } else {
          setUser(null);
          setAccessToken(null);
          setLoading(false);
          router.replace("/admin/login");
        }
      } catch {
        setUser(null);
        setAccessToken(null);
        setLoading(false);
        router.replace("/admin/login");
      }
    };

    restoreSession();
  }, [user, setUser, setAccessToken, setLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FBF9F4]">
        <div className="w-10 h-10 rounded-full border-4 border-[#0D2B45] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#FBF9F4]">
      <div className="hidden lg:block shrink-0 h-full">
        <AdminSidebar />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 h-full">
            <AdminSidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminNavbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
