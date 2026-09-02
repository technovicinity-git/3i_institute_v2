"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Video,
  Calendar,
  Clock,
  Users,
  Plus,
  ExternalLink,
} from "lucide-react";
import { useInstructorCourses } from "@/hooks/use-instructor-courses";
import { useCourseBatches } from "@/hooks/use-batches";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
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

export default function InstructorLiveClassesPage() {
  const { data: courses } = useInstructorCourses();
  const [selectedCourse, setSelectedCourse] = useState<string>("");

  // Get batches for selected course
  const { data: batches } = useCourseBatches(selectedCourse);

  // Collect all upcoming sessions
  const allSessions =
    batches?.flatMap((batch) =>
      batch.sessions
        .filter((session) => new Date(session.scheduledAt) > new Date())
        .map((session) => ({
          ...session,
          batchName: batch.name,
          batchId: batch.id,
        })),
    ) ?? [];

  return (
    <div className="p-6 md:p-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1
            className="text-3xl md:text-[36px] text-[#0C1F33]"
            style={{ fontFamily: "'Marcellus', serif" }}
          >
            Live Classes
          </h1>
          <p className="text-base text-[#64748B]">
            {allSessions.length} upcoming sessions
          </p>
        </div>
      </div>

      {/* Course filter */}
      <div className="mb-6">
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="px-4 py-2.5 bg-white border border-[#E3E8EF] rounded-lg text-sm min-w-[250px]"
        >
          <option value="">Select a course to view sessions</option>
          {courses?.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
      </div>

      {/* Sessions list */}
      {!selectedCourse ? (
        <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
          <Video className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-[#64748B]">
            Select a course to see its live classes.
          </p>
        </div>
      ) : allSessions.length === 0 ? (
        <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
          <Video className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-[#64748B]">
            No upcoming sessions for this course.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {allSessions.map((session) => (
            <div
              key={session.id}
              className="bg-white rounded-xl border border-[#E3E8EF] p-5 flex items-center justify-between flex-wrap gap-4"
            >
              <div className="flex items-center gap-4">
                {/* Date box */}
                <div className="w-14 h-14 rounded-lg bg-[#F9F6F0] flex flex-col items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-[#B8912F] mb-1" />
                  <span className="text-[10px] font-bold text-[#64748B] uppercase">
                    {formatDate(session.scheduledAt)}
                  </span>
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#0C1F33]">
                    {session.title}
                  </p>
                  <p className="text-xs text-[#64748B] mt-1">
                    {session.batchName} • {formatTime(session.scheduledAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-sm text-[#64748B]">
                  <Clock className="w-4 h-4" />
                  {session.durationMinutes} min
                </span>

                {session.meetingLink ? (
                  <a
                    href={session.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-[#22A146] text-white rounded-lg text-sm font-semibold hover:bg-[#1E9040]"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Join Class
                  </a>
                ) : (
                  <span className="text-xs font-semibold text-yellow-600">
                    No meeting link yet
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
