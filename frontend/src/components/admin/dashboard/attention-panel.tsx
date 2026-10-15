import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  CreditCard,
  FileWarning,
  GraduationCap,
  MessageSquareWarning,
  ShieldAlert,
} from "lucide-react";
import type { AdminDashboardAttention } from "@/types/admin-dashboard";
import { card } from "./utils";

/** Queues waiting for an admin: approvals, reviews, reports, payments. */
export function AttentionPanel({
  attention,
}: {
  attention: AdminDashboardAttention;
}) {
  const attentionItems = [
    {
      count: attention.pendingInstructorApplications,
      label: "Instructor applications",
      hint: "Awaiting approval",
      icon: GraduationCap,
      href: "/admin/instructors",
    },
    {
      count: attention.pendingCourses,
      label: "Courses to review",
      hint: "Submitted for publishing",
      icon: BookOpen,
      href: "/admin/courses",
    },
    {
      count: attention.pendingWaivers,
      label: "Waiver requests",
      hint: "Awaiting a decision",
      icon: FileWarning,
      href: "/admin/waivers",
    },
    {
      count: attention.pendingSubscriptionRequests,
      label: "Subscription payments",
      hint: "Payments to verify",
      icon: CreditCard,
      href: "/admin/subscription-requests",
    },
    {
      count: attention.openChatReports,
      label: "Reported messages",
      hint: "Chat moderation queue",
      icon: MessageSquareWarning,
      href: "/admin/moderation",
    },
    {
      count: attention.pastDueSubscriptions,
      label: "Past-due subscriptions",
      hint: "Payment failed",
      icon: CreditCard,
      href: "/admin/subscriptions",
    },
    {
      count: attention.overdueGrading,
      label: "Overdue grading",
      hint: "Exam submissions waiting 3+ days",
      icon: ClipboardCheck,
      href: "/admin/exams",
    },
  ];
  const openItems = attentionItems.filter((item) => item.count > 0);

  return (
    <section className={`${card} overflow-hidden`}>
      <div
        className={`flex items-center gap-3 px-5 py-3 border-b ${
          openItems.length
            ? "bg-yellow-50 border-yellow-200"
            : "bg-[#22A146]/5 border-[#E3E8EF]"
        }`}
      >
        {openItems.length ? (
          <ShieldAlert className="w-5 h-5 text-yellow-600" />
        ) : (
          <CheckCircle2 className="w-5 h-5 text-[#22A146]" />
        )}
        <p
          className={`text-sm font-semibold ${openItems.length ? "text-yellow-800" : "text-[#1D8F3D]"}`}
        >
          {openItems.length
            ? `Needs your attention · ${openItems.reduce((sum, i) => sum + i.count, 0)} items`
            : "All clear — nothing waiting for review."}
        </p>
      </div>
      {openItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 divide-y sm:divide-y-0 divide-[#E3E8EF]">
          {openItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="group flex items-center gap-4 px-5 py-4 hover:bg-[#F8FAFC] sm:border-b sm:border-[#F1F5F9]"
              >
                <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-yellow-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0C1F33]">
                    <span className="text-lg mr-1.5">{item.count}</span>
                    {item.label}
                  </p>
                  <p className="text-xs text-[#64748B] truncate">{item.hint}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#0C1F33]" />
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
