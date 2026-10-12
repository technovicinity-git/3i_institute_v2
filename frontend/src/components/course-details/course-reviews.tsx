import { Star } from "lucide-react";
import type { CourseDetails } from "@/types/course-details";

export function CourseReviews({
  course,
  onRate,
}: {
  course: CourseDetails;
  /** Opens the rate & review modal (shown to enrolled learners). */
  onRate: () => void;
}) {
  return (
    <div>
      <p className="text-sm font-bold text-[#0C1F33] mb-3">Student Voices</p>
      <h2 className="font-serif text-[40px] leading-[48px] text-[#0C1F33] mb-8">
        Course Reviews
      </h2>

      <div className="flex flex-col sm:flex-row gap-8 mb-10">
        {/* Rating summary */}
        <div className="bg-[#FBF9F4] border border-[#E3E8EF] rounded-xl p-6 flex flex-col items-center justify-center min-w-[140px]">
          <span className="font-serif text-[56px] text-[#B8912F]">
            {course.ratingSummary.average || "—"}
          </span>
          <div className="flex gap-0.5 mb-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < Math.round(course.ratingSummary.average)
                    ? "text-[#B8912F] fill-[#B8912F]"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-[#64748B]">
            Based on {course.ratingSummary.total} reviews
          </p>
        </div>

        {/* Rating bars */}
        <div className="flex-1 flex flex-col justify-center gap-2">
          {course.ratingSummary.distribution.map((bar) => (
            <div key={bar.stars} className="flex items-center gap-3">
              <span className="text-[13px] text-[#64748B] w-12">
                {bar.stars} stars
              </span>
              <div className="flex-1 h-2 bg-[#E3E8EF] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#B8912F] rounded-full"
                  style={{ width: `${bar.pct}%` }}
                />
              </div>
              <span className="text-[13px] text-[#64748B] w-8 text-right">
                {bar.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Rate & Review CTA */}
      {course.isEnrolled && (
        <div className="mb-6 flex items-center gap-4 bg-[#F9F6F0] border border-[#E3E8EF] rounded-lg px-5 py-4 flex-wrap">
          <button
            onClick={onRate}
            className="px-5 py-3 bg-white border border-[#0C1F33] rounded-lg text-[15px] font-semibold text-[#0C1F33] hover:bg-gray-50 transition-colors"
          >
            Rate & review
          </button>
          <span className="text-[13px] text-[#475569]">
            You&apos;re enrolled in this course
          </span>
        </div>
      )}

      {/* Individual reviews */}
      {course.reviews.length > 0 ? (
        <div className="space-y-4">
          {course.reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white border border-[#E3E8EF] rounded-xl px-6 py-5"
            >
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-[#0C1F33]">
                  {review.name}
                </span>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, j) => (
                    <Star
                      key={j}
                      className={`w-3 h-3 ${
                        j < review.rating
                          ? "text-[#B8912F] fill-[#B8912F]"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="mt-3 text-[15px] text-[#475569] leading-[22px]">
                {review.text}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#64748B]">No reviews yet.</p>
      )}
    </div>
  );
}
