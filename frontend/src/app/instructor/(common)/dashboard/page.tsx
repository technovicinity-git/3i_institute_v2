"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Users,
  Video,
  Award,
  Star,
  TrendingUp,
  Clock,
  FileText,
  UserPlus,
  AlertCircle,
  ExternalLink,
  ClipboardList,
} from "lucide-react";
import { useInstructorDashboard } from "@/hooks/use-instructor-dashboard";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours} hour(s) ago`;
  if (diffDays < 7) return `${diffDays} day(s) ago`;
  return formatDate(dateStr);
}

export default function InstructorDashboardPage() {
  const { data, isLoading, isError } = useInstructorDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600">Failed to load dashboard</p>
      </div>
    );
  }

  const stats = [
    {
      icon: BookOpen,
      label: "My Courses",
      value: String(data.stats.totalCourses),
      color: "bg-[#22A146]",
    },
    {
      icon: Users,
      label: "Total Students",
      value: String(data.stats.totalStudents),
      color: "bg-[#2563EB]",
    },
    {
      icon: Video,
      label: "Upcoming Sessions",
      value: String(data.stats.upcomingSessions),
      color: "bg-[#7C3AED]",
    },
    {
      icon: Award,
      label: "Certificates",
      value: String(data.stats.totalCertificates),
      color: "bg-[#B8912F]",
    },
  ];

  return (
    <div className="p-6 md:p-10 space-y-8">
      {/* Welcome */}
      <div>
        <h1
          className="text-3xl md:text-[36px] text-[#0C1F33] mb-2"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          Instructor Dashboard
        </h1>
        <p className="text-base text-[#64748B]">
          Overview of your courses and students.
        </p>
      </div>

      {/* Pending grading alert */}
      {data.stats.pendingGrading > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0" />
          <p className="text-sm text-yellow-800">
            You have <strong>{data.stats.pendingGrading}</strong> exam
            attempt(s) waiting for grading.
          </p>
        </div>
      )}

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
        {/* Courses */}
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
          {data.recentCourses.length === 0 ? (
            <p className="text-sm text-[#64748B]">No courses yet.</p>
          ) : (
            <div className="space-y-4">
              {data.recentCourses.map((course) => (
                <div key={course.id} className="flex items-center gap-4">
                  {course.thumbnailUrl ? (
                    <Image
                      src={course.thumbnailUrl}
                      alt={course.title}
                      width={56}
                      height={56}
                      className="rounded-lg object-cover w-14 h-14"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-[#F9F6F0] flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-[#B8912F]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0C1F33] truncate">
                      {course.title}
                    </p>
                    <p className="text-xs text-[#64748B]">
                      {course.enrolmentCount} students
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-sm shrink-0">
                    <Star className="w-3.5 h-3.5 text-[#B8912F] fill-[#B8912F]" />
                    <span className="text-[#0C1F33] font-medium">
                      {course.averageRating ?? "New"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Classes */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[#0C1F33]">
              Upcoming Classes
            </h2>
            <Link
              href="/instructor/live-classes"
              className="text-sm font-semibold text-[#22A146] hover:underline"
            >
              View all
            </Link>
          </div>
          {data.upcomingClasses.length === 0 ? (
            <p className="text-sm text-[#64748B]">No upcoming sessions.</p>
          ) : (
            <div className="space-y-4">
              {data.upcomingClasses.map((cls) => (
                <div
                  key={cls.sessionId}
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
                      {formatDate(cls.scheduledAt)} •{" "}
                      {formatTime(cls.scheduledAt)}
                    </p>
                  </div>
                  {cls.meetingLink && (
                    <a
                      href={cls.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:bg-gray-50"
                    >
                      <ExternalLink className="w-4 h-4 text-[#22A146]" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Enrolments */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-[#0C1F33]">
            Recent Enrolments
          </h2>
          <Link
            href="/instructor/students"
            className="text-sm font-semibold text-[#22A146] hover:underline"
          >
            View all students
          </Link>
        </div>
        {data.recentEnrolments.length === 0 ? (
          <p className="text-sm text-[#64748B]">No enrolments yet.</p>
        ) : (
          <div className="space-y-3">
            {data.recentEnrolments.map((enrolment) => (
              <div key={enrolment.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#F9F6F0] flex items-center justify-center shrink-0">
                  <UserPlus className="w-4 h-4 text-[#B8912F]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0C1F33]">
                    {enrolment.learnerName}
                  </p>
                  <p className="text-xs text-[#64748B]">
                    Enrolled in {enrolment.courseTitle}
                  </p>
                </div>
                <span className="text-xs text-[#64748B] shrink-0">
                  {timeAgo(enrolment.enrolledAt)}
                </span>
              </div>
            ))}
          </div>
        )}
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
            href="/instructor/questions/create"
            className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow"
          >
            <FileText className="w-5 h-5 text-[#2563EB] mb-3" />
            <p className="text-sm font-semibold text-[#0C1F33]">
              Create Question
            </p>
          </Link>
          <Link
            href="/instructor/assignments/create"
            className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow"
          >
            <ClipboardList className="w-5 h-5 text-[#7C3AED] mb-3" />
            <p className="text-sm font-semibold text-[#0C1F33]">
              Create Assignment
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
