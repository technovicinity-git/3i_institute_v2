"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/dashboard/sidebar";
import DashboardNavbar from "@/components/dashboard/navbar";
import { useProfileStore } from "@/stores/profile-store";
import { useAuthStore } from "@/stores/auth-store";
import { useLearnerProfiles } from "@/hooks/use-learner-profiles";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { activeProfile, setActiveProfile, setProfiles } = useProfileStore();
  const { user } = useAuthStore();
  const { data: profiles, isLoading: profilesLoading } = useLearnerProfiles();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Restore or auto-select active profile
  useEffect(() => {
    if (profiles) {
      setProfiles(profiles);

      if (!activeProfile) {
        const stored = localStorage.getItem("activeProfile");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            const found = profiles.find((p) => p.id === parsed.id);
            if (found) {
              setActiveProfile(found);
              return;
            }
          } catch {
            // Invalid stored profile — ignore
          }
        }

        const firstActive = profiles.find((p) => p.isActive);
        if (firstActive) {
          setActiveProfile(firstActive);
        } else if (profiles.length > 0) {
          setActiveProfile(profiles[0]!);
        }
      }
    }
  }, [profiles, activeProfile, setActiveProfile, setProfiles]);

  // Redirect to profiles if no profiles exist
  useEffect(() => {
    if (
      !profilesLoading &&
      profiles &&
      profiles.length === 0 &&
      pathname !== "/profiles"
    ) {
      router.push("/profiles");
    }
  }, [profiles, profilesLoading, pathname, router]);

  if (profilesLoading && !activeProfile) {
    return (
      <div className="flex h-screen bg-[#FBF9F4] items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#FBF9F4]">
      {/* Sidebar - Desktop (fixed) */}
      <div className="hidden lg:block shrink-0 overflow-y-auto">
        <Sidebar />
      </div>

      {/* Sidebar - Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-[260px] overflow-y-auto">
            <Sidebar onNavigate={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navbar - fixed at top */}
        <DashboardNavbar
          onMenuClick={() => setSidebarOpen(true)}
          profileName={activeProfile?.displayName ?? user?.firstName ?? "User"}
        />

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
