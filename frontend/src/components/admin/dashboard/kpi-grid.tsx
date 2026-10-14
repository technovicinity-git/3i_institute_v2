import Link from "next/link";
import { Award, BookOpen, CreditCard, UserPlus, Users } from "lucide-react";
import type { AdminDashboardKpis } from "@/types/admin-dashboard";
import { Change, card } from "./utils";

export function KpiGrid({ kpis }: { kpis: AdminDashboardKpis }) {
  const kpiCards = [
    {
      icon: Users,
      label: "Accounts",
      value: kpis.accounts.total,
      detail: `${kpis.learnerProfiles} learner profiles`,
      change: (
        <Change
          current={kpis.accounts.last30Days}
          previous={kpis.accounts.previous30Days}
        />
      ),
      color: "bg-[#2563EB]",
      href: "/admin/users",
    },
    {
      icon: UserPlus,
      label: "Enrolments",
      value: kpis.enrolments.total,
      detail: `+${kpis.enrolments.last30Days} in last 30 days`,
      change: (
        <Change
          current={kpis.enrolments.last30Days}
          previous={kpis.enrolments.previous30Days}
        />
      ),
      color: "bg-[#22A146]",
      href: "/admin/reports",
    },
    {
      icon: CreditCard,
      label: "Active subscriptions",
      value: kpis.subscriptions.active,
      detail: `${kpis.subscriptions.activeSeats} seats`,
      change: (
        <span className="text-xs font-semibold text-[#0C1F33]">
          ${kpis.subscriptions.estimatedMonthlyRevenue.toFixed(2)}
          <span className="font-normal text-[#64748B]"> est. / month</span>
        </span>
      ),
      color: "bg-[#EA580C]",
      href: "/admin/subscriptions",
    },
    {
      icon: BookOpen,
      label: "Published courses",
      value: kpis.courses.published,
      detail: `${kpis.courses.total} total incl. drafts`,
      change: (
        <span className="text-xs text-[#64748B]">
          {kpis.activeInstructors} active instructors
        </span>
      ),
      color: "bg-[#7C3AED]",
      href: "/admin/courses",
    },
    {
      icon: Award,
      label: "Certificates issued",
      value: kpis.certificates.total,
      detail: `+${kpis.certificates.last30Days} in last 30 days`,
      change: null,
      color: "bg-[#B8912F]",
      href: "/admin/certificates",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
      {kpiCards.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Link
            key={kpi.label}
            href={kpi.href}
            className={`${card} p-5 flex flex-col gap-3 hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${kpi.color}`}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#0C1F33]">
                {kpi.value.toLocaleString()}
              </p>
              <p className="text-sm text-[#0C1F33]">{kpi.label}</p>
              <p className="text-xs text-[#64748B] mt-0.5">{kpi.detail}</p>
            </div>
            {kpi.change && <div className="mt-auto">{kpi.change}</div>}
          </Link>
        );
      })}
    </div>
  );
}
