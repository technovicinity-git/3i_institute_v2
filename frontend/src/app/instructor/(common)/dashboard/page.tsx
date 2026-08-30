"use client";

import Link from "next/link";
import {
  BookOpen,
  Users,
  Video,
  Award,
  Star,
  TrendingUp,
  Clock,
  FileText,
} from "lucide-react";

const stats = [
  { icon: BookOpen, label: "My Courses", value: "6", color: "bg-[#22A146]" },
  { icon: Users, label: "Total Students", value: "847", color: "bg-[#2563EB]" },
  { icon: Video, label: "Live Classes", value: "3", color: "bg-[#7C3AED]" },
  {
    icon: Award,
    label: "Certificates Issued",
    value: "512",
    color: "bg-[#B8912F]",
  },
];

const recentCourses = [
  {
    title: "Foundations of Prophetic Medicine",
    students: 214,
    rating: 4.9,
    progress: 68,
  },
  {
    title: "Classical Arabic Grammar & Rhetoric",
    students: 156,
    rating: 4.8,
    progress: 45,
  },
  {
    title: "Introduction to Islamic Jurisprudence",
    students: 98,
    rating: 5.0,
    progress: 82,
  },
];

const upcomingClasses = [
  {
    title: "Anatomy Q&A Session",
    date: "Mon, Jan 15",
    time: "2:00 PM",
    students: 32,
  },
  {
    title: "Arabic Morphology Drill",
    date: "Wed, Jan 17",
    time: "10:00 AM",
    students: 28,
  },
  {
    title: "Fiqh Principles Seminar",
    date: "Fri, Jan 19",
    time: "4:00 PM",
    students: 25,
  },
];

export default function InstructorDashboardPage() {
  return (
    <div className="p-6 md:p-10 space-y-8">
      {/* Welcome */}
      <div>
        <h1
          className="text-3xl md:text-[36px] text-[#0C1F33] mb-2"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          Welcome to your Instructor Dashboard
        </h1>
        <p className="text-base text-[#64748B]">
          Here&apos;s an overview of your teaching activity.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl p-5 border border-gray-100 flex items-center gap-4"
            >
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}
              >
                <Icon className="w-6 h-6 text-white" strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0C1F33]">
                  {stat.value}
                </p>
                <p className="text-sm text-[#64748B]">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Courses + Upcoming Classes */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[#0C1F33]">Your Courses</h2>
            <Link
              href="/instructor/courses"
              className="text-sm font-semibold text-[#22A146] hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {recentCourses.map((course) => (
              <div key={course.title} className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg bg-[#F9F6F0] flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-[#B8912F]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0C1F33] truncate">
                    {course.title}
                  </p>
                  <p className="text-xs text-[#64748B]">
                    {course.students} students
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-3.5 h-3.5 text-[#B8912F] fill-[#B8912F]" />
                  <span className="text-[#0C1F33] font-medium">
                    {course.rating}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[#0C1F33]">
              Upcoming Live Classes
            </h2>
            <Link
              href="/instructor/live-classes"
              className="text-sm font-semibold text-[#22A146] hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {upcomingClasses.map((cls) => (
              <div
                key={cls.title}
                className="flex items-center gap-3 pb-4 border-b border-gray-50 last:border-0 last:pb-0"
              >
                <div className="w-10 h-10 rounded-lg bg-[#F9F6F0] flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-[#64748B]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0C1F33] truncate">
                    {cls.title}
                  </p>
                  <p className="text-xs text-[#64748B]">
                    {cls.date} • {cls.time}
                  </p>
                  <p className="text-xs text-[#22A146] font-medium">
                    {cls.students} students enrolled
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-[#0C1F33] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/instructor/courses/create"
            className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow"
          >
            <TrendingUp className="w-5 h-5 text-[#22A146] mb-3" />
            <p className="text-sm font-semibold text-[#0C1F33]">
              Create New Course
            </p>
          </Link>
          <Link
            href="/instructor/exams/create"
            className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow"
          >
            <FileText className="w-5 h-5 text-[#2563EB] mb-3" />
            <p className="text-sm font-semibold text-[#0C1F33]">Create Exam</p>
          </Link>
          <Link
            href="/instructor/live-classes/schedule"
            className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow"
          >
            <Video className="w-5 h-5 text-[#7C3AED] mb-3" />
            <p className="text-sm font-semibold text-[#0C1F33]">
              Schedule Live Class
            </p>
          </Link>
          <Link
            href="/instructor/students"
            className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow"
          >
            <Users className="w-5 h-5 text-[#B8912F] mb-3" />
            <p className="text-sm font-semibold text-[#0C1F33]">
              View Students
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
