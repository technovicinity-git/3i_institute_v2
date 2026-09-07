"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useRatingMutation } from "@/hooks/use-ratings";

interface RateReviewModalProps {
  courseId: string;
  courseTitle: string;
  learnerName: string;
  accountName: string;
  learnerProfileId?: string;
  onClose: () => void;
}

export function RateReviewModal({
  courseId,
  courseTitle,
  learnerName,
  accountName,
  learnerProfileId,
  onClose,
}: RateReviewModalProps) {
  const ratingMutation = useRatingMutation();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    ratingMutation.mutate(
      {
        courseId,
        rating,
        review: review.trim() || undefined,
        learnerProfileId,
      },
      {
        onSuccess: () => onClose(),
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-[#0C1F33]/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-[600px] bg-white rounded-xl p-6 sm:p-10 z-10">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-[#475569] hover:bg-gray-100"
        >
          <X className="w-[18px] h-[18px]" />
        </button>

        {/* Heading */}
        <h2
          className="text-[28px] sm:text-[40px] leading-[36px] sm:leading-[48px] text-[#0C1F33]"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          Rate this course
        </h2>

        {/* Attribution */}
        <div className="mt-5 bg-[#F9F6F0] rounded-lg px-5 py-3">
          <p className="text-sm sm:text-base font-medium text-[#0C1F33]">
            Submitting as {accountName} on behalf of {learnerName}
          </p>
        </div>

        {/* Course name */}
        <p className="mt-5 text-[15px] text-[#475569]">{courseTitle}</p>

        <form onSubmit={handleSubmit}>
          {/* Rating */}
          <div className="mt-5">
            <label className="block text-base font-semibold text-[#0C1F33] mb-2">
              Your rating
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-2xl transition-colors hover:scale-110 ${
                    star <= rating ? "text-[#B8912F]" : "text-[#E3E8EF]"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* Review */}
          <div className="mt-5">
            <label className="block text-base font-semibold text-[#0C1F33] mb-2">
              Write a review (optional)
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your experience with this course..."
              rows={4}
              maxLength={2000}
              className="w-full px-4 py-3 bg-white border border-[#E3E8EF] rounded-lg text-base text-[#0C1F33] placeholder-[#64748B] resize-none focus:outline-none focus:ring-2 focus:ring-[#22A146]/30 focus:border-[#22A146]"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={ratingMutation.isPending || rating === 0}
            className="mt-5 w-full h-[50px] bg-[#22A146] hover:bg-[#1B8A3A] text-[#0C1F33] font-semibold text-[15px] rounded-lg transition-colors disabled:opacity-50"
          >
            {ratingMutation.isPending ? "Submitting..." : "Submit review"}
          </button>
        </form>
      </div>
    </div>
  );
}
