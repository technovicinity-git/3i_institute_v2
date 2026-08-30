"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  Star,
  Heart,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useCourses } from "@/hooks/use-courses";
import { useAuthStore } from "@/stores/auth-store";
import { useProfileStore } from "@/stores/profile-store";
import type { Course, CourseFilters, SortOption } from "@/types/course";
import {
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} from "@/hooks/use-wishlist";

const AGE_BANDS = ["5-8", "9-12", "13-15", "16-17", "18+", "All ages"];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "popularity", label: "Relevance" },
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Highest Rated" },
  { value: "title", label: "Title A-Z" },
];

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

function Checkbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange?: () => void;
}) {
  return (
    <button type="button" onClick={onChange} className="shrink-0">
      {checked ? (
        <div className="w-[18px] h-[18px] rounded bg-[#2D6CDF] flex items-center justify-center">
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      ) : (
        <div className="w-[18px] h-[18px] rounded border border-[#E3E8EF] bg-white" />
      )}
    </button>
  );
}

function CourseCard({ course }: { course: Course }) {
  const router = useRouter();
  const { activeProfile } = useProfileStore();
  const addMutation = useAddToWishlistMutation();
  const removeMutation = useRemoveFromWishlistMutation();
  const [liked, setLiked] = useState(course.wishlisted);

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!activeProfile) {
      toast.error("Please login and select a profile first");
      return;
    }

    const newLiked = !liked;
    setLiked(newLiked);

    if (newLiked) {
      addMutation.mutate({
        learnerProfileId: activeProfile.id,
        courseId: course.id,
      });
    } else {
      removeMutation.mutate({
        learnerProfileId: activeProfile.id,
        courseId: course.id,
      });
    }
  };

  const handleClick = () => {
    router.push(`/courses/${course.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white border border-[#E3E8EF] rounded-xl overflow-hidden hover:shadow-md transition-shadow group cursor-pointer flex flex-col h-full"
    >
      {/* Thumbnail */}
      <div className="relative h-[180px] bg-gradient-to-br from-[#12304E] to-[#2a5070] overflow-hidden">
        {course.thumbnailUrl ? (
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/30 text-sm">
            Course Image
          </div>
        )}
        <button
          onClick={handleWishlist}
          aria-label="Toggle wishlist"
          className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm transition-opacity ${
            liked ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <Heart
            className={`w-4 h-4 ${liked ? "text-[#2D6CDF] fill-[#2D6CDF]" : "text-[#0C1F33]"}`}
            strokeWidth={2}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 pt-3 flex flex-col gap-2 flex-grow">
        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-[#0C1F33] bg-white border border-[#E3E8EF] px-2 py-0.5 rounded">
            {getLevelBadge(course.level)}
          </span>
          {course.enrolled && (
            <span className="text-[11px] font-bold text-white bg-[#22A146] px-2 py-0.5 rounded">
              ENROLLED
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-marcellus text-lg text-[#0C1F33] leading-6 min-h-[48px]">
          {course.title}
        </h3>

        {/* Instructor */}
        <p className="text-[15px] text-[#475569]">{course.instructor.name}</p>

        {/* Meta row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] text-[#475569]">
              {course.category}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1 text-[13px]">
              <Star className="w-3 h-3 text-[#B8912F] fill-[#B8912F]" />
              <span className="text-[#0C1F33]">
                {course.averageRating ?? "New"}
              </span>
              {course.ratingCount > 0 && (
                <span className="text-[#475569]">({course.ratingCount})</span>
              )}
            </span>
          </div>
        </div>

        {/* Age badge */}
        <span className="self-start text-[11px] font-bold text-[#0C1F33] border border-[#E3E8EF] px-2 py-0.5 rounded-full">
          {getAgeBadge(course.minimumAge)}
        </span>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  const { user } = useAuthStore();
  const { activeProfile } = useProfileStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedAgeBands, setSelectedAgeBands] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("popularity");
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filters: CourseFilters = {
    page: currentPage,
    limit: 9,
    search: debouncedSearch || undefined,
    category:
      selectedCategories.length > 0 ? selectedCategories.join(",") : undefined,
    format: selectedTypes.length > 0 ? selectedTypes.join(",") : undefined,
    sortBy,
    ...(activeProfile?.id ? { learnerProfileId: activeProfile.id } : {}),
  };

  const { data, isLoading, isFetching } = useCourses(filters);

  const toggleFilter = (
    arr: string[],
    setArr: (v: string[]) => void,
    val: string,
  ) => {
    if (arr.includes(val)) setArr(arr.filter((v) => v !== val));
    else setArr([...arr, val]);
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedTypes([]);
    setSelectedLanguages([]);
    setSelectedAgeBands([]);
    setSortBy("popularity");
    setSearchQuery("");
    setDebouncedSearch("");
    setCurrentPage(1);
  };

  return (
    <div
      className="min-h-screen bg-[#FBF9F4]"
      style={{ fontFamily: "'Figtree', sans-serif" }}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-9 pb-12">
        {/* Title */}
        <h1
          className="text-[32px] sm:text-[40px] text-[#0C1F33] mb-6"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          Courses
        </h1>

        {/* Search Bar */}
        <div className="flex items-center gap-3 bg-white border border-[#E3E8EF] rounded-lg px-4 py-3.5 mb-6">
          <Search
            className="w-[18px] h-[18px] text-[#475569] shrink-0"
            strokeWidth={2}
          />
          <input
            type="text"
            placeholder="Search courses, instructors, topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-base text-[#0C1F33] placeholder:text-[#475569] outline-none"
          />
          {isFetching && (
            <div className="w-4 h-4 border-2 border-[#2D6CDF] border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {/* Sort Row */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="text-base text-[#475569]">
              {isLoading ? "Loading..." : `${data?.total ?? 0} courses`}
            </span>
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-1.5 text-sm font-semibold text-[#0C1F33] border border-[#E3E8EF] rounded-lg px-3 py-1.5"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-1.5 text-sm text-[#475569]"
            >
              Sort by:{" "}
              <span className="font-semibold text-[#0C1F33]">
                {sortOptions.find((s) => s.value === sortBy)?.label}
              </span>
              <ChevronDown className="w-4 h-4 text-[#0C1F33]" />
            </button>
            {showSortDropdown && (
              <div className="absolute right-0 mt-1 bg-white border border-[#E3E8EF] rounded-lg shadow-lg z-20 min-w-[180px]">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value);
                      setShowSortDropdown(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 ${
                      sortBy === option.value
                        ? "text-[#2D6CDF] font-semibold"
                        : "text-[#0C1F33]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="flex gap-6">
          {/* Filter Panel - Desktop */}
          <div className="hidden lg:block w-[280px] shrink-0 self-start sticky top-6">
            <FilterPanel
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              selectedTypes={selectedTypes}
              setSelectedTypes={setSelectedTypes}
              selectedLanguages={selectedLanguages}
              setSelectedLanguages={setSelectedLanguages}
              selectedAgeBands={selectedAgeBands}
              setSelectedAgeBands={setSelectedAgeBands}
              toggleFilter={toggleFilter}
              clearAllFilters={clearAllFilters}
            />
          </div>

          {/* Mobile Filter Overlay */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => setMobileFiltersOpen(false)}
              />
              <div className="absolute inset-y-0 left-0 w-[320px] max-w-[85vw] overflow-y-auto bg-[#FBF9F4] p-4">
                <FilterPanel
                  selectedCategories={selectedCategories}
                  setSelectedCategories={setSelectedCategories}
                  selectedTypes={selectedTypes}
                  setSelectedTypes={setSelectedTypes}
                  selectedLanguages={selectedLanguages}
                  setSelectedLanguages={setSelectedLanguages}
                  selectedAgeBands={selectedAgeBands}
                  setSelectedAgeBands={setSelectedAgeBands}
                  toggleFilter={toggleFilter}
                  clearAllFilters={clearAllFilters}
                  onClose={() => setMobileFiltersOpen(false)}
                />
              </div>
            </div>
          )}

          {/* Right Column */}
          <div className="flex-1 min-w-0 flex flex-col gap-8">
            {/* Loading */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl h-[320px] animate-pulse"
                  />
                ))}
              </div>
            ) : data?.courses.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-lg text-[#475569]">
                  No courses found matching your filters.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="mt-4 text-[#157A34] font-semibold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-[34px]">
                {data?.courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className="flex justify-center">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="w-10 h-10 flex items-center justify-center rounded-md bg-white border border-[#E3E8EF] hover:bg-gray-50 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4 text-[#0C1F33]" />
                  </button>

                  {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 flex items-center justify-center rounded-md text-[15px] font-medium transition-colors ${
                          currentPage === page
                            ? "bg-[#0C1F33] text-white"
                            : "bg-white border border-[#E3E8EF] text-[#0C1F33] hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    ),
                  )}

                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(data.totalPages, currentPage + 1))
                    }
                    disabled={currentPage === data.totalPages}
                    className="w-10 h-10 flex items-center justify-center rounded-md bg-white border border-[#E3E8EF] hover:bg-gray-50 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4 text-[#0C1F33]" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Filter Panel ───

interface FilterPanelProps {
  selectedCategories: string[];
  setSelectedCategories: (v: string[]) => void;
  selectedTypes: string[];
  setSelectedTypes: (v: string[]) => void;
  selectedLanguages: string[];
  setSelectedLanguages: (v: string[]) => void;
  selectedAgeBands: string[];
  setSelectedAgeBands: (v: string[]) => void;
  toggleFilter: (
    arr: string[],
    setArr: (v: string[]) => void,
    val: string,
  ) => void;
  clearAllFilters: () => void;
  onClose?: () => void;
}

function FilterPanel({
  selectedCategories,
  setSelectedCategories,
  selectedTypes,
  setSelectedTypes,
  selectedLanguages,
  setSelectedLanguages,
  selectedAgeBands,
  setSelectedAgeBands,
  toggleFilter,
  clearAllFilters,
  onClose,
}: FilterPanelProps) {
  const categories = [
    "Islamic Studies",
    "Language",
    "Art & Culture",
    "Science",
    "History",
    "Business",
    "Mathematics",
    "Language Arts",
  ];
  const courseTypes = ["self-paced", "live"];
  const languages = ["en", "bn", "hi", "ur", "ar"];
  const languageLabels: Record<string, string> = {
    en: "English",
    bn: "Bangla",
    hi: "Hindi",
    ur: "Urdu",
    ar: "Arabic",
  };

  return (
    <div className="bg-white border border-[#E3E8EF] rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-base font-semibold text-[#0C1F33]">Filters</span>
        <div className="flex items-center gap-3">
          <button
            onClick={clearAllFilters}
            className="text-sm font-semibold text-[#157A34]"
          >
            Clear all
          </button>
          {onClose && (
            <button onClick={onClose} className="lg:hidden">
              <X className="w-5 h-5 text-[#475569]" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 pt-4">
        {/* Category */}
        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-bold text-[#475569] uppercase">
            Category
          </span>
          {categories.map((cat) => (
            <label
              key={cat}
              className="flex items-center gap-2.5 py-1 cursor-pointer"
            >
              <Checkbox
                checked={selectedCategories.includes(cat)}
                onChange={() =>
                  toggleFilter(selectedCategories, setSelectedCategories, cat)
                }
              />
              <span className="text-[15px] text-[#0C1F33]">{cat}</span>
            </label>
          ))}
        </div>

        <hr className="border-[#E3E8EF]" />

        {/* Course Type */}
        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-bold text-[#475569] uppercase">
            Course Type
          </span>
          {courseTypes.map((ct) => (
            <label
              key={ct}
              className="flex items-center gap-2.5 py-1 cursor-pointer"
            >
              <Checkbox
                checked={selectedTypes.includes(ct)}
                onChange={() =>
                  toggleFilter(selectedTypes, setSelectedTypes, ct)
                }
              />
              <span className="text-[15px] text-[#0C1F33]">
                {ct === "self-paced" ? "Regular" : "Online Class"}
              </span>
            </label>
          ))}
        </div>

        <hr className="border-[#E3E8EF]" />

        {/* Age Band */}
        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-bold text-[#475569] uppercase">
            Age Band
          </span>
          <div className="flex flex-wrap gap-1.5">
            {AGE_BANDS.map((age) => (
              <button
                key={age}
                onClick={() =>
                  toggleFilter(selectedAgeBands, setSelectedAgeBands, age)
                }
                className={`px-2.5 py-1 text-[13px] font-medium rounded-full border transition-colors ${
                  selectedAgeBands.includes(age)
                    ? "bg-[#0C1F33] text-white border-[#0C1F33]"
                    : "text-[#0C1F33] bg-white border-[#E3E8EF] hover:bg-[#F5F0E8]"
                }`}
              >
                {age}
              </button>
            ))}
          </div>
        </div>

        <hr className="border-[#E3E8EF]" />

        {/* Language */}
        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-bold text-[#475569] uppercase">
            Language
          </span>
          {languages.map((lang) => (
            <label
              key={lang}
              className="flex items-center gap-2.5 py-1 cursor-pointer"
            >
              <Checkbox
                checked={selectedLanguages.includes(lang)}
                onChange={() =>
                  toggleFilter(selectedLanguages, setSelectedLanguages, lang)
                }
              />
              <span className="text-[15px] text-[#0C1F33]">
                {languageLabels[lang]}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
