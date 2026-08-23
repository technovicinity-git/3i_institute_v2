"use client";

import Image from "next/image";
import { Search, Bell, Menu } from "lucide-react";
import { useProfileStore } from "@/stores/profile-store";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

interface DashboardNavbarProps {
  onMenuClick: () => void;
  profileName: string;
}

export default function DashboardNavbar({
  onMenuClick,
  profileName,
}: DashboardNavbarProps) {
  const router = useRouter();
  const { activeProfile } = useProfileStore();
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

  return (
    <header className="w-full h-[72px] bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-10 shrink-0">
      {/* Left - Mobile menu + Greeting */}
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
            Assalamu alaikum, {profileName}
          </h1>
          <p className="text-[12px] text-[#64748B] hidden sm:block">
            Welcome back to your dashboard
          </p>
        </div>
      </div>

      {/* Right - Search, Notification, Avatar */}
      <div className="flex items-center gap-3 md:gap-5">
        {/* Search - hidden on small screens */}
        <div className="hidden md:flex items-center gap-2 bg-[#F8F9FA] rounded-lg px-4 py-2.5 w-[240px]">
          <Search className="w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search courses, modules..."
            className="bg-transparent text-[12px] text-[#64748B] outline-none w-full placeholder:text-[#94A3B8]"
          />
        </div>

        {/* Notification */}
        <button className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors">
          <Bell className="w-5 h-5 text-[#12304E]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#22A146] rounded-full" />
        </button>

        {/* Avatar with dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setShowDropdown(!showDropdown)}>
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
                {(activeProfile?.displayName ?? "U").slice(0, 2).toUpperCase()}
              </div>
            )}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-lg shadow-lg z-30">
              <div className="p-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-[#12304E]">
                  {activeProfile?.displayName}
                </p>
                <p className="text-xs text-[#64748B]">
                  {activeProfile?.isActive ? "Active" : "No seat"}
                </p>
              </div>
              <div className="py-2">
                <button
                  onClick={() => {
                    router.push("/profiles");
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-[#12304E] hover:bg-gray-50"
                >
                  Switch Profile
                </button>
                <button
                  onClick={() => {
                    router.push("/settings");
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-[#12304E] hover:bg-gray-50"
                >
                  Settings
                </button>
                <button
                  onClick={() => {
                    router.push("/seats");
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-[#12304E] hover:bg-gray-50"
                >
                  Manage Seats
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
