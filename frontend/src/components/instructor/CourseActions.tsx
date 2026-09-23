"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Eye,
  Edit,
  Video,
  Calendar,
  FileText,
  ChevronRight,
  Users,
  HelpCircle,
} from "lucide-react";

type CourseType = "REGULAR" | "ONLINE_CLASS";

interface CourseActionsProps {
  courseId: string | number;
  courseType: CourseType;
}

export function CourseActions({ courseId, courseType }: CourseActionsProps) {
  const pathname = usePathname();

  const basePath = `/instructor/courses/${courseId}`;

  const isActive = (path: string) => pathname === path;

  const editPath = `${basePath}/edit`;
  const materialsPath = `${basePath}/materials`;
  const batchesPath = `${basePath}/batches`;
  const questionsPath = `${basePath}/questions`;
  const examsPath = `${basePath}/exams`;
  const studentsPath = `${basePath}/students`;

  const navItems = [
    {
      label: "Edit",
      href: editPath,
      icon: Edit,
      color: "text-emerald-600",
      activeColor: "text-emerald-700",
      show: true,
    },
    {
      label: "Materials",
      href: materialsPath,
      icon: Video,
      color: "text-blue-600",
      activeColor: "text-blue-700",
      show: courseType === "REGULAR",
    },
    {
      label: "Batches",
      href: batchesPath,
      icon: Calendar,
      color: "text-violet-600",
      activeColor: "text-violet-700",
      show: courseType === "ONLINE_CLASS",
    },
    {
      label: "Questions",
      href: questionsPath,
      icon: HelpCircle,
      color: "text-green-600",
      activeColor: "text-green-700",
      show: true,
    },
    {
      label: "Exams",
      href: examsPath,
      icon: FileText,
      color: "text-orange-600",
      activeColor: "text-orange-700",
      show: true,
    },
    {
      label: "Students",
      href: studentsPath,
      icon: Users,
      color: "text-purple-600",
      activeColor: "text-purple-700",
      show: true,
    },
  ];

  return (
    <div className="w-full mt-2 mb-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Navigation */}
        <nav
          aria-label="Course navigation"
          className="w-full overflow-x-auto sm:w-auto"
        >
          <div className="inline-flex min-w-full sm:min-w-0 items-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            {navItems
              .filter((item) => item.show)
              .map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`
                      group relative flex min-w-fit items-center justify-center
                      gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold
                      transition-all duration-200
                      focus:outline-none focus-visible:ring-2
                      focus-visible:ring-slate-400 focus-visible:ring-offset-1
                      ${
                        active
                          ? `bg-slate-100 ${item.activeColor} shadow-sm`
                          : `text-slate-600 hover:bg-slate-50 ${item.color}`
                      }
                    `}
                  >
                    <Icon
                      className={`
                        h-4 w-4 shrink-0 transition-transform duration-200
                        ${active ? "scale-105" : "group-hover:scale-105"}
                      `}
                    />

                    <span>{item.label}</span>

                    {/* Active indicator */}
                    {active && (
                      <span
                        className="
                          absolute inset-x-3 -bottom-1 h-0.5
                          rounded-full bg-current
                        "
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                );
              })}
          </div>
        </nav>

        {/* View Course */}
        <Link
          href={`/courses/${courseId}`}
          className="
            inline-flex w-full sm:w-auto items-center justify-center gap-2
            rounded-xl border border-[#12304E]/15 bg-[#12304E]/5
            px-4 py-2.5 text-sm font-semibold text-[#12304E]
            transition-all duration-200
            hover:border-[#12304E]/25 hover:bg-[#12304E]/10
            focus:outline-none focus-visible:ring-2
            focus-visible:ring-[#12304E]/30 focus-visible:ring-offset-2
          "
        >
          <Eye className="h-4 w-4" />
          <span>View Course</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
