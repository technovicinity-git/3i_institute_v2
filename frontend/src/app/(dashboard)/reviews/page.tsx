// app/course/rate-review/page.tsx
"use client";

import { useState } from "react";
import { X, User } from "lucide-react";

/* ---- Star Rating Component ---- */
function StarRating({
  rating,
  onRate,
  size = "md",
}: {
  rating: number;
  onRate?: (r: number) => void;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = { sm: "text-sm", md: "text-xl", lg: "text-2xl" };
  const gapClasses = { sm: "gap-0.5", md: "gap-1", lg: "gap-2" };

  return (
    <div className={`flex items-center ${gapClasses[size]}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRate?.(star)}
          className={`${sizeClasses[size]} transition-colors ${
            onRate ? "cursor-pointer hover:scale-110" : "cursor-default"
          } ${star <= rating ? "text-[#B8912F]" : "text-[#64748B]"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

/* ---- Review Card ---- */
function ReviewCard({
  reviewer,
  rating,
  text,
}: {
  reviewer: string;
  rating: number;
  text: string;
}) {
  return (
    <div className="bg-white border border-[#E3E8EF] rounded-xl px-6 py-5">
      <div className="flex items-center gap-2">
        <span className="text-base font-semibold text-[#0C1F33]">
          {reviewer}
        </span>
        <StarRating rating={rating} size="sm" />
      </div>
      <p className="mt-3 text-[15px] text-[#475569] leading-[22px]">{text}</p>
    </div>
  );
}

/* ---- Rate & Review Modal ---- */
function RateReviewModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: { rating: number; review: string }) => void;
}) {
  const [rating, setRating] = useState(4);
  const [review, setReview] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ rating, review });
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-[#0C1F33]/50 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="w-full max-w-[600px] bg-white rounded-xl p-10 relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-[#475569] hover:bg-gray-100 transition-colors"
          >
            <X className="w-[18px] h-[18px]" />
          </button>

          {/* Heading */}
          <h2 className="font-marcellus text-[40px] leading-[48px] text-[#0C1F33]">
            Rate this course
          </h2>

          {/* Attribution Bar */}
          <div className="mt-5 bg-[#F9F6F0] rounded-lg px-5 py-3">
            <p className="text-base font-medium text-[#0C1F33]">
              Submitting as Sarah Ahmed on behalf of Yusuf
            </p>
          </div>

          {/* Course Reference */}
          <p className="mt-5 text-[15px] text-[#475569]">
            Foundations of Islamic Calligraphy
          </p>

          <form onSubmit={handleSubmit}>
            {/* Star Rating Field */}
            <div className="mt-5">
              <label className="block text-base font-semibold text-[#0C1F33] mb-2">
                Your rating
              </label>
              <StarRating rating={rating} onRate={setRating} size="lg" />
            </div>

            {/* Review Field */}
            <div className="mt-5">
              <label className="block text-base font-semibold text-[#0C1F33] mb-2">
                Write a review (optional)
              </label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your experience with this course..."
                rows={4}
                className="w-full px-4 py-3 bg-white border border-[#E3E8EF] rounded-lg text-base text-[#0C1F33] placeholder-[#64748B] resize-none focus:outline-none focus:ring-2 focus:ring-[#22A146]/30 focus:border-[#22A146] transition-colors"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="mt-5 w-full h-[50px] bg-[#22A146] hover:bg-[#1B8A3A] text-[#0C1F33] font-semibold text-[15px] rounded-lg transition-colors cursor-pointer"
            >
              Submit review
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

/* ---- Main Page ---- */
export default function CourseRateReviewPage() {
  const [showModal, setShowModal] = useState(true);

  return (
    <div className="min-h-screen bg-[#FBF9F4] flex flex-col">
      {/* Page Content */}
      <main className="flex-1 px-[120px] py-0">
        {/* Breadcrumb */}
        <p className="mt-9 text-[13px] text-[#475569]">
          Courses &nbsp;&gt;&nbsp; Islamic Studies
        </p>

        <div className="mt-5 flex gap-12">
          {/* Left Column */}
          <div className="flex-1 max-w-[780px]">
            {/* Course Title */}
            <h1 className="font-marcellus text-[56px] leading-[64px] text-[#0C1F33]">
              Foundations of Islamic Calligraphy
            </h1>

            {/* Age Badge */}
            <div className="mt-5 flex items-center gap-2">
              <span className="inline-flex items-center px-[9px] py-[2px] bg-white border border-[#E3E8EF] rounded-full text-[11px] font-bold text-[#0C1F33]">
                9-12
              </span>
              <span className="text-[15px] text-[#475569]">(ages 9–12)</span>
            </div>

            {/* Summary */}
            <p className="mt-8 text-lg text-[#475569] leading-[26px]">
              Master the art of traditional Islamic calligraphy — Naskh and
              Thuluth foundational scripts — through guided, hands-on sessions
              exploring the rich history and spiritual significance behind each
              stroke. Ideal for beginners and anyone looking to deepen their
              calligraphy experience.
            </p>

            {/* What You'll Learn */}
            <section className="mt-10">
              <h2 className="font-marcellus text-[40px] leading-[48px] text-[#0C1F33]">
                What you&apos;ll learn
              </h2>
              <ul className="mt-4 space-y-4">
                {[
                  "Identify and reproduce the core letterforms of the Arabic alphabet in Naskh script",
                  "Prepare traditional calligraphy tools — reed pen, ink, and paper — for optimal results",
                  "Understand the geometric proportions underlying each letter and word",
                  "Apply diacritical marks with correct placement and sizing",
                  "Create a finished calligraphic composition suitable for framing",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-base font-semibold text-[#22A146] mt-0.5">
                      ✓
                    </span>
                    <span className="text-base text-[#0C1F33] leading-6">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            {/* About the Instructor */}
            <section className="mt-10">
              <h2 className="font-marcellus text-[40px] leading-[48px] text-[#0C1F33]">
                About the instructor
              </h2>
              <p className="mt-4 text-base font-semibold text-[#0C1F33]">
                Ustadha Noor Ahmad
              </p>
              <p className="mt-2 text-base text-[#475569] leading-6">
                Ustadha Noor Ahmad is a classically trained calligrapher with
                over 15 years of experience in Naskh and Thuluth scripts. She
                studied under master calligraphers in Istanbul and Cairo and
                holds an ijazah in Quranic calligraphy.
              </p>
            </section>

            {/* Reviews */}
            <section className="mt-10">
              <h2 className="font-marcellus text-[40px] leading-[48px] text-[#0C1F33]">
                Reviews
              </h2>

              {/* Average Rating */}
              <div className="mt-5 flex items-center gap-3">
                <span className="text-[40px] font-semibold text-[#0C1F33]">
                  4.8
                </span>
                <StarRating rating={5} size="md" />
                <span className="text-[15px] text-[#157A34] ml-2">
                  (24 reviews)
                </span>
              </div>

              {/* Rate CTA Bar */}
              <div className="mt-5 flex items-center gap-4 bg-[#F9F6F0] border border-[#E3E8EF] rounded-lg px-5 py-4">
                <button
                  onClick={() => setShowModal(true)}
                  className="px-5 py-3 bg-white border border-[#0C1F33] rounded-lg text-[15px] font-semibold text-[#0C1F33] hover:bg-gray-50 transition-colors"
                >
                  Rate & review
                </button>
                <span className="text-[13px] text-[#475569]">
                  You&apos;re enrolled in this course
                </span>
              </div>

              {/* Review Cards */}
              <div className="mt-6 space-y-4">
                <ReviewCard
                  reviewer="Amina R."
                  rating={5}
                  text="This course transformed my understanding of Arabic calligraphy. Ustadha Noor's teaching style is patient and thorough. The structured approach to learning Naskh script made it accessible even for a complete beginner like me."
                />
                <ReviewCard
                  reviewer="Submitted by a guardian, on behalf of Yusuf"
                  rating={4}
                  text="Yusuf has been so engaged with this course — he spends hours practicing after each session. The instructor is wonderful with younger students."
                />
              </div>
            </section>
          </div>

          {/* Right Column — Enrollment Card */}
          <div className="w-[360px] shrink-0">
            <div className="bg-white border border-[#E3E8EF] rounded-xl overflow-hidden sticky top-6">
              {/* Thumbnail placeholder */}
              <div className="w-full h-[200px] bg-[#E3E8EF]" />
              <div className="p-6">
                <button className="w-full h-[50px] bg-[#22A146] hover:bg-[#1B8A3A] text-[#0C1F33] font-semibold text-[15px] rounded-lg transition-colors cursor-pointer">
                  Go to course
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <RateReviewModal
          onClose={() => setShowModal(false)}
          onSubmit={(data) => {
            console.log("Review submitted:", data);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}
