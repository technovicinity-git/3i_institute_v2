"use client";

import Image from "next/image";
import { Search, Menu } from "lucide-react";
import { useProfileStore } from "@/stores/profile-store";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";

interface DashboardNavbarProps {
  onMenuClick: () => void;
  profileName: string;
}

export default function DashboardNavbar({
  onMenuClick,
  profileName,
}: DashboardNavbarProps) {
  const router = useRouter();
  const t = useTranslations("dashboard");
  const tNav = useTranslations("nav");
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
          aria-label={tNav("openMenu")}
        >
          <Menu className="w-5 h-5 text-[#12304E]" />
        </button>
        <div>
          <h1 className="font-serif text-[18px] md:text-[22px] text-[#12304E]">
            {t("greeting", { name: profileName })}
          </h1>
          <p className="text-[12px] text-[#64748B] hidden sm:block">
            {t("welcomeBack")}
          </p>
        </div>
      </div>

      {/* Right - Search, Notification, Avatar */}
      <div className="flex items-center gap-3 md:gap-5">

        <LanguageSwitcher />

        {/* Notification */}
        <NotificationBell
          learnerProfileId={activeProfile?.id}
          viewAllHref="/notifications"
          onOpenChange={(open) => open && setShowDropdown(false)}
        />

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
            <div className="absolute end-0 mt-2 w-56 bg-white border border-gray-100 rounded-lg shadow-lg z-30">
              <div className="p-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-[#12304E]">
                  {activeProfile?.displayName}
                </p>
                <p className="text-xs text-[#64748B]">
                  {activeProfile?.isActive
                    ? tNav("subscribed")
                    : tNav("notSubscribed")}
                </p>
              </div>
              <div className="py-2">
                <button
                  onClick={() => {
                    router.push("/profiles");
                    setShowDropdown(false);
                  }}
                  className="w-full text-start px-4 py-2 text-sm text-[#12304E] hover:bg-gray-50"
                >
                  {tNav("switchProfile")}
                </button>
                <button
                  onClick={() => {
                    router.push("/account-settings");
                    setShowDropdown(false);
                  }}
                  className="w-full text-start px-4 py-2 text-sm text-[#12304E] hover:bg-gray-50"
                >
                  {tNav("settings")}
                </button>
                <button
                  onClick={() => {
                    router.push("/subscription");
                    setShowDropdown(false);
                  }}
                  className="w-full text-start px-4 py-2 text-sm text-[#12304E] hover:bg-gray-50"
                >
                  {tNav("subscription")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
