/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard,
  BookOpen,
  Video,
  ClipboardList,
  FileText,
  Award,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useLogoutMutation } from "@/hooks/use-auth-mutations";
import { useProfileStore } from "@/stores/profile-store";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/instructor/dashboard" },
  { label: "My Courses", icon: BookOpen, href: "/instructor/courses" },
  { label: "Live Classes", icon: Video, href: "/instructor/live-classes" },
  {
    label: "Assignments",
    icon: ClipboardList,
    href: "/instructor/assignments",
  },
  { label: "Exams", icon: FileText, href: "/instructor/exams" },
  { label: "Certificates", icon: Award, href: "/instructor/certificates" },
  { label: "Students", icon: Users, href: "/instructor/students" },
  { label: "Settings", icon: Settings, href: "/instructor/settings" },
];

export default function InstructorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { setActiveProfile } = useProfileStore();
  const logoutMutation = useLogoutMutation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setActiveProfile(null);
        localStorage.removeItem("activeProfile");
        router.push("/instructor/login");
      },
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#FBF9F4]">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block shrink-0">
        <InstructorSidebar user={user} onLogout={handleLogout} />
      </div>

      {/* Sidebar - Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0">
            <InstructorSidebar
              user={user}
              onLogout={handleLogout}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="w-full h-[72px] bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-10 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-50"
            >
              <Menu className="w-5 h-5 text-[#12304E]" />
            </button>
            <div>
              <h1 className="font-serif text-[18px] md:text-[22px] text-[#12304E]">
                Instructor Dashboard
              </h1>
              <p className="text-[12px] text-[#64748B] hidden sm:block">
                Manage your courses and students
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user?.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.firstName}
                width={36}
                height={36}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#12304E] text-white flex items-center justify-center text-sm font-semibold">
                {(user?.firstName ?? "I").slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

function InstructorSidebar({
  user,
  onLogout,
  onClose,
}: {
  user: any;
  onLogout: () => void;
  onClose?: () => void;
}) {
  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "";

  return (
    <aside className="w-[260px] h-full bg-[#12304E] p-6 flex flex-col">
      {/* Logo */}
      <div className="flex items-center justify-between mb-10 shrink-0">
        <div className="flex items-center gap-2.5">
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
        </div>
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

      {/* User info + logout */}
      <div className="border-t border-white/10 pt-4 shrink-0">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-semibold">
            {(user?.firstName ?? "I").slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-white/60 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-white/70 hover:bg-white/[0.05] hover:text-white transition-colors text-[14px]"
        >
          <LogOut className="w-[18px] h-[18px]" strokeWidth={1.8} />
          Log out
        </button>
      </div>
    </aside>
  );
}
