"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Star, Heart, Trash2 } from "lucide-react";
import { useProfileStore } from "@/stores/profile-store";
import {
  useWishlist,
  useRemoveFromWishlistMutation,
} from "@/hooks/use-wishlist";

function getAgeBadge(minimumAge: number): string {
  if (minimumAge >= 18) return "18+";
  if (minimumAge >= 16) return "16-17";
  if (minimumAge >= 13) return "13-15";
  if (minimumAge >= 9) return "9-12";
  if (minimumAge >= 5) return "5-8";
  return "All ages";
}

function getLevelBadge(level: string): string {
  const levels: Record<string, string> = {
    "1": "BEGINNER",
    "2": "INTERMEDIATE",
    "3": "ADVANCED",
    Beginner: "BEGINNER",
    Intermediate: "INTERMEDIATE",
    Advanced: "ADVANCED",
  };
  return levels[level] ?? "ALL LEVELS";
}

export default function WishlistPage() {
  const router = useRouter();
  const { activeProfile } = useProfileStore();
  const { data, isLoading, isError } = useWishlist(activeProfile?.id ?? "");
  const removeMutation = useRemoveFromWishlistMutation();

  const handleRemove = (courseId: string) => {
    if (!activeProfile) return;

    removeMutation.mutate({
      learnerProfileId: activeProfile.id,
      courseId,
    });
  };

  return (
    <div className="p-6 md:p-10 space-y-8">
      {/* Header */}
      <div>
        <h1
          className="text-3xl md:text-[40px] text-[#0C1F33] mb-2"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          Wishlist
        </h1>
        <p className="text-base text-[#64748B]">
          {data?.total ?? 0} courses saved for later
        </p>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-red-600 font-medium">Failed to load wishlist</p>
          <button
            onClick={() => window.location.reload()}
            className="text-[#22A146] font-semibold hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && data?.items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Heart className="w-16 h-16 text-gray-300" strokeWidth={1.5} />
          <p className="text-lg text-[#64748B]">Your wishlist is empty</p>
          <button
            onClick={() => router.push("/courses")}
            className="text-[#22A146] font-semibold hover:underline"
          >
            Browse courses
          </button>
        </div>
      )}

      {/* Wishlist grid */}
      {!isLoading && !isError && data && data.items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {data.items.map((item) => (
            <div
              key={item.wishlistItemId}
              onClick={() => router.push(`/courses/${item.course.id}`)}
              className="bg-white border border-[#E3E8EF] rounded-xl overflow-hidden hover:shadow-md transition-shadow group cursor-pointer flex flex-col h-full"
            >
              {/* Thumbnail */}
              <div className="relative h-[180px] bg-gradient-to-br from-[#12304E] to-[#2a5070] overflow-hidden">
                {item.course.thumbnailUrl ? (
                  <Image
                    src={item.course.thumbnailUrl}
                    alt={item.course.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/30 text-sm">
                    Course Image
                  </div>
                )}
                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(item.course.id);
                  }}
                  disabled={removeMutation.isPending}
                  aria-label="Remove from wishlist"
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4 text-red-600" strokeWidth={2} />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 pt-3 flex flex-col gap-2 flex-grow">
                {/* Badges */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[#0C1F33] bg-white border border-[#E3E8EF] px-2 py-0.5 rounded">
                    {getLevelBadge(item.course.level)}
                  </span>
                </div>

                {/* Title */}
                <h3
                  className="text-lg text-[#0C1F33] leading-6 min-h-[48px]"
                  style={{ fontFamily: "'Marcellus', serif" }}
                >
                  {item.course.title}
                </h3>

                {/* Instructor */}
                <p className="text-[15px] text-[#475569]">
                  {item.course.instructor.name}
                </p>

                {/* Meta */}
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-[#475569]">
                    {item.course.category}
                  </span>
                  <span className="flex items-center gap-1 text-[13px]">
                    <Star className="w-3 h-3 text-[#B8912F] fill-[#B8912F]" />
                    <span className="text-[#0C1F33]">
                      {item.course.averageRating ?? "New"}
                    </span>
                  </span>
                </div>

                {/* Age badge */}
                <span className="self-start text-[11px] font-bold text-[#0C1F33] border border-[#E3E8EF] px-2 py-0.5 rounded-full">
                  {getAgeBadge(item.course.minimumAge)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
