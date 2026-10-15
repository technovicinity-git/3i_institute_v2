"use client";

import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  BookOpen,
  Video,
  ClipboardList,
  FileText,
  Award,
  Heart,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

const navItems = [
  { key: "dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { key: "regularCourses", icon: BookOpen, href: "/my-courses" },
  { key: "onlineClasses", icon: Video, href: "/online-classes" },
  { key: "assignments", icon: ClipboardList, href: "/assignments" },
  { key: "exams", icon: FileText, href: "/exams" },
  { key: "certificates", icon: Award, href: "/certificates" },
  // { key: "notes", icon: StickyNote, href: "/notes" },
  { key: "wishlist", icon: Heart, href: "/wishlist" },
] as const;

interface SidebarProps {
  onNavigate?: () => void;
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const t = useTranslations("sidebar");

  return (
    <aside className="w-[260px] h-full bg-[#12304E] p-6 flex flex-col">
      {/* Logo */}
      <div className="flex items-center justify-between mb-10 shrink-0">
        <Link href="/courses" className="flex items-center gap-2.5">
          <Image
            src="/assets/images/landing_page/logo-icon.png"
            alt="3i Institute"
            width={36}
            height={36}
            className="rounded-full"
          />
          <span className="text-white text-[14px] font-bold tracking-wide">
            3i INSTITUTE
          </span>
        </Link>
        {onNavigate && (
          <button
            onClick={onNavigate}
            aria-label={t("close")}
            className="lg:hidden text-white/70 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation - scrollable if needed */}
      <nav className="flex flex-col gap-1 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[14px] transition-colors shrink-0 ${
                isActive
                  ? "bg-white/[0.08] text-white font-semibold"
                  : "text-white/70 hover:bg-white/[0.05] hover:text-white font-medium"
              }`}
            >
              <Icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
              {t(item.key)}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
