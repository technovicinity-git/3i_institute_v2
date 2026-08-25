"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  LogOut,
  User,
  LayoutDashboard,
  BookOpen,
} from "lucide-react";
import { LandingLogo } from "@/components/landing/logo";
import { useAuthStore } from "@/stores/auth-store";
import { useProfileStore } from "@/stores/profile-store";
import { useLogoutMutation } from "@/hooks/use-auth-mutations";
import { useSessionRestore } from "@/hooks/use-session-restore";

export function Navbar() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const { activeProfile, setActiveProfile } = useProfileStore();
  const logoutMutation = useLogoutMutation();

  useSessionRestore();

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setShowDropdown(false);
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setActiveProfile(null);
        localStorage.removeItem("activeProfile");
        router.push("/login");
      },
    });
  };

  const handleSwitchProfile = () => {
    setShowDropdown(false);
    setActiveProfile(null);
    localStorage.removeItem("activeProfile");
    router.push("/profiles");
  };

  const isLoggedIn = !!user;

  return (
    <nav className="bg-white border-b border-gray-100 py-4 px-6 md:px-12 sticky top-0 z-50 flex items-center justify-between shadow-sm">
      <Link href="/" className="flex items-center gap-2">
        <LandingLogo asLink={false} size="sm" textColor="dark" />
      </Link>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium">
        <Link
          href="/courses"
          className="text-brand-navy hover:text-green transition-colors"
        >
          Courses
        </Link>
        <Link
          href="#pathways"
          className="text-brand-navy hover:text-green transition-colors"
        >
          Programs
        </Link>
        <Link
          href="#faculty"
          className="text-brand-navy hover:text-green transition-colors"
        >
          Instructors
        </Link>
        <Link
          href="#about"
          className="text-brand-navy hover:text-green transition-colors"
        >
          About
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {isLoading ? (
          // Show skeleton/placeholder while loading
          <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
        ) : isLoggedIn ? (
          <>
            {/* Dashboard Button */}
            <Link
              href="/dashboard"
              className="hidden sm:flex items-center gap-2 text-sm font-medium text-brand-navy hover:text-green transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-50 transition-colors"
              >
                {activeProfile?.avatarUrl ? (
                  <Image
                    src={activeProfile.avatarUrl}
                    alt={activeProfile.displayName}
                    width={36}
                    height={36}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#12304E] text-white flex items-center justify-center text-sm font-semibold">
                    {(activeProfile?.displayName ?? user?.firstName ?? "U")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                )}
                <ChevronDown
                  className={`w-4 h-4 text-[#64748B] transition-transform ${
                    showDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-lg z-30 overflow-hidden">
                  {/* Profile Info */}
                  <div className="px-4 py-3 bg-[#FBF9F4] border-b border-gray-100">
                    <p className="text-sm font-semibold text-[#12304E]">
                      {activeProfile?.displayName ?? user?.firstName}
                    </p>
                    <p className="text-xs text-[#64748B]">{user?.email}</p>
                    {activeProfile && (
                      <span
                        className={`inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          activeProfile.isActive
                            ? "bg-green-50 text-[#22A146]"
                            : "bg-orange-50 text-orange-600"
                        }`}
                      >
                        {activeProfile.isActive ? "Active" : "No Seat"}
                      </span>
                    )}
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={() => {
                        router.push("/dashboard");
                        setShowDropdown(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#12304E] hover:bg-gray-50 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-[#64748B]" />
                      Dashboard
                    </button>

                    <button
                      onClick={() => {
                        router.push("/courses");
                        setShowDropdown(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#12304E] hover:bg-gray-50 transition-colors"
                    >
                      <BookOpen className="w-4 h-4 text-[#64748B]" />
                      My Courses
                    </button>

                    <button
                      onClick={handleSwitchProfile}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#12304E] hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-4 h-4 text-[#64748B]" />
                      Switch Profile
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-100">
                    <button
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <LogOut className="w-4 h-4" />
                      {logoutMutation.isPending ? "Logging out..." : "Log out"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="text-sm font-medium text-brand-navy hover:text-green"
            >
              Log in
            </Link>
            <Link
              href="/get-started"
              className="bg-green hover:bg-green-dark text-white text-sm font-medium py-2 px-5 rounded-md transition-colors shadow-sm"
            >
              Get started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
