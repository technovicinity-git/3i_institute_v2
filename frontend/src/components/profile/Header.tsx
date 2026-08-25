"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LandingLogo } from "@/components/landing/logo";
import { useLogoutMutation } from "@/hooks/use-auth-mutations";
import { useAuthStore } from "@/stores/auth-store";
import { useProfileStore } from "@/stores/profile-store";

function UserIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9 9C10.6569 9 12 7.65685 12 6C12 4.34315 10.6569 3 9 3C7.34315 3 6 4.34315 6 6C6 7.65685 7.34315 9 9 9Z"
        stroke="#0C1F33"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 15C15 12.7909 12.3137 11 9 11C5.68629 11 3 12.7909 3 15"
        stroke="#0C1F33"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z"
        stroke="#0C1F33"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 8C13 7.72 12.98 7.44 12.94 7.18L14.44 6.00L13.44 4.27L11.64 4.82C11.24 4.46 10.78 4.18 10.28 3.98L10 2H8L7.72 3.98C7.22 4.18 6.76 4.46 6.36 4.82L4.56 4.27L3.56 6.00L5.06 7.18C5.02 7.44 5 7.72 5 8C5 8.28 5.02 8.56 5.06 8.82L3.56 10.00L4.56 11.73L6.36 11.18C6.76 11.54 7.22 11.82 7.72 12.02L8 14H10L10.28 12.02C10.78 11.82 11.24 11.54 11.64 11.18L13.44 11.73L14.44 10.00L12.94 8.82C12.98 8.56 13 8.28 13 8Z"
        stroke="#0C1F33"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LogOutIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H6"
        stroke="#475569"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.6667 11.3333L14 8L10.6667 4.66667"
        stroke="#475569"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 8H6"
        stroke="#475569"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ---- Dropdown Menu ----

interface DropdownMenuProps {
  onManageAccount?: () => void;
  onLogOut?: () => void;
  isLoggingOut?: boolean;
}

function DropdownMenu({
  onManageAccount,
  onLogOut,
  isLoggingOut,
}: DropdownMenuProps) {
  return (
    <div className="absolute right-0 top-full mt-2 w-[200px] rounded-lg border border-[#E3E8EF] bg-white shadow-lg z-50 overflow-hidden">
      <button
        onClick={onManageAccount}
        className="flex w-full items-center gap-3 px-4 py-3.5 bg-[#FBF9F4] hover:bg-[#F5F2EB] transition-colors"
      >
        <SettingsIcon />
        <span className="text-[15px] text-[#0C1F33] font-normal">
          Manage account
        </span>
      </button>
      <div className="h-px bg-[#E3E8EF]" />
      <button
        onClick={onLogOut}
        disabled={isLoggingOut}
        className="flex w-full items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        <LogOutIcon />
        <span className="text-[15px] text-[#475569] font-normal">
          {isLoggingOut ? "Logging out..." : "Log out"}
        </span>
      </button>
    </div>
  );
}

// ---- Header ----

export default function Header() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const logoutMutation = useLogoutMutation();
  const { setActiveProfile } = useProfileStore();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleLogout = () => {
    setIsOpen(false);

    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        // Clear active profile from Zustand + localStorage
        setActiveProfile(null);
        localStorage.removeItem("activeProfile");

        toast.success("Logged out successfully");
        router.push("/login");
      },
      onError: () => {
        // Even if API fails, clear local state
        setActiveProfile(null);
        localStorage.removeItem("activeProfile");
        router.push("/login");
      },
    });
  };

  const handleManageAccount = () => {
    setIsOpen(false);
    router.push("/account-settings");
  };

  return (
    <header className="flex items-center justify-between w-full h-[60px] sm:h-[73px] px-4 sm:px-8 md:px-[60px] bg-white border-b border-[#E3E8EF] shrink-0">
      {/* Logo */}
      <button
        onClick={() => router.push("/dashboard")}
        className="hover:opacity-80 transition-opacity"
      >
        <LandingLogo asLink={false} size="sm" textColor="dark" />
      </button>

      {/* User trigger + dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center justify-center w-10 h-9 sm:h-10 rounded-full border border-[#E3E8EF] bg-white hover:bg-gray-50 transition-colors"
          aria-label="User menu"
          aria-expanded={isOpen}
        >
          <UserIcon />
        </button>

        {isOpen && (
          <DropdownMenu
            onManageAccount={handleManageAccount}
            onLogOut={handleLogout}
            isLoggingOut={logoutMutation.isPending}
          />
        )}
      </div>
    </header>
  );
}
