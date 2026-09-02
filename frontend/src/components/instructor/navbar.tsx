"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Search,
  Bell,
  Menu,
  ChevronDown,
  LogOut,
  User,
  Settings,
  BookOpen,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useLogoutMutation } from "@/hooks/use-auth-mutations";
import { useProfileStore } from "@/stores/profile-store";
import { useUserProfile } from "@/hooks/use-user-profile";

interface InstructorNavbarProps {
  onMenuClick: () => void;
}

export default function InstructorNavbar({
  onMenuClick,
}: InstructorNavbarProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: profile } = useUserProfile();
  const { setActiveProfile } = useProfileStore();
  const logoutMutation = useLogoutMutation();

  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
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
        router.push("/instructor/login");
      },
    });
  };

  const avatarUrl = profile?.avatarUrl ?? null;
  const displayName =
    `${profile?.firstName ?? user?.firstName ?? "Instructor"} ${profile?.lastName ?? ""}`.trim();

  return (
    <header className="w-full h-[72px] bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-10 shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-50"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 text-[#12304E]" />
        </button>
        <div>
          <h1 className="font-serif text-[18px] md:text-[22px] text-[#12304E]">
            Instructor Portal
          </h1>
          <p className="text-[12px] text-[#64748B] hidden sm:block">
            Manage your courses and students
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 md:gap-5">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-[#F8F9FA] rounded-lg px-4 py-2.5 w-[240px]">
          <Search className="w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search courses, students..."
            className="bg-transparent text-[12px] text-[#64748B] outline-none w-full placeholder:text-[#94A3B8]"
          />
        </div>

        {/* Notification */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowDropdown(false);
            }}
            className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Bell className="w-5 h-5 text-[#12304E]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#22A146] rounded-full" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 rounded-xl shadow-lg z-30 overflow-hidden">
              <div className="px-4 py-3 bg-[#FBF9F4] border-b border-gray-100">
                <p className="text-sm font-semibold text-[#12304E]">
                  Notifications
                </p>
              </div>
              <div className="max-h-[320px] overflow-y-auto">
                {[
                  {
                    title: "New student enrolled",
                    desc: "Amina joined Foundations of Prophetic Medicine",
                    time: "2 hours ago",
                  },
                  {
                    title: "Assignment submitted",
                    desc: "Yusuf submitted Anatomy System Assignment",
                    time: "5 hours ago",
                  },
                  {
                    title: "Live class reminder",
                    desc: "Anatomy Q&A Session starts in 1 hour",
                    time: "1 day ago",
                  },
                ].map((notification, i) => (
                  <div
                    key={i}
                    className="px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer"
                  >
                    <p className="text-sm font-semibold text-[#0C1F33]">
                      {notification.title}
                    </p>
                    <p className="text-xs text-[#64748B]">
                      {notification.desc}
                    </p>
                    <p className="text-[10px] text-[#94A3B8] mt-1">
                      {notification.time}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100">
                <button
                  onClick={() => router.push("/instructor/notifications")}
                  className="w-full text-center px-4 py-2.5 text-sm font-semibold text-[#22A146] hover:bg-gray-50"
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => {
              setShowDropdown(!showDropdown);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-50 transition-colors"
          >
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={displayName}
                width={36}
                height={36}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#12304E] text-white flex items-center justify-center text-sm font-semibold">
                {(profile?.firstName ?? user?.firstName ?? "I")
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
              {/* Info */}
              <div className="px-4 py-3 bg-[#FBF9F4] border-b border-gray-100">
                <p className="text-sm font-semibold text-[#12304E]">
                  {displayName}
                </p>
                <p className="text-xs text-[#64748B]">
                  {profile?.email ?? user?.email}
                </p>
                <span className="inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#22A146]/10 text-[#22A146]">
                  INSTRUCTOR
                </span>
              </div>

              <div className="py-2">
                <button
                  onClick={() => {
                    router.push("/instructor/dashboard");
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#12304E] hover:bg-gray-50"
                >
                  <User className="w-4 h-4 text-[#64748B]" />
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    router.push("/instructor/courses");
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#12304E] hover:bg-gray-50"
                >
                  <BookOpen className="w-4 h-4 text-[#64748B]" />
                  My Courses
                </button>
                <button
                  onClick={() => {
                    router.push("/instructor/settings");
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#12304E] hover:bg-gray-50"
                >
                  <Settings className="w-4 h-4 text-[#64748B]" />
                  Settings
                </button>
              </div>

              <div className="border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" />
                  {logoutMutation.isPending ? "Logging out..." : "Log out"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
