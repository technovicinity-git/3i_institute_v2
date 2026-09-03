"use client";

import { useState } from "react";
import {
  Users,
  BookOpen,
  FileText,
  CreditCard,
  TrendingUp,
  Award,
} from "lucide-react";
import { ReportContent } from "@/components/admin/report-content";

const REPORT_TYPES = [
  { value: "learner-activity", label: "Learner Activity", icon: Users },
  { value: "course-performance", label: "Course Performance", icon: BookOpen },
  { value: "enrolments", label: "Enrolments", icon: FileText },
  { value: "attendance", label: "Attendance", icon: Award },
  { value: "exams", label: "Exam Results", icon: FileText },
  { value: "revenue", label: "Revenue", icon: CreditCard },
  { value: "instructors", label: "Instructors", icon: TrendingUp },
];

export default function AdminReportsPage() {
  const [selectedReport, setSelectedReport] = useState("learner-activity");
  const [dateRange, setDateRange] = useState("monthly");

  return (
    <div className="p-6 md:p-10">
      <div className="mb-6">
        <h1
          className="text-3xl md:text-[36px] text-[#0C1F33]"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          Reports
        </h1>
        <p className="text-base text-[#64748B]">
          Platform analytics and reports.
        </p>
      </div>

      {/* Report Type Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 mb-6">
        {REPORT_TYPES.map((report) => {
          const Icon = report.icon;
          const isActive = selectedReport === report.value;
          return (
            <button
              key={report.value}
              onClick={() => setSelectedReport(report.value)}
              className={`bg-white rounded-xl border p-4 flex flex-col items-center gap-2 transition-colors ${
                isActive
                  ? "border-[#22A146] bg-green-50/30"
                  : "border-[#E3E8EF] hover:border-gray-300"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isActive ? "bg-[#22A146]" : "bg-[#F9F6F0]"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${isActive ? "text-white" : "text-[#B8912F]"}`}
                />
              </div>
              <span className="text-xs font-semibold text-[#0C1F33] text-center">
                {report.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Date Range */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        {["daily", "weekly", "monthly", "yearly"].map((range) => (
          <button
            key={range}
            onClick={() => setDateRange(range)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
              dateRange === range
                ? "bg-[#12304E] text-white border-[#12304E]"
                : "bg-white text-[#0C1F33] border-[#E3E8EF]"
            }`}
          >
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </button>
        ))}
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-xl border border-[#E3E8EF] p-6">
        <ReportContent type={selectedReport} dateRange={dateRange} />
      </div>
    </div>
  );
}
