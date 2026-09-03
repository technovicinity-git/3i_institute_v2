"use client";

import {
  Users,
  GraduationCap,
  BookOpen,
  Award,
  CreditCard,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

const stats = [
  { icon: Users, label: "Total Users", value: "1,247", color: "bg-[#2563EB]" },
  {
    icon: GraduationCap,
    label: "Instructors",
    value: "38",
    color: "bg-[#7C3AED]",
  },
  { icon: BookOpen, label: "Courses", value: "140", color: "bg-[#22A146]" },
  { icon: Award, label: "Certificates", value: "512", color: "bg-[#B8912F]" },
  {
    icon: CreditCard,
    label: "Active Subscriptions",
    value: "189",
    color: "bg-[#EA580C]",
  },
  {
    icon: AlertTriangle,
    label: "Pending Reviews",
    value: "7",
    color: "bg-red-500",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="p-6 md:p-10 space-y-8">
      <div>
        <h1
          className="text-3xl md:text-[36px] text-[#0C1F33]"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          Admin Dashboard
        </h1>
        <p className="text-base text-[#64748B]">
          Platform overview and management.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl p-5 border border-gray-100 flex flex-col gap-3"
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0C1F33]">
                  {stat.value}
                </p>
                <p className="text-xs text-[#64748B]">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Placeholder sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-[#0C1F33] mb-4">
            Recent Activity
          </h2>
          <p className="text-sm text-[#64748B]">
            Activity feed will be integrated with API.
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-[#0C1F33] mb-4">
            Pending Approvals
          </h2>
          <p className="text-sm text-[#64748B]">
            Approval queue will be integrated with API.
          </p>
        </div>
      </div>
    </div>
  );
}
