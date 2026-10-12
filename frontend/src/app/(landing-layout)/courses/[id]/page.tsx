"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { RateReviewModal } from "@/components/review/rate-review-modal";
import { useAuthStore } from "@/stores/auth-store";
import { useProfileStore } from "@/stores/profile-store";
import { useCourseDetails } from "@/hooks/use-course-details";
import { CourseHero } from "@/components/course-details/course-hero";
import { CourseOverview } from "@/components/course-details/course-overview";
import { CourseBatches } from "@/components/course-details/course-batches";
import { CourseCurriculum } from "@/components/course-details/course-curriculum";
import { CourseInstructor } from "@/components/course-details/course-instructor";
import { CourseReviews } from "@/components/course-details/course-reviews";
import { EnrolmentCard } from "@/components/course-details/enrolment-card";
import { MembershipBand } from "@/components/course-details/membership-band";
import { CourseFaq } from "@/components/course-details/course-faq";
import { RelatedCourses } from "@/components/course-details/related-courses";

export default function CourseDetailsPage() {
  const [showRateModal, setShowRateModal] = useState(false);

  const { user } = useAuthStore();
  const params = useParams();
  const courseId = params.id as string;
  const { activeProfile } = useProfileStore();
  const {
    data: course,
    isLoading,
    isError,
  } = useCourseDetails(courseId, activeProfile?.id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FBF9F4] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="min-h-screen bg-[#FBF9F4] flex items-center justify-center flex-col gap-4">
        <p className="text-red-600 font-medium">Failed to load course</p>
        <Link
          href="/courses"
          className="text-[#22A146] font-semibold hover:underline"
        >
          Back to courses
        </Link>
      </div>
    );
  }

  return (
    <main>
      <CourseHero course={course} />

      {/* ───── CONTENT SPLIT ───── */}
      <section className="bg-[#FBF9F4]">
        <div className="max-w-[1200px] mx-auto px-6 pt-12 flex flex-col lg:flex-row gap-10">
          {/* LEFT COLUMN */}
          <div className="flex-1 min-w-0 flex flex-col gap-16">
            <CourseOverview course={course} />

            {course.type === "ONLINE_CLASS" && course.batches.length > 0 && (
              <CourseBatches batches={course.batches} />
            )}

            {course.curriculum.length > 0 && course.type === "REGULAR" && (
              <CourseCurriculum modules={course.curriculum} />
            )}

            <CourseInstructor instructor={course.instructor} />

            <CourseReviews
              course={course}
              onRate={() => setShowRateModal(true)}
            />
          </div>

          {/* RIGHT RAIL */}
          <EnrolmentCard course={course} />
        </div>
      </section>

      {/* ───── SPACER ───── */}
      <div className="h-[100px] bg-[#FBF9F4]" />

      <MembershipBand />

      {course.faq.length > 0 && <CourseFaq faq={course.faq} />}

      {course.relatedCourses.length > 0 && (
        <RelatedCourses courses={course.relatedCourses} />
      )}

      {showRateModal && (
        <RateReviewModal
          courseId={course.id}
          courseTitle={course.title}
          learnerName={activeProfile?.displayName ?? "Learner"}
          accountName={`${user?.firstName ?? "Parent"} ${user?.lastName ?? ""}`.trim()}
          learnerProfileId={activeProfile?.id}
          onClose={() => setShowRateModal(false)}
        />
      )}
    </main>
  );
}
