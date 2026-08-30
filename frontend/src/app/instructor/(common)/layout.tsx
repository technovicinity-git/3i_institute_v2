"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import InstructorSidebar from "@/components/instructor/sidebar";
import InstructorNavbar from "@/components/instructor/navbar";
import { useAuthStore } from "@/stores/auth-store";
import { useSessionRestore } from "@/hooks/use-session-restore";

export default function InstructorCommonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading, setLoading } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Restore session on mount
  useSessionRestore();

  // Add a safety timeout — if restore takes too long, stop loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        setLoading(false);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isLoading, setLoading]);

  // Redirect to login if no user after loading completes
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/instructor/login");
    }
  }, [isLoading, user, router]);

  // Show loading only while session is being restored
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FBF9F4]">
        <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
      </div>
    );
  }

  // Don't render content if no user
  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#FBF9F4]">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block shrink-0 h-full">
        <InstructorSidebar />
      </div>

      {/* Sidebar - Mobile overlay */}
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

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <InstructorNavbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
