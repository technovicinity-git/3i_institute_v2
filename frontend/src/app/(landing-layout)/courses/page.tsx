"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Star, ChevronDown, X } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { useCourses } from "@/hooks/use-courses";
import type { Course, CourseFilters, SortOption } from "@/types/course";

// ─── Constants ───────────────────────────────────────────────────────────────

const categories = [
  "Islamic Studies",
  "Qur'anic Arabic",
  "Health Sciences",
  "Fiqh",
  "Hadith",
];

const levels = ["Beginner", "Intermediate", "Advanced"];
const formats = ["self-paced", "live", "hybrid"];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "popularity", label: "Popularity" },
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Highest Rated" },
  { value: "title", label: "Title A-Z" },
];

// ─── Components (unchanged except CourseCard uses API data) ──────────────────

function LevelBadge({ level }: { level: string }) {
  const levelMap: Record<string, { bg: string; text: string; label: string }> =
    {
      "1": { bg: "bg-[#22A146]/10", text: "text-[#22A146]", label: "BEGINNER" },
      "2": {
        bg: "bg-[#2563BA]/10",
        text: "text-[#2563BA]",
        label: "INTERMEDIATE",
      },
      "3": { bg: "bg-[#7C3AED]/10", text: "text-[#7C3AED]", label: "ADVANCED" },
      Beginner: {
        bg: "bg-[#22A146]/10",
        text: "text-[#22A146]",
        label: "BEGINNER",
      },
      Intermediate: {
        bg: "bg-[#2563BA]/10",
        text: "text-[#2563BA]",
        label: "INTERMEDIATE",
      },
      Advanced: {
        bg: "bg-[#7C3AED]/10",
        text: "text-[#7C3AED]",
        label: "ADVANCED",
      },
    };

  const config = levelMap[level] ?? levelMap["Beginner"];

  return (
    <span
      className={`text-[11px] font-semibold px-2 py-1 rounded ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
}

function CourseCard({ course }: { course: Course }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="relative h-[160px] bg-gray-200">
        {course.thumbnailUrl ? (
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Course Image
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-3">
          <LevelBadge level={course.level} />
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium text-[#12304E]">
              {course.averageRating ?? "New"}
            </span>
            {course.ratingCount > 0 && (
              <span className="text-xs text-slate-400">
                ({course.ratingCount})
              </span>
            )}
          </div>
        </div>

        <h3 className="text-lg font-semibold text-[#12304E] leading-snug mb-2 line-clamp-2">
          {course.title}
        </h3>

        <p className="text-[13px] text-slate-500 mb-3">
          {course.instructor.name}
        </p>

        <div className="mt-auto">
          <Link
            href={`/courses/${course.id}`}
            className="text-sm font-medium text-[#22A146] hover:underline"
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function CourseCatalogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("popularity");
  const [currentPage, setCurrentPage] = useState(1);
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
    level: selectedLevels.length > 0 ? selectedLevels.join(",") : undefined,
    format: selectedFormats.length > 0 ? selectedFormats.join(",") : undefined,
    sortBy,
  };

  const { data, isLoading, isFetching } = useCourses(filters);

  // Active filters for chips
  const activeFilters = [
    ...selectedCategories.map((c) => ({ label: c, key: `cat-${c}` })),
    ...selectedLevels.map((l) => ({ label: l, key: `level-${l}` })),
    ...selectedFormats.map((f) => ({ label: f, key: `format-${f}` })),
  ];

  const toggleFilter = (
    arr: string[],
    setArr: (v: string[]) => void,
    val: string,
  ) => {
    if (arr.includes(val)) setArr(arr.filter((v) => v !== val));
    else setArr([...arr, val]);
    setCurrentPage(1);
  };

  const removeFilter = (key: string) => {
    if (key.startsWith("cat-")) {
      const val = key.replace("cat-", "");
      setSelectedCategories(selectedCategories.filter((c) => c !== val));
    } else if (key.startsWith("level-")) {
      const val = key.replace("level-", "");
      setSelectedLevels(selectedLevels.filter((l) => l !== val));
    } else if (key.startsWith("format-")) {
      const val = key.replace("format-", "");
      setSelectedFormats(selectedFormats.filter((f) => f !== val));
    }
    setCurrentPage(1);
  };

  const clearAll = () => {
    setSelectedCategories([]);
    setSelectedLevels([]);
    setSelectedFormats([]);
    setSortBy("popularity");
    setCurrentPage(1);
    setSearchQuery("");
    setDebouncedSearch("");
  };

  return (
    <div className=" bg-white">
      {/* Page Header */}
      <section className="bg-[#FBF9F4] px-6 md:px-[120px] py-10 md:py-16">
        <div className="max-w-[1200px] mx-auto">
          <h1 className="text-4xl md:text-[56px] font-bold text-[#12304E] leading-tight mb-2">
            Courses
          </h1>
          <p className="text-lg text-[#0C1F33] mb-8">
            140 courses across Islamic studies, Arabic, and health sciences.
          </p>

          <div className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 px-5 py-4 max-w-[1200px]">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses, instructors, pathways..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 text-base text-gray-500 placeholder:text-gray-400 outline-none bg-transparent"
            />
            {isFetching && (
              <div className="w-4 h-4 border-2 border-green border-t-transparent rounded-full animate-spin" />
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="bg-[#FBF9F4] px-6 md:px-[120px] py-6 md:py-10">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row gap-6 md:gap-10">
          {/* Sidebar */}
          <aside className="w-full md:w-[280px] shrink-0 bg-white rounded-xl p-6 h-fit sticky top-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-[22px] font-bold text-[#12304E]">Filters</h2>
              <button
                onClick={clearAll}
                className="text-sm text-[#22A146] hover:underline"
              >
                Clear all
              </button>
            </div>

            {/* Category */}
            <div className="mb-6">
              <h3 className="text-[13px] font-semibold text-[#12304E] uppercase tracking-wide mb-4">
                Category
              </h3>
              <div className="space-y-3">
                {categories.map((cat) => (
                  <FilterCheckbox
                    key={cat}
                    label={cat}
                    checked={selectedCategories.includes(cat)}
                    onChange={() =>
                      toggleFilter(
                        selectedCategories,
                        setSelectedCategories,
                        cat,
                      )
                    }
                  />
                ))}
              </div>
            </div>

            <hr className="border-gray-200 my-6" />

            {/* Level */}
            <div className="mb-6">
              <h3 className="text-[13px] font-semibold text-[#12304E] uppercase tracking-wide mb-4">
                Level
              </h3>
              <div className="space-y-3">
                {levels.map((level) => (
                  <FilterCheckbox
                    key={level}
                    label={level}
                    checked={selectedLevels.includes(level)}
                    onChange={() =>
                      toggleFilter(selectedLevels, setSelectedLevels, level)
                    }
                  />
                ))}
              </div>
            </div>

            <hr className="border-gray-200 my-6" />

            {/* Format */}
            <div className="mb-6">
              <h3 className="text-[13px] font-semibold text-[#12304E] uppercase tracking-wide mb-4">
                Format
              </h3>
              <div className="space-y-3">
                {formats.map((format) => (
                  <FilterCheckbox
                    key={format}
                    label={format.charAt(0).toUpperCase() + format.slice(1)}
                    checked={selectedFormats.includes(format)}
                    onChange={() =>
                      toggleFilter(selectedFormats, setSelectedFormats, format)
                    }
                  />
                ))}
              </div>
            </div>
          </aside>

          {/* Course Grid */}
          <main className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 flex-wrap gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[15px] font-medium text-[#12304E]">
                  {isLoading
                    ? "Loading..."
                    : `Showing ${data?.courses?.length ?? 0} of ${data?.total ?? 0} courses`}
                </span>
                {activeFilters.map((filter) => (
                  <span
                    key={filter.key}
                    className="inline-flex items-center gap-1.5 bg-[#22A146] text-white text-xs font-medium px-2.5 py-1 rounded-full"
                  >
                    {filter.label}
                    <button
                      onClick={() => removeFilter(filter.key)}
                      className="hover:opacity-80"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center gap-1.5 text-sm text-[#12304E] bg-white border border-gray-200 rounded-md px-3 py-2 hover:bg-gray-50"
                >
                  Sort by: {sortOptions.find((s) => s.value === sortBy)?.label}
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showSortDropdown && (
                  <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 min-w-[180px]">
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
                            ? "text-[#22A146] font-semibold"
                            : "text-[#12304E]"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl h-[300px] animate-pulse"
                  />
                ))}
              </div>
            ) : !data || !data.courses || data.courses.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-lg text-gray-500">
                  No courses found matching your filters.
                </p>
                <button
                  onClick={clearAll}
                  className="mt-4 text-[#22A146] font-medium hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {data?.courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={data.totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </main>
        </div>
      </section>
    </div>
  );
}

// ─── Filter Checkbox (needed above) ──────────────────────────────────────────

function FilterCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <div
        className={`w-[18px] h-[18px] rounded border-2 flex items-center justify-center transition-colors ${
          checked
            ? "bg-[#22A146] border-[#22A146]"
            : "border-gray-300 group-hover:border-gray-400"
        }`}
        onClick={onChange}
      >
        {checked && (
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
      <span className="text-sm text-[#0C1F33]">{label}</span>
    </label>
  );
}
