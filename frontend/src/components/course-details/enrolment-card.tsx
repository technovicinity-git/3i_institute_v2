"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  Award,
  Calendar,
  CheckCircle,
  Globe,
  Heart,
  Play,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import type { CourseDetails } from "@/types/course-details";
import { useProfileStore } from "@/stores/profile-store";
import { useEnrolMutation } from "@/hooks/use-enrolment";
import { useWishlistToggle } from "@/hooks/use-wishlist";
import { ShareDialog } from "@/components/share/share-dialog";
import { siteUrl } from "@/lib/share";
import { languageLabel, levelLabel } from "./utils";

/** Sticky right-rail card: enrol / continue actions, inclusions and sharing. */
export function EnrolmentCard({ course }: { course: CourseDetails }) {
  const [showShare, setShowShare] = useState(false);

  return (
    <div className="w-full lg:w-[380px] shrink-0">
      <div className="lg:sticky lg:top-24">
        <div className="bg-white border border-[#E3E8EF] rounded-xl overflow-hidden">
          {/* Thumbnail */}
          <div className="relative h-[214px] flex items-center justify-center bg-gray-100">
            {course.thumbnailUrl ? (
              <Image
                src={course.thumbnailUrl}
                alt={course.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                Course Preview
              </div>
            )}
          </div>

          <div className="p-6 flex flex-col gap-5">
            {/* CTA */}
            <div className="flex flex-col gap-3">
              <p className="text-xs font-bold text-[#B8912F] uppercase tracking-wide">
                Included with membership
              </p>
              <h3 className="font-serif text-2xl text-[#0C1F33]">
                {course.isEnrolled ? "You're enrolled" : "Start learning today"}
              </h3>

              {course.isEnrolled ? (
                <EnrolledActions course={course} />
              ) : (
                <EnrolActions course={course} />
              )}

              <Link
                href="/pricing"
                className="text-sm font-semibold text-[#12304E] text-center underline"
              >
                See membership plans
              </Link>
            </div>

            <hr className="border-[#E3E8EF]" />

            {/* What's included */}
            {course.whatIncluded.length > 0 && (
              <>
                <div>
                  <p className="text-[13px] font-bold text-[#0C1F33] mb-3">
                    What&apos;s included
                  </p>
                  <ul className="space-y-3">
                    {course.whatIncluded.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-sm text-[#0C1F33]"
                      >
                        <CheckCircle
                          className="w-3.5 h-3.5 text-[#22A146] shrink-0"
                          strokeWidth={2}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <hr className="border-[#E3E8EF]" />
              </>
            )}

            {/* Meta */}
            <div className="flex items-center justify-between text-[13px] text-[#64748B]">
              {/* <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> {course.durationWeeks}{" "}
                weeks
              </span> */}
              <span className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" /> {levelLabel(course.level)}
              </span>
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> {languageLabel(course.language)}
              </span>
            </div>

            {/* Share */}
            <button
              type="button"
              onClick={() => setShowShare(true)}
              className="flex items-center gap-2 text-sm text-[#0C1F33] hover:text-[#22A146] transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" /> Share this course
            </button>
            <ShareDialog
              open={showShare}
              onOpenChange={setShowShare}
              url={`${siteUrl()}/courses/${course.id}`}
              title={course.title}
              text={`Check out "${course.title}" at 3i International Islamic Institute`}
              campaign="course_share"
              imageUrl={course.thumbnailUrl ?? course.coverImageUrl}
              subtitle={course.instructor?.name}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Continue learning / chat room / dashboard for an enrolled learner. */
function EnrolledActions({ course }: { course: CourseDetails }) {
  return (
    <>
      {course.type === "REGULAR" &&
        (course.continueLessonId ? (
          <Link
            href={`/my-courses/${course.id}/lessons/${
              course.lastWatchedLessonId && !course.isCompleted
                ? course.lastWatchedLessonId
                : course.continueLessonId
            }`}
            className="w-full py-3 bg-[#22A146] text-white rounded-lg text-[15px] font-semibold hover:bg-[#1D8F3D] transition-colors text-center flex items-center justify-center gap-2"
          >
            {course.isCompleted ? (
              "Review Course"
            ) : course.lastWatchedLessonId ? (
              <>
                <Play className="w-4 h-4" />
                Continue Learning
              </>
            ) : (
              "Start Learning"
            )}
          </Link>
        ) : (
          <button
            disabled
            className="w-full py-3 bg-gray-200 text-gray-500 rounded-lg text-[15px] font-semibold cursor-not-allowed"
          >
            Lessons coming soon
          </button>
        ))}

      {/* Chat Room Button */}
      {course.type !== "REGULAR" && (
        <Link
          href={`/chat?courseId=${course.id}&courseTitle=${encodeURIComponent(course.title)}&batchId=${course.enrolmentBatchId ?? ""}&batchName=${encodeURIComponent("Your Batch")}`}
          className="w-full py-3 bg-[#12304E] text-white rounded-lg text-[15px] font-semibold hover:bg-[#1a4268] transition-colors text-center"
        >
          Chat Room
        </Link>
      )}

      {/* Go to Dashboard */}
      <Link
        href="/dashboard"
        className="w-full py-3 border border-[#12304E] text-[#12304E] rounded-lg text-[15px] font-semibold hover:bg-gray-50 transition-colors text-center"
      >
        Go to Dashboard
      </Link>

      {/* Enrolled badge */}
      <span className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-[#22A146]">
        <CheckCircle className="w-4 h-4" />
        Enrolled
      </span>
    </>
  );
}

/** Enrol (regular) or batch selection (online class), plus wishlist. */
function EnrolActions({ course }: { course: CourseDetails }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { activeProfile } = useProfileStore();
  const enrolMutation = useEnrolMutation();
  const wishlist = useWishlistToggle(course.id);

  const handleRegularEnrol = () => {
    if (!activeProfile) {
      toast.error("Please select a profile first");
      router.push("/profiles");
      return;
    }

    enrolMutation.mutate(
      { learnerProfileId: activeProfile.id, courseId: course.id },
      {
        onSuccess: () => {
          toast.success("Enrolled successfully");
          queryClient.invalidateQueries({
            queryKey: ["course-details", course.id, activeProfile.id],
          });
        },
      },
    );
  };

  return (
    <>
      {course.type === "REGULAR" ? (
        <button
          onClick={handleRegularEnrol}
          disabled={enrolMutation.isPending}
          className="w-full py-3 bg-[#22A146] text-white rounded-lg text-[15px] font-semibold hover:bg-[#1D8F3D] transition-colors text-center flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {enrolMutation.isPending ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Enrolling...
            </>
          ) : (
            "Enrol Now"
          )}
        </button>
      ) : (
        <Link
          href={
            activeProfile
              ? `/enrol/batch-selection?courseId=${course.id}&courseTitle=${encodeURIComponent(course.title)}&learnerProfileId=${activeProfile.id}`
              : "/profiles"
          }
          className="w-full py-3 bg-[#22A146] text-white rounded-lg text-[15px] font-semibold hover:bg-[#1D8F3D] transition-colors text-center"
        >
          {activeProfile ? "View Enrolment Options" : "Select Profile First"}
        </Link>
      )}

      {/* Wishlist */}
      <button
        type="button"
        onClick={() => void wishlist.toggle()}
        disabled={wishlist.pending}
        aria-pressed={wishlist.wishlisted}
        className={`w-full py-3 border rounded-lg text-[15px] font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-60 ${
          wishlist.wishlisted
            ? "border-[#2D6CDF] bg-[#2D6CDF]/5 text-[#2D6CDF] hover:bg-[#2D6CDF]/10"
            : "border-[#12304E] text-[#12304E] hover:bg-[#12304E] hover:text-white"
        }`}
      >
        <Heart
          className={`w-4 h-4 ${wishlist.wishlisted ? "fill-[#2D6CDF]" : ""}`}
        />
        {wishlist.wishlisted ? "Wishlisted" : "Add to wishlist"}
      </button>
    </>
  );
}
