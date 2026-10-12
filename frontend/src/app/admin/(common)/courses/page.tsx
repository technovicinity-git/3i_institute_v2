"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  CheckCircle,
  XCircle,
  Ban,
  PlayCircle,
  Eye,
  Settings2,
} from "lucide-react";
import {
  useApproveCourseMutation,
  useRejectCourseMutation,
  useAdminAllCourses,
  useSuspendCourseMutation,
  useActivateCourseMutation,
} from "@/hooks/use-admin";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { ReasonDialog } from "@/components/ui/reason-dialog";
import { Pagination } from "@/components/ui/pagination";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusBadge(status: string) {
  const statusMap: Record<string, { label: string; className: string }> = {
    DRAFT: { label: "DRAFT", className: "bg-gray-100 text-gray-600" },
    PENDING_REVIEW: {
      label: "PENDING",
      className: "bg-yellow-50 text-yellow-700",
    },
    PUBLISHED: {
      label: "PUBLISHED",
      className: "bg-[#22A146]/10 text-[#22A146]",
    },
    SUSPENDED: { label: "SUSPENDED", className: "bg-red-50 text-red-600" },
    ARCHIVED: { label: "ARCHIVED", className: "bg-gray-100 text-gray-500" },
  };
  return (
    statusMap[status] ?? {
      label: status,
      className: "bg-gray-100 text-gray-600",
    }
  );
}

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "PENDING_REVIEW", label: "Pending" },
  { value: "PUBLISHED", label: "Published" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "DRAFT", label: "Draft" },
];

export default function AdminCoursesPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<string>("PENDING_REVIEW");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAdminAllCourses(page, tab || undefined);
  const approveMutation = useApproveCourseMutation();
  const rejectMutation = useRejectCourseMutation();
  const suspendMutation = useSuspendCourseMutation();
  const activateMutation = useActivateCourseMutation();

  const confirm = useConfirm();
  const [rejectCourse, setRejectCourse] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const refreshCourses = () =>
    queryClient.invalidateQueries({ queryKey: ["admin-all-courses"] });

  const handleApprove = (course: { id: string; title: string }) =>
    confirm({
      tone: "success",
      title: "Approve this course?",
      description: (
        <>
          <strong>{course.title}</strong> will be published and visible to
          learners in the course catalogue.
        </>
      ),
      confirmLabel: "Approve",
      onConfirm: () =>
        approveMutation.mutateAsync(course.id, { onSuccess: refreshCourses }),
    });

  const handleSuspend = (course: { id: string; title: string }) =>
    confirm({
      tone: "warning",
      title: "Suspend this course?",
      description: (
        <>
          <strong>{course.title}</strong> will be hidden from the catalogue
          and new learners won&apos;t be able to enrol until you activate it
          again.
        </>
      ),
      confirmLabel: "Suspend",
      onConfirm: () =>
        suspendMutation.mutateAsync(course.id, { onSuccess: refreshCourses }),
    });

  const handleActivate = (course: { id: string; title: string }) =>
    confirm({
      tone: "success",
      title: "Activate this course?",
      description: (
        <>
          <strong>{course.title}</strong> will be published again and visible
          to learners.
        </>
      ),
      confirmLabel: "Activate",
      onConfirm: () =>
        activateMutation.mutateAsync(course.id, { onSuccess: refreshCourses }),
    });

  return (
    <div className="p-6 md:p-10">
      <div className="mb-6">
        <h1
          className="text-3xl md:text-[36px] text-[#0C1F33]"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          Courses
        </h1>
        <p className="text-base text-[#64748B]">
          {data?.total ?? 0} total courses
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-[#E3E8EF] mb-6 overflow-x-auto">
        {STATUS_TABS.map((statusTab) => (
          <button
            key={statusTab.value}
            onClick={() => {
              setTab(statusTab.value);
              setPage(1);
            }}
            className={`pb-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
              tab === statusTab.value
                ? "border-[#22A146] text-[#22A146]"
                : "border-transparent text-[#64748B] hover:text-[#0C1F33]"
            }`}
          >
            {statusTab.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-[#0D2B45] border-t-transparent animate-spin" />
        </div>
      )}

      {!isLoading && data?.courses.length === 0 && (
        <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-[#64748B]">No courses found.</p>
        </div>
      )}

      {!isLoading && data && data.courses.length > 0 && (
        <div className="space-y-4">
          {data.courses.map((course) => {
            const status = getStatusBadge(course.status);
            return (
              <div
                key={course.id}
                className="bg-white rounded-xl border border-[#E3E8EF] p-5"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-20 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {course.thumbnailUrl ? (
                        <Image
                          src={course.thumbnailUrl}
                          alt={course.title}
                          width={80}
                          height={56}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-sm font-semibold text-[#0C1F33]">
                          {course.title}
                        </h2>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B] mt-1">
                        {course.instructor.name} •{" "}
                        {course.category?.name ?? "Uncategorized"} •{" "}
                        {course.level}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-[#94A3B8]">
                        <span>{course.enrolmentCount} students</span>
                        <span>{formatDate(course.createdAt)}</span>
                      </div>
                      {/* Rejection reason */}
                      {course.status === "DRAFT" && course.rejectionReason && (
                        <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-xs font-bold text-red-600 mb-1">
                            Rejection Reason:
                          </p>
                          <p className="text-xs text-red-600 leading-5">
                            {course.rejectionReason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/courses/${course.id}`}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold border border-[#12304E] text-[#12304E] hover:bg-slate-50"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </Link>
                    <Link
                      href={`/admin/courses/${course.id}/edit`}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold bg-[#12304E] text-white hover:bg-[#1a4268]"
                    >
                      <Settings2 className="w-3.5 h-3.5" />
                      Manage
                    </Link>

                    {course.status === "PENDING_REVIEW" && (
                      <>
                        <button
                          onClick={() => handleApprove(course)}
                          className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold border border-[#22A146] text-[#22A146] hover:bg-green-50"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            setRejectCourse({ id: course.id, title: course.title })
                          }
                          className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold border border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </>
                    )}

                    {course.status === "PUBLISHED" && (
                      <button
                        onClick={() => handleSuspend(course)}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold border border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        Suspend
                      </button>
                    )}

                    {course.status === "SUSPENDED" && (
                      <button
                        onClick={() => handleActivate(course)}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold border border-[#22A146] text-[#22A146] hover:bg-green-50"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        Activate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Pagination
        page={page}
        pageSize={20}
        total={data?.total ?? 0}
        onPageChange={setPage}
        itemLabel="courses"
      />

      <ReasonDialog
        open={!!rejectCourse}
        onOpenChange={(open) => !open && setRejectCourse(null)}
        title="Reject this course?"
        description={
          <>
            <strong>{rejectCourse?.title}</strong> will be sent back to the
            instructor with your reason.
          </>
        }
        label="Reason for rejection"
        placeholder="What needs to change before it can be approved?"
        confirmLabel="Reject course"
        onConfirm={(reason) =>
          rejectMutation.mutateAsync(
            { courseId: rejectCourse!.id, reason },
            { onSuccess: refreshCourses },
          )
        }
      />
    </div>
  );
}
