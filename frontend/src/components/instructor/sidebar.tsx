"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Video,
  ClipboardList,
  FileText,
  Award,
  Users,
  Settings,
  X,
  Bell,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/instructor/dashboard" },
  { label: "My Courses", icon: BookOpen, href: "/instructor/courses" },
  { label: "Live Classes", icon: Video, href: "/instructor/live-classes" },
  {
    label: "Assignments",
    icon: ClipboardList,
    href: "/instructor/assignments",
  },
  { label: "Questions", icon: ClipboardList, href: "/instructor/questions" },
  { label: "Exams", icon: FileText, href: "/instructor/exams" },
  { label: "Certificates", icon: Award, href: "/instructor/certificates" },
  { label: "Students", icon: Users, href: "/instructor/students" },
  { label: "Notifications", icon: Bell, href: "/instructor/notifications" },
  { label: "Settings", icon: Settings, href: "/instructor/settings" },
];

interface InstructorSidebarProps {
  onClose?: () => void;
}

export default function InstructorSidebar({ onClose }: InstructorSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-[260px] h-full bg-[#12304E] p-6 flex flex-col shrink-0">
      {/* Logo */}
      <div className="flex items-center justify-between mb-10 shrink-0">
        <Link
          href="/instructor/dashboard"
          className="flex items-center gap-2.5"
        >
          <Image
            src="/logo-icon.png"
            alt="3i Institute"
            width={36}
            height={36}
            className="rounded-full"
          />
          <span className="text-white text-[14px] font-bold tracking-wide">
            INSTRUCTOR
          </span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden text-white/70 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[14px] transition-colors shrink-0 ${
                isActive
                  ? "bg-white/[0.08] text-white font-semibold"
                  : "text-white/70 hover:bg-white/[0.05] hover:text-white font-medium"
              }`}
            >
              <Icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
