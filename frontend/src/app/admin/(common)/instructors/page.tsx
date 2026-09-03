"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Search,
  GraduationCap,
  BookOpen,
  CheckCircle,
  XCircle,
  ExternalLink,
} from "lucide-react";
import {
  useAdminInstructors,
  usePendingApplications,
  useApproveInstructorMutation,
  useRejectInstructorMutation,
} from "@/hooks/use-admin";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminInstructorsPage() {
  const [tab, setTab] = useState<"instructors" | "pending">("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data: instructors, isLoading: instructorsLoading } =
    useAdminInstructors();
  const { data: applications, isLoading: appLoading } =
    usePendingApplications();
  const approveMutation = useApproveInstructorMutation();
  const rejectMutation = useRejectInstructorMutation();

  const filteredInstructors = instructors?.filter(
    (instructor) =>
      `${instructor.firstName} ${instructor.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      instructor.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleApprove = (userId: string) => {
    approveMutation.mutate(userId);
  };

  const handleReject = (userId: string) => {
    if (!rejectReason.trim()) return;
    rejectMutation.mutate(
      { userId, reason: rejectReason },
      {
        onSuccess: () => {
          setRejectTarget(null);
          setRejectReason("");
        },
      },
    );
  };

  return (
    <div className="p-6 md:p-10">
      {/* Header */}
      <div className="mb-6">
        <h1
          className="text-3xl md:text-[36px] text-[#0C1F33]"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          Instructors
        </h1>
        <p className="text-base text-[#64748B]">
          {instructors?.length ?? 0} approved instructors
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-[#E3E8EF] mb-6">
        <button
          onClick={() => setTab("pending")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            tab === "pending"
              ? "border-[#22A146] text-[#22A146]"
              : "border-transparent text-[#64748B] hover:text-[#0C1F33]"
          }`}
        >
          Pending Applications ({applications?.length ?? 0})
        </button>
        <button
          onClick={() => setTab("instructors")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            tab === "instructors"
              ? "border-[#22A146] text-[#22A146]"
              : "border-transparent text-[#64748B] hover:text-[#0C1F33]"
          }`}
        >
          All Instructors
        </button>
      </div>

      {/* Pending Applications */}
      {tab === "pending" && (
        <>
          {appLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 rounded-full border-4 border-[#0D2B45] border-t-transparent animate-spin" />
            </div>
          )}

          {!appLoading && applications?.length === 0 && (
            <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
              <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-[#64748B]">No pending applications.</p>
            </div>
          )}

          {!appLoading && applications && applications.length > 0 && (
            <div className="space-y-4">
              {applications.map((application, index) => {
                const details = application.details ?? {};
                return (
                  <div
                    key={index}
                    className="bg-white rounded-xl border border-[#E3E8EF] p-6"
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      {/* User info */}
                      <div className="flex items-center gap-4">
                        {application.user?.avatarUrl ? (
                          <Image
                            src={application.user.avatarUrl}
                            alt=""
                            width={48}
                            height={48}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-[#F9F6F0] flex items-center justify-center">
                            <span className="text-sm font-bold text-[#B8912F]">
                              {(application.user?.firstName?.[0] ?? "") +
                                (application.user?.lastName?.[0] ?? "")}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-[#0C1F33]">
                            {application.user?.firstName}{" "}
                            {application.user?.lastName}
                          </p>
                          <p className="text-xs text-[#64748B]">
                            {application.user?.email}
                          </p>
                          <p className="text-xs text-[#94A3B8] mt-1">
                            Applied: {formatDate(application.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleApprove(application?.user?.id)}
                          disabled={approveMutation.isPending}
                          className="flex items-center gap-1.5 px-4 py-2 bg-[#22A146] text-white rounded-lg text-sm font-semibold hover:bg-[#1E9040] disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => setRejectTarget(application?.user?.id)}
                          className="flex items-center gap-1.5 px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    </div>

                    {/* Application details */}
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-xs font-bold text-[#64748B] uppercase mb-1">
                          Area of Expertise
                        </p>
                        <p className="text-sm text-[#0C1F33]">
                          {details.areaOfExpertise ?? "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#64748B] uppercase mb-1">
                          CV
                        </p>
                        {details.cvUrl ? (
                          <a
                            href={details.cvUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm font-semibold text-[#2563EB] hover:underline"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            View CV
                          </a>
                        ) : (
                          <p className="text-sm text-[#64748B]">—</p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#64748B] uppercase mb-1">
                          WWCC
                        </p>
                        <p className="text-sm text-[#0C1F33]">
                          {details.wwccNumber ?? "—"} (
                          {details.wwccState ?? "—"})
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#64748B] uppercase mb-1">
                          Bio
                        </p>
                        <p className="text-sm text-[#0C1F33] line-clamp-2">
                          {details.bio ?? "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* All Instructors */}
      {tab === "instructors" && (
        <>
          {/* Search */}
          <div className="flex items-center gap-2 bg-white border border-[#E3E8EF] rounded-lg px-4 py-2.5 mb-6 max-w-[400px]">
            <Search className="w-4 h-4 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search instructors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm outline-none w-full"
            />
          </div>

          {instructorsLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 rounded-full border-4 border-[#0D2B45] border-t-transparent animate-spin" />
            </div>
          )}

          {!instructorsLoading && filteredInstructors?.length === 0 && (
            <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
              <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-[#64748B]">No instructors found.</p>
            </div>
          )}

          {!instructorsLoading &&
            filteredInstructors &&
            filteredInstructors.length > 0 && (
              <div className="space-y-3">
                {filteredInstructors.map((instructor) => (
                  <div
                    key={instructor.id}
                    className="bg-white rounded-xl border border-[#E3E8EF] p-5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      {instructor.avatarUrl ? (
                        <Image
                          src={instructor.avatarUrl}
                          alt=""
                          width={48}
                          height={48}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-[#F9F6F0] flex items-center justify-center">
                          <span className="text-sm font-bold text-[#B8912F]">
                            {(instructor.firstName?.[0] ?? "") +
                              (instructor.lastName?.[0] ?? "")}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-[#0C1F33]">
                          {instructor.firstName} {instructor.lastName}
                        </p>
                        <p className="text-xs text-[#64748B]">
                          {instructor.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-[#64748B]">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {instructor.courseCount} courses
                      </span>
                      <span className="text-xs text-[#94A3B8]">
                        Joined {formatDate(instructor.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </>
      )}

      {/* Reject Modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setRejectTarget(null)}
          />
          <div className="relative bg-white rounded-xl p-6 w-full max-w-[400px] z-10">
            <h3 className="text-lg font-semibold text-[#0C1F33] mb-2">
              Reject Application
            </h3>
            <p className="text-sm text-[#64748B] mb-4">
              Provide a reason for rejection.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Reason..."
              className="w-full px-3 py-2 border border-[#E3E8EF] rounded-lg text-sm mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setRejectTarget(null)}
                className="flex-1 py-2.5 border border-[#E3E8EF] rounded-lg text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(rejectTarget)}
                disabled={!rejectReason.trim() || rejectMutation.isPending}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
