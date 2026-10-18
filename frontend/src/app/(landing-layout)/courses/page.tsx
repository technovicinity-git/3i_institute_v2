"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Star,
  Heart,
  ChevronDown,
  SlidersHorizontal,
  X,
  BookOpen,
  Users,
} from "lucide-react";
import { useCourses } from "@/hooks/use-courses";
import { useCategories } from "@/hooks/use-categories";
import { useProfileStore } from "@/stores/profile-store";
import { useAuthStore } from "@/stores/auth-store";
import { calculateAge } from "@/lib/date-utils";
import {
  useWishlistToggle,
} from "@/hooks/use-wishlist";
import type { Course, CourseFilters, SortOption } from "@/types/course";
import { Pagination } from "@/components/ui/pagination";
import { useTranslations } from "next-intl";
import { levelKey } from "@/lib/course-level";
import { localeNames, locales } from "@/i18n/config";

// Filter values sent to the API; "All ages" is the backend's own band name.
const AGE_BANDS = ["5-8", "9-12", "13-15", "16-17", "18+", "All ages"];

// Lowest minimum age in each band (the API matches bands on a course's
// minimum age). A band whose lowest age is above the learner's age can't
// hold a course they're shown, so it's greyed out for them.
const AGE_BAND_MIN: Record<string, number> = {
  "5-8": 5,
  "9-12": 9,
  "13-15": 13,
  "16-17": 16,
  "18+": 18,
  "All ages": 0,
};

const bandFitsAge = (band: string, age: number | null) =>
  age === null || (AGE_BAND_MIN[band] ?? 0) <= age;

const SORT_OPTIONS: SortOption[] = ["popularity", "newest", "rating", "title"];

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
  const t = useTranslations("courses");
  const tCommon = useTranslations("common");
  const tLevel = useTranslations("courseLevel");
  const tWishlist = useTranslations("wishlist");
  const ageBadge =
    course.maximumAge == null || course.maximumAge >= 99
      ? tCommon("agesFrom", { min: course.minimumAge })
      : tCommon("ageRange", { min: course.minimumAge, max: course.maximumAge });
  const router = useRouter();
  const { wishlisted: liked, toggle, pending } = useWishlistToggle(course.id);

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    void toggle();
  };

  return (
    <div
      onClick={() => router.push(`/courses/${course.id}`)}
      className="bg-white border border-[#E3E8EF] rounded-xl overflow-hidden hover:shadow-md transition-shadow group cursor-pointer flex flex-col h-full"
    >
      {/* Thumbnail — 16:9 aspect ratio */}
      <div className="relative w-full aspect-video bg-gradient-to-br from-[#12304E] to-[#2a5070] overflow-hidden">
        {course.thumbnailUrl ? (
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/30">
            <BookOpen className="w-10 h-10" />
          </div>
        )}

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          disabled={pending}
          aria-label={liked ? tWishlist("remove") : tWishlist("add")}
          aria-pressed={liked}
          className={`absolute top-3 end-3 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm transition-opacity ${
            liked ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <Heart
            className={`w-4 h-4 ${
              liked ? "text-[#2D6CDF] fill-[#2D6CDF]" : "text-[#0C1F33]"
            }`}
            strokeWidth={2}
          />
        </button>

        {/* Enrolled badge */}
        {course.enrolled && (
          <span className="absolute top-3 start-3 text-[10px] font-bold text-white bg-[#22A146] px-2 py-1 rounded">
            {t("enrolled")}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-grow">
        {/* Level badge */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-[#0C1F33] bg-white border border-[#E3E8EF] px-2 py-0.5 rounded">
            {tLevel(levelKey(course.level))}
          </span>
        </div>

        {/* Title — max 2 lines */}
        <h3
          className="text-lg text-[#0C1F33] leading-6 line-clamp-2 min-h-[48px]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {course.title}
        </h3>

        {/* Instructor */}
        <p className="text-[15px] text-[#475569] truncate">
          {course.instructor.name}
        </p>

        {/* Category + Rating row */}
        <div className="flex items-center justify-between gap-2 mt-auto">
          <span className="text-[13px] text-[#475569] truncate">
            {course.category?.name ?? t("uncategorized")}
          </span>
          <span className="flex items-center gap-1 text-[13px] shrink-0">
            <Star className="w-3 h-3 text-[#B8912F] fill-[#B8912F]" />
            <span className="text-[#0C1F33] font-medium">
              {course.averageRating ?? tCommon("newRating")}
            </span>
            {course.ratingCount > 0 && (
              <span className="text-[#94A3B8]">({course.ratingCount})</span>
            )}
          </span>
        </div>

        {/* Age badge */}
        <span
          title={tCommon("recommendedAge")}
          className="self-start inline-flex items-center gap-1 text-[11px] font-semibold text-[#9A7624] bg-[#F9F6F0] px-2 py-0.5 rounded-full"
        >
          <Users className="w-3 h-3" />
          {ageBadge}
        </span>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
        </div>
      }
    >
      <CoursesFromUrl />
    </Suspense>
  );
}

// Remount when `?category=` changes (e.g. a footer link clicked while already
// on this page) so the filters pick up the new category.
function CoursesFromUrl() {
  const category = useSearchParams().get("category") ?? "";
  return <CoursesContent key={category} initialCategory={category} />;
}

function CoursesContent({ initialCategory }: { initialCategory: string }) {
  const t = useTranslations("courses");
  const tCommon = useTranslations("common");
  const { activeProfile } = useProfileStore();
  const signedIn = !!useAuthStore((state) => state.user);
  // The API lists only courses for this learner's age; say so, so a parent
  // knows why some courses aren't shown.
  const ageFiltered = signedIn && !!activeProfile;
  const learnerAge =
    ageFiltered && activeProfile
      ? calculateAge(activeProfile.dateOfBirth)
      : null;

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  // `?category=id1,id2` preselects categories (links from the home page).
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    () => initialCategory.split(",").filter(Boolean),
  );
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedAgeBands, setSelectedAgeBands] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("popularity");
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Fetch dynamic categories
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [
    selectedCategories,
    selectedTypes,
    selectedLanguages,
    selectedAgeBands,
    sortBy,
  ]);

  // A band picked before switching to a younger learner is ignored.
  const activeAgeBands = selectedAgeBands.filter((band) =>
    bandFitsAge(band, learnerAge),
  );

  const filters: CourseFilters = {
    page: currentPage,
    limit: 12,
    search: debouncedSearch || undefined,
    category:
      selectedCategories.length > 0 ? selectedCategories.join(",") : undefined,
    format: selectedTypes.length > 0 ? selectedTypes.join(",") : undefined,
    language:
      selectedLanguages.length > 0 ? selectedLanguages.join(",") : undefined,
    ageBand: activeAgeBands.length > 0 ? activeAgeBands.join(",") : undefined,
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
    <div className="min-h-screen bg-[#FBF9F4] font-sans">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-9 pb-12">
        <h1
          className="text-[32px] sm:text-[40px] text-[#0C1F33] mb-6"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {t("title")}
        </h1>
        {ageFiltered && activeProfile && (
          <p className="-mt-4 mb-6 text-sm text-[#475569]">
            {t("forLearner", {
              name: activeProfile.displayName,
              age: calculateAge(activeProfile.dateOfBirth),
            })}
          </p>
        )}

        {/* Search */}
        <div className="flex items-center gap-3 bg-white border border-[#E3E8EF] rounded-lg px-4 py-3.5 mb-6">
          <Search className="w-[18px] h-[18px] text-[#475569] shrink-0" />
          <input
            type="text"
            placeholder={t("search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-base text-[#0C1F33] placeholder:text-[#475569] outline-none"
          />
          {isFetching && (
            <div className="w-4 h-4 border-2 border-[#2D6CDF] border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {/* Sort row */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="text-base text-[#475569]">
              {isLoading
                ? tCommon("loading")
                : t("count", { count: data?.total ?? 0 })}
            </span>
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-1.5 text-sm font-semibold text-[#0C1F33] border border-[#E3E8EF] rounded-lg px-3 py-1.5"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {t("filters")}
            </button>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-1.5 text-sm text-[#475569]"
            >
              {t("sortBy")}{" "}
              <span className="font-semibold text-[#0C1F33]">
                {t(`sort.${sortBy}`)}
              </span>
              <ChevronDown className="w-4 h-4 text-[#0C1F33]" />
            </button>
            {showSortDropdown && (
              <div className="absolute end-0 mt-1 bg-white border border-[#E3E8EF] rounded-lg shadow-lg z-20 min-w-[180px]">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setSortBy(option);
                      setShowSortDropdown(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-start px-4 py-2.5 text-sm hover:bg-gray-50 ${
                      sortBy === option
                        ? "text-[#2D6CDF] font-semibold"
                        : "text-[#0C1F33]"
                    }`}
                  >
                    {t(`sort.${option}`)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Layout */}
        <div className="flex gap-6">
          {/* Desktop filters */}
          <div className="hidden lg:block w-[280px] shrink-0 self-start sticky top-6">
            <FilterPanel
              categories={categories ?? []}
              categoriesLoading={categoriesLoading}
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              selectedTypes={selectedTypes}
              setSelectedTypes={setSelectedTypes}
              selectedLanguages={selectedLanguages}
              setSelectedLanguages={setSelectedLanguages}
              selectedAgeBands={selectedAgeBands}
              learner={
                learnerAge !== null && activeProfile
                  ? { name: activeProfile.displayName, age: learnerAge }
                  : null
              }
              setSelectedAgeBands={setSelectedAgeBands}
              toggleFilter={toggleFilter}
              clearAllFilters={clearAllFilters}
            />
          </div>

          {/* Mobile filters */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => setMobileFiltersOpen(false)}
              />
              <div className="absolute inset-y-0 start-0 w-[320px] max-w-[85vw] overflow-y-auto bg-[#FBF9F4] p-4">
                <FilterPanel
                  categories={categories ?? []}
                  categoriesLoading={categoriesLoading}
                  selectedCategories={selectedCategories}
                  setSelectedCategories={setSelectedCategories}
                  selectedTypes={selectedTypes}
                  setSelectedTypes={setSelectedTypes}
                  selectedLanguages={selectedLanguages}
                  setSelectedLanguages={setSelectedLanguages}
                  selectedAgeBands={selectedAgeBands}
                  learner={
                    learnerAge !== null && activeProfile
                      ? { name: activeProfile.displayName, age: learnerAge }
                      : null
                  }
                  setSelectedAgeBands={setSelectedAgeBands}
                  toggleFilter={toggleFilter}
                  clearAllFilters={clearAllFilters}
                  onClose={() => setMobileFiltersOpen(false)}
                />
              </div>
            </div>
          )}

          {/* Cards */}
          <div className="flex-1 min-w-0 flex flex-col gap-8">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl h-[320px] animate-pulse"
                  />
                ))}
              </div>
            ) : data?.courses.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-lg text-[#475569]">
                  {t("noResults")}
                </p>
                <button
                  onClick={clearAllFilters}
                  className="mt-4 text-[#157A34] font-semibold hover:underline"
                >
                  {t("clearAllFilters")}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {data?.courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}

            <Pagination
              page={currentPage}
              pageSize={12}
              total={data?.total ?? 0}
              onPageChange={setCurrentPage}
              itemLabel={t("itemLabel")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Filter Panel ───

interface FilterPanelProps {
  categories: Array<{ id: string; name: string; courseCount: number }>;
  categoriesLoading: boolean;
  selectedCategories: string[];
  setSelectedCategories: (v: string[]) => void;
  selectedTypes: string[];
  setSelectedTypes: (v: string[]) => void;
  selectedLanguages: string[];
  setSelectedLanguages: (v: string[]) => void;
  selectedAgeBands: string[];
  /** The active learner, when the list is limited to their age. */
  learner: { name: string; age: number } | null;
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
  categories,
  categoriesLoading,
  selectedCategories,
  setSelectedCategories,
  selectedTypes,
  setSelectedTypes,
  selectedLanguages,
  setSelectedLanguages,
  selectedAgeBands,
  setSelectedAgeBands,
  learner,
  toggleFilter,
  clearAllFilters,
  onClose,
}: FilterPanelProps) {
  const t = useTranslations("courses");
  const tCommon = useTranslations("common");
  const courseTypes = ["self-paced", "live"];
  const ageBandLabel = (band: string) =>
    band === "All ages"
      ? tCommon("allAges")
      : band.endsWith("+")
        ? tCommon("agesFrom", { min: band.slice(0, -1) })
        : tCommon("ageRange", {
            min: band.split("-")[0],
            max: band.split("-")[1],
          });

  return (
    <div className="bg-white border border-[#E3E8EF] rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-base font-semibold text-[#0C1F33]">{t("filters")}</span>
        <div className="flex items-center gap-3">
          <button
            onClick={clearAllFilters}
            className="text-sm font-semibold text-[#157A34]"
          >
            {t("clearAll")}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden"
              aria-label={t("closeFilters")}
            >
              <X className="w-5 h-5 text-[#475569]" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 pt-4">
        {/* Category — dynamic */}
        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-bold text-[#475569] uppercase">
            {t("category")}
          </span>
          {categoriesLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-5 bg-gray-100 rounded animate-pulse"
                />
              ))}
            </div>
          ) : (
            categories.map((cat) => (
              <label
                key={cat.id}
                className="flex items-center gap-2.5 py-1 cursor-pointer"
              >
                <Checkbox
                  checked={selectedCategories.includes(cat.id)}
                  onChange={() =>
                    toggleFilter(
                      selectedCategories,
                      setSelectedCategories,
                      cat.id,
                    )
                  }
                />
                <span className="text-[15px] text-[#0C1F33] flex-1">
                  {cat.name}
                </span>
                <span className="text-[13px] text-[#475569]">
                  ({cat.courseCount})
                </span>
              </label>
            ))
          )}
        </div>

        <hr className="border-[#E3E8EF]" />

        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-bold text-[#475569] uppercase">
            {t("courseType")}
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
                {ct === "self-paced" ? t("typeRegular") : t("typeLive")}
              </span>
            </label>
          ))}
        </div>

        <hr className="border-[#E3E8EF]" />

        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-bold text-[#475569] uppercase">
            {t("ageBand")}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {AGE_BANDS.map((age) => {
              const fits = bandFitsAge(age, learner?.age ?? null);
              return (
                <button
                  key={age}
                  onClick={() =>
                    toggleFilter(selectedAgeBands, setSelectedAgeBands, age)
                  }
                  disabled={!fits}
                  title={
                    fits || !learner
                      ? undefined
                      : t("bandNotForAge", { name: learner.name })
                  }
                  className={`px-2.5 py-1 text-[13px] font-medium rounded-full border transition-colors ${
                    !fits
                      ? "text-[#94A3B8] bg-[#F1F5F9] border-[#E3E8EF] line-through cursor-not-allowed"
                      : selectedAgeBands.includes(age)
                        ? "bg-[#0C1F33] text-white border-[#0C1F33]"
                        : "text-[#0C1F33] bg-white border-[#E3E8EF] hover:bg-[#F5F0E8]"
                  }`}
                >
                  {ageBandLabel(age)}
                </button>
              );
            })}
          </div>
        </div>

        <hr className="border-[#E3E8EF]" />

        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-bold text-[#475569] uppercase">
            {t("language")}
          </span>
          {locales.map((lang) => (
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
                {localeNames[lang]}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
