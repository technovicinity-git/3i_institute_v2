"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import {
  Users,
  GraduationCap,
  BookOpen,
  Award,
  CreditCard,
  AlertTriangle,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const [
        users,
        instructors,
        courses,
        subscriptions,
        pendingCourses,
        pendingWaivers,
      ] = await Promise.all([
        apiClient.get("/admin/users?limit=1"),
        apiClient.get("/admin/instructors"),
        apiClient.get("/admin/courses?limit=1"),
        apiClient.get("/admin/subscriptions?limit=1"),
        apiClient.get("/admin/courses/pending"),
        apiClient.get("/admin/waivers/pending"),
      ]);

      return {
        totalUsers: users.data.data.total,
        totalInstructors:
          instructors.data.data.total ??
          instructors.data.data.instructors?.length ??
          0,
        totalCourses: courses.data.data.total,
        activeSubscriptions: subscriptions.data.data.total,
        pendingCourses: pendingCourses.data.data.length,
        pendingWaivers: pendingWaivers.data.data.length,
      };
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 rounded-full border-4 border-[#0D2B45] border-t-transparent animate-spin" />
      </div>
    );
  }

  const statsCards = [
    {
      icon: Users,
      label: "Total Users",
      value: String(stats?.totalUsers ?? 0),
      color: "bg-[#2563EB]",
    },
    {
      icon: GraduationCap,
      label: "Instructors",
      value: String(stats?.totalInstructors ?? 0),
      color: "bg-[#7C3AED]",
    },
    {
      icon: BookOpen,
      label: "Courses",
      value: String(stats?.totalCourses ?? 0),
      color: "bg-[#22A146]",
    },
    {
      icon: CreditCard,
      label: "Active Subscriptions",
      value: String(stats?.activeSubscriptions ?? 0),
      color: "bg-[#EA580C]",
    },
    {
      icon: BookOpen,
      label: "Pending Courses",
      value: String(stats?.pendingCourses ?? 0),
      color: "bg-yellow-500",
    },
    {
      icon: AlertTriangle,
      label: "Pending Waivers",
      value: String(stats?.pendingWaivers ?? 0),
      color: "bg-red-500",
    },
  ];

  return (
    <div className="p-6 md:p-10 space-y-8">
      <div>
        <h1
          className="text-3xl md:text-[36px] text-[#0C1F33]"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          Admin Dashboard
        </h1>
        <p className="text-base text-[#64748B]">Platform overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statsCards.map((stat) => {
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
    </div>
  );
}
