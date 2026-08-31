"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Users, Calendar, Clock, Plus, Eye, XCircle } from "lucide-react";
import { useCourseBatches, useCloseBatchMutation } from "@/hooks/use-batches";

function getStatusBadge(status: string) {
  const statusMap: Record<string, { label: string; className: string }> = {
    UPCOMING: {
      label: "UPCOMING",
      className: "bg-[#2563EB]/10 text-[#2563EB]",
    },
    ACTIVE: { label: "ACTIVE", className: "bg-[#22A146]/10 text-[#22A146]" },
    COMPLETED: { label: "COMPLETED", className: "bg-gray-100 text-gray-600" },
    CANCELLED: { label: "CANCELLED", className: "bg-red-50 text-red-600" },
  };
  return (
    statusMap[status] ?? {
      label: status,
      className: "bg-gray-100 text-gray-600",
    }
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function BatchesPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const { data: batches, isLoading, isError } = useCourseBatches(courseId);
  const closeBatchMutation = useCloseBatchMutation();

  const [confirmClose, setConfirmClose] = useState<string | null>(null);

  const handleCloseBatch = (batchId: string) => {
    if (confirmClose === batchId) {
      closeBatchMutation.mutate(batchId, {
        onSuccess: () => setConfirmClose(null),
      });
    } else {
      setConfirmClose(batchId);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-[1000px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push("/instructor/courses")}
          className="text-sm font-semibold text-[#64748B] hover:text-[#0C1F33] mb-4"
        >
          ← Back to courses
        </button>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1
              className="text-3xl md:text-[36px] text-[#0C1F33]"
              style={{ fontFamily: "'Marcellus', serif" }}
            >
              Batches
            </h1>
            <p className="text-base text-[#64748B]">
              {batches?.length ?? 0} batches for this course
            </p>
          </div>
          <button
            onClick={() =>
              router.push(`/instructor/courses/${courseId}/batches/create`)
            }
            className="flex items-center gap-2 px-5 py-2.5 bg-[#22A146] text-white rounded-lg text-sm font-semibold hover:bg-[#1E9040]"
          >
            <Plus className="w-4 h-4" />
            Create Batch
          </button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && batches?.length === 0 && (
        <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-[#64748B]">
            No batches yet. Create your first batch.
          </p>
        </div>
      )}

      {/* Batch List */}
      {!isLoading && !isError && batches && batches.length > 0 && (
        <div className="space-y-4">
          {batches.map((batch) => {
            const status = getStatusBadge(batch.status);
            const nextSession = batch.sessions.find(
              (s) => new Date(s.scheduledAt) > new Date(),
            );

            return (
              <div
                key={batch.id}
                className="bg-white rounded-xl border border-[#E3E8EF] p-6"
              >
                <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <h2
                      className="text-lg font-semibold text-[#0C1F33]"
                      style={{ fontFamily: "'Marcellus', serif" }}
                    >
                      {batch.name}
                    </h2>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-sm text-[#64748B]">
                      <Users className="w-4 h-4" />
                      {batch.enrolmentCount}/{batch.capacity}
                    </span>
                    <Link
                      href={`/instructor/courses/${courseId}/batches/${batch.id}`}
                      className="flex items-center gap-1 text-sm font-semibold text-[#22A146] hover:underline"
                    >
                      <Eye className="w-4 h-4" />
                      Details
                    </Link>
                    {batch.status === "UPCOMING" && (
                      <button
                        onClick={() => handleCloseBatch(batch.id)}
                        className="flex items-center gap-1 text-sm font-semibold text-red-600 hover:underline"
                      >
                        <XCircle className="w-4 h-4" />
                        {confirmClose === batch.id ? "Confirm?" : "Close"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Sessions summary */}
                <div className="flex items-center gap-4 text-sm text-[#64748B]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {batch.sessions.length} sessions
                  </span>
                  {nextSession && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Next: {formatDate(nextSession.scheduledAt)} at{" "}
                        {formatTime(nextSession.scheduledAt)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
