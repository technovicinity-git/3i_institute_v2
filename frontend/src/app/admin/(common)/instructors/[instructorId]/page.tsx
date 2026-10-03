"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ExternalLink,
  FileText,
  GraduationCap,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  useAdminInstructor,
  useApproveInstructorMutation,
  useRejectInstructorMutation,
  useSuspendInstructorMutation,
  useReinstateInstructorMutation,
} from "@/hooks/use-admin";

export default function AdminInstructorDetailsPage() {
  const params = useParams();
  const instructorId = params.instructorId as string;
  const {
    data: instructor,
    isLoading,
    isError,
  } = useAdminInstructor(instructorId);
  const approve = useApproveInstructorMutation();
  const reject = useRejectInstructorMutation();
  const suspend = useSuspendInstructorMutation();
  const reinstate = useReinstateInstructorMutation();
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [cvPreviewUrl, setCvPreviewUrl] = useState<string | null>(null);
  const [cvPreviewError, setCvPreviewError] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const cvUrl = instructor?.application?.cvUrl;
    if (!cvUrl) return;

    setCvPreviewUrl(null);
    setCvPreviewError(false);
    let objectUrl: string | null = null;
    const controller = new AbortController();

    fetch(cvUrl, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Could not load CV");
        return response.blob();
      })
      .then((file) => {
        objectUrl = URL.createObjectURL(
          new Blob([file], { type: "application/pdf" }),
        );
        setCvPreviewUrl(objectUrl);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        setCvPreviewError(true);
      });

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [instructor?.application?.cvUrl]);

  if (isLoading)
    return (
      <div className="p-10 text-center text-[#64748B]">Loading instructor…</div>
    );
  if (isError || !instructor)
    return (
      <div className="p-10">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm font-semibold text-[#64748B] hover:text-[#0C1F33] mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <p className="mt-6 text-[#64748B]">
          Could not load instructor details.
        </p>
      </div>
    );

  const application = instructor.application;
  const isSuspended = instructor.status === "SUSPENDED";

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm font-semibold text-[#64748B] hover:text-[#0C1F33] mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
      </div>
      <section className="bg-white rounded-xl border border-[#E3E8EF] p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex items-center gap-4">
            {instructor.avatarUrl ? (
              <Image
                src={instructor.avatarUrl}
                alt=""
                width={64}
                height={64}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#F9F6F0] flex items-center justify-center text-lg font-bold text-[#B8912F]">
                {instructor.firstName[0]}
                {instructor.lastName[0]}
              </div>
            )}
            <div>
              <h1 className="text-2xl text-[#0C1F33]">
                {instructor.firstName} {instructor.lastName}
              </h1>
              <p className="text-sm text-[#64748B]">{instructor.email}</p>
              <span
                className={`inline-flex mt-2 px-2.5 py-1 rounded-full text-xs font-semibold ${isSuspended || instructor.status === "REJECTED" ? "bg-red-50 text-red-700" : instructor.status === "PENDING" ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"}`}
              >
                {instructor.status === "ACTIVE"
                  ? "Active instructor"
                  : instructor.status === "SUSPENDED"
                    ? "Suspended"
                    : instructor.status === "REJECTED"
                      ? "Application rejected"
                      : "Application pending"}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {!isSuspended && (
              <button
                onClick={() => suspend.mutate(instructorId)}
                disabled={suspend.isPending}
                className="px-4 py-2 rounded-lg border border-red-300 text-sm font-semibold text-red-600 disabled:opacity-50"
              >
                {suspend.isPending ? "Suspending…" : "Suspend"}
              </button>
            )}
            {isSuspended && (
              <button
                onClick={() => reinstate.mutate(instructorId)}
                disabled={reinstate.isPending}
                className="px-4 py-2 rounded-lg bg-[#22A146] text-white text-sm font-semibold disabled:opacity-50"
              >
                {reinstate.isPending ? "Reinstating…" : "Unsuspend"}
              </button>
            )}
            {instructor.status === "PENDING" && (
              <button
                onClick={() => approve.mutate(instructorId)}
                disabled={approve.isPending}
                className="px-4 py-2 rounded-lg bg-[#22A146] text-white text-sm font-semibold disabled:opacity-50"
              >
                Approve
              </button>
            )}
            {instructor.status === "PENDING" && (
              <button
                onClick={() => setShowReject(true)}
                className="px-4 py-2 rounded-lg border border-red-300 text-sm font-semibold text-red-600"
              >
                Reject
              </button>
            )}
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-5 border-t border-gray-100 mt-6 pt-5">
          <div>
            <h2 className="text-xs uppercase font-bold text-[#64748B] mb-1">
              Bio
            </h2>
            <p className="text-sm text-[#0C1F33] whitespace-pre-wrap">
              {application?.bio ?? instructor.bio ?? "—"}
            </p>
          </div>
          <div>
            <h2 className="text-xs uppercase font-bold text-[#64748B] mb-1">
              Area of expertise
            </h2>
            <p className="text-sm text-[#0C1F33]">
              {application?.areaOfExpertise ?? "—"}
            </p>
          </div>
          <div>
            <h2 className="text-xs uppercase font-bold text-[#64748B] mb-1">
              Working with Children Check
            </h2>
            <p className="text-sm text-[#0C1F33]">
              {application?.wwccNumber ?? "—"}{" "}
              {application?.wwccState ? `(${application.wwccState})` : ""}
              {application?.wwccExpiry
                ? ` · Expires ${new Date(application.wwccExpiry).toLocaleDateString()}`
                : ""}
            </p>
          </div>
          <div className="sm:col-span-2">
            <h2 className="text-xs uppercase font-bold text-[#64748B] mb-2">
              CV
            </h2>
            {application?.cvUrl ? (
              <div className="overflow-hidden rounded-lg border border-[#E3E8EF] bg-[#F8FAFC]">
                <div className="flex items-center justify-between gap-3 border-b border-[#E3E8EF] px-4 py-3">
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-[#334155]">
                    <FileText className="w-4 h-4" /> Instructor CV (PDF)
                  </span>
                  <a
                    href={cvPreviewUrl ?? application.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-blue-700 hover:underline"
                  >
                    Open PDF <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                {cvPreviewUrl ? (
                  <iframe
                    src={`${cvPreviewUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                    title={`${instructor.firstName} ${instructor.lastName} CV`}
                    className="h-[680px] w-full bg-white"
                  />
                ) : (
                  <div className="flex h-40 items-center justify-center px-6 text-center text-sm text-[#64748B]">
                    {cvPreviewError
                      ? "The CV preview could not be loaded. Use Open PDF to view it."
                      : "Loading CV preview…"}
                  </div>
                )}
                <p className="border-t border-[#E3E8EF] px-4 py-2 text-xs text-[#64748B]">
                  The PDF preview opens in this page. Use Open PDF to open it
                  separately.
                </p>
              </div>
            ) : (
              <p className="text-sm text-[#64748B]">No CV provided</p>
            )}
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[#0C1F33]">Courses</h2>
          <span className="text-sm text-[#64748B]">
            {instructor.courses.length} total
          </span>
        </div>
        {instructor.courses.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-[#E3E8EF] p-10 text-center">
            <GraduationCap className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-[#64748B]">
              This instructor has no courses yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {instructor.courses.map((course) => (
              <article
                key={course.id}
                className="bg-white rounded-xl border border-[#E3E8EF] p-5 flex gap-4"
              >
                {course.thumbnailUrl ? (
                  <Image
                    src={course.thumbnailUrl}
                    alt=""
                    width={96}
                    height={64}
                    className="rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-24 h-16 rounded-lg bg-[#F4F6F8] flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-[#94A3B8]" />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-[#0C1F33]">
                      {course.title}
                    </h3>
                    <span className="text-xs rounded-full bg-gray-100 px-2 py-1 text-[#64748B]">
                      {course.status}
                    </span>
                  </div>
                  <p className="text-sm text-[#64748B] mt-1 line-clamp-2">
                    {course.summary}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {showReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            aria-label="Close reject dialog"
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowReject(false)}
          />
          <div className="relative bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-[#0C1F33]">
              Reject instructor application
            </h2>
            <p className="text-sm text-[#64748B] mt-1 mb-4">
              Provide a reason for the rejection.
            </p>
            <textarea
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              rows={4}
              className="w-full rounded-lg border border-[#E3E8EF] p-3 text-sm"
              placeholder="Reason…"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowReject(false)}
                className="flex-1 py-2 border border-[#E3E8EF] rounded-lg text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                disabled={!rejectReason.trim() || reject.isPending}
                onClick={() =>
                  reject.mutate(
                    { userId: instructorId, reason: rejectReason },
                    {
                      onSuccess: () => {
                        setShowReject(false);
                        setRejectReason("");
                      },
                    },
                  )
                }
                className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold disabled:opacity-50"
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
