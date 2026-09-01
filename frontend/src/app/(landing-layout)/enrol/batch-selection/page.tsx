"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useCourseBatches, useEnrolMutation } from "@/hooks/use-enrolment";
import { useProfileStore } from "@/stores/profile-store";

function BatchSelectionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId") ?? "";
  const courseTitle = searchParams.get("courseTitle") ?? "this course";
  const learnerProfileId = searchParams.get("learnerProfileId") ?? "";

  const { activeProfile } = useProfileStore();

  const { data: batches, isLoading, isError } = useCourseBatches(courseId);
  const enrolMutation = useEnrolMutation();

  const [selectedBatchId, setSelectedBatchId] = useState<string>("");

  const enrollingProfileName = activeProfile?.displayName ?? "Learner";

  const handleConfirm = () => {
    if (!selectedBatchId) {
      toast.error("Please select a batch");
      return;
    }

    if (!learnerProfileId) {
      toast.error("Learner profile is required");
      return;
    }

    const selectedBatch = batches?.find((b) => b.id === selectedBatchId);
    const selectedBatchName = selectedBatch?.name ?? "Batch";

    enrolMutation.mutate(
      {
        learnerProfileId,
        courseId,
        batchId: selectedBatchId,
      },
      {
        onSuccess: (data) => {
          if (data.waitlisted) {
            toast.success(
              "Added to waitlist. You'll be notified when a seat opens.",
            );
            router.push("/dashboard");
          } else {
            toast.success("Enrolled successfully!");
            router.push(
              `/chat?courseId=${courseId}&courseTitle=${encodeURIComponent(courseTitle)}&batchId=${selectedBatchId}&batchName=${encodeURIComponent(selectedBatchName)}`,
            );
          }
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-[#FBF9F4] flex flex-col">
      {/* Main */}
      <main className="flex-1 flex items-start justify-center pt-10 sm:pt-20 px-4">
        <div className="w-full max-w-[640px] bg-white border border-[#E3E8EF] rounded-2xl p-6 sm:p-10">
          {/* Course Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-[9px] py-[5px] bg-white border border-[#E3E8EF] rounded text-[11px] font-bold text-[#0C1F33] uppercase">
                COURSE
              </span>
            </div>
            <h1
              className="text-[28px] sm:text-[40px] leading-[36px] sm:leading-[48px] text-[#0C1F33]"
              style={{ fontFamily: "'Marcellus', serif" }}
            >
              Enrol in {courseTitle}
            </h1>
            <p className="text-[15px] text-[#475569]">
              Enrolling:{" "}
              <span className="font-semibold text-[#0C1F33]">
                {enrollingProfileName}
              </span>
            </p>
          </div>

          {/* Batch Selection */}
          <div className="mt-8">
            <h3 className="text-base font-semibold text-[#0C1F33]">
              Choose a class time
            </h3>

            {/* Loading */}
            {isLoading && (
              <div className="flex items-center justify-center py-10">
                <div className="w-8 h-8 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
              </div>
            )}

            {/* Error */}
            {isError && (
              <p className="text-red-600 text-sm mt-4">
                Failed to load batches.
              </p>
            )}

            {/* No batches */}
            {!isLoading && !isError && batches?.length === 0 && (
              <p className="text-[#64748B] mt-4">
                No batches available for this course right now.
              </p>
            )}

            {/* Batch list */}
            {!isLoading && !isError && batches && batches.length > 0 && (
              <div className="mt-4 space-y-3">
                {batches.map((batch) => {
                  const isSelected = selectedBatchId === batch.id;
                  const isFull = batch.seatsRemaining <= 0;
                  const isLowSeats =
                    batch.seatsRemaining <= 3 && batch.seatsRemaining > 0;

                  return (
                    <button
                      key={batch.id}
                      onClick={() => !isFull && setSelectedBatchId(batch.id)}
                      disabled={isFull}
                      className={`w-full flex items-center rounded-xl px-5 py-5 transition-colors text-left ${
                        isFull
                          ? "bg-gray-50 border border-[#E3E8EF] opacity-60 cursor-not-allowed"
                          : isSelected
                            ? "bg-[#F4F8FF] border-2 border-[#2D6CDF]"
                            : "bg-white border border-[#E3E8EF] hover:border-[#CBD5E1]"
                      }`}
                    >
                      {/* Radio */}
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isSelected ? "border-[#2D6CDF]" : "border-[#E3E8EF]"
                        }`}
                      >
                        {isSelected && (
                          <div className="w-[10px] h-[10px] rounded-full bg-[#2D6CDF]" />
                        )}
                      </div>

                      {/* Details */}
                      <div className="ml-4 flex-1">
                        <p className="text-base font-semibold text-[#0C1F33]">
                          {batch.name}
                        </p>
                        <p className="text-sm text-[#475569] mt-1">
                          {batch.sessions.length} sessions
                        </p>
                      </div>

                      {/* Seats */}
                      <span
                        className={`text-sm font-semibold shrink-0 ${
                          isFull
                            ? "text-[#475569]"
                            : isLowSeats
                              ? "text-[#DC2626]"
                              : "text-[#475569]"
                        }`}
                      >
                        {isFull
                          ? "Full"
                          : `${batch.seatsRemaining} of ${batch.capacity} seats remaining`}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Confirm */}
          <div className="mt-8">
            <button
              onClick={handleConfirm}
              disabled={!selectedBatchId || enrolMutation.isPending}
              className="w-full h-12 bg-[#22A146] hover:bg-[#1B8A3A] text-[#0C1F33] font-semibold text-[15px] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              {enrolMutation.isPending ? "Enrolling..." : "Confirm enrolment"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function BatchSelectionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <BatchSelectionContent />
    </Suspense>
  );
}
