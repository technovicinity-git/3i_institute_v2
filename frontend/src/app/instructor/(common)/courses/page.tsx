"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  BookOpen,
  Users,
  Eye,
  Edit,
  Search,
  X,
  ChevronDown,
  Check,
} from "lucide-react";
import { useInstructorCourses } from "@/hooks/use-instructor-courses";

function getStatusBadge(status: string) {
  const statusMap: Record<string, { label: string; className: string }> = {
    DRAFT: { label: "DRAFT", className: "bg-gray-100 text-gray-600" },
    PENDING_REVIEW: {
      label: "PENDING",
      className: "bg-yellow-50 text-yellow-700",
    },
    PUBLISHED: {
      label: "PUBLISHED",
      className: "bg-[#22A146]/10 text-[#22A146]",
    },
    SUSPENDED: {
      label: "SUSPENDED",
      className: "bg-red-50 text-red-600",
    },
    ARCHIVED: {
      label: "ARCHIVED",
      className: "bg-gray-100 text-gray-500",
    },
  };

  return (
    statusMap[status] ?? {
      label: status,
      className: "bg-gray-100 text-gray-600",
    }
  );
}

const TYPE_OPTIONS = [
  { value: "REGULAR", label: "Regular" },
  { value: "ONLINE_CLASS", label: "Online Class" },
];

const STATUS_OPTIONS = [
  { value: "PUBLISHED", label: "Published" },
  { value: "DRAFT", label: "Draft" },
  { value: "PENDING_REVIEW", label: "Pending Review" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "ARCHIVED", label: "Archived" },
];

// ─── Reusable Dropdown Filter ───

interface DropdownFilterProps {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}

function DropdownFilter({
  label,
  options,
  selected,
  onToggle,
}: DropdownFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors ${
          selected.length > 0
            ? "border-[#22A146] bg-green-50/50 text-[#0C1F33]"
            : "border-[#E3E8EF] bg-white text-[#0C1F33] hover:border-gray-300"
        }`}
      >
        <span>{label}</span>
        {selected.length > 0 && (
          <span className="w-5 h-5 rounded-full bg-[#22A146] text-white text-[10px] flex items-center justify-center font-bold">
            {selected.length}
          </span>
        )}
        <ChevronDown
          className={`w-4 h-4 text-[#64748B] transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-[200px] bg-white border border-[#E3E8EF] rounded-lg shadow-lg z-20 overflow-hidden">
          {options.map((opt) => {
            const isSelected = selected.includes(opt.value);
            return (
              <button
                key={opt.value}
                onClick={() => onToggle(opt.value)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-[#0C1F33] hover:bg-gray-50 transition-colors"
              >
                <span>{opt.label}</span>
                {isSelected && (
                  <Check className="w-4 h-4 text-[#22A146]" strokeWidth={2.5} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───

export default function InstructorCoursesPage() {
  const router = useRouter();
  const { data: courses, isLoading, isError } = useInstructorCourses();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  const filteredCourses = useMemo(() => {
    if (!courses) return [];

    return courses.filter((course) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        course.title.toLowerCase().includes(query) ||
        course.summary.toLowerCase().includes(query);

      const matchesType =
        selectedTypes.length === 0 || selectedTypes.includes(course.type);

      const matchesStatus =
        selectedStatuses.length === 0 ||
        selectedStatuses.includes(course.status);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [courses, searchQuery, selectedTypes, selectedStatuses]);

  const toggleFilter = (
    arr: string[],
    setArr: (v: string[]) => void,
    val: string,
  ) => {
    if (arr.includes(val)) setArr(arr.filter((v) => v !== val));
    else setArr([...arr, val]);
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedTypes([]);
    setSelectedStatuses([]);
  };

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedTypes.length > 0 ||
    selectedStatuses.length > 0;

  return (
    <div className="p-6 md:p-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1
            className="text-3xl md:text-[36px] text-[#0C1F33] mb-1"
            style={{ fontFamily: "'Marcellus', serif" }}
          >
            My Courses
          </h1>
          <p className="text-base text-[#64748B]">
            {filteredCourses.length} of {courses?.length ?? 0} courses
          </p>
        </div>

        <button
          onClick={() => router.push("/instructor/courses/create")}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#22A146] text-white rounded-lg text-sm font-semibold hover:bg-[#1E9040] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Course
        </button>
      </div>

      {/* Search + Filters bar */}
      {courses && courses.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="flex items-center gap-2 bg-white border border-[#E3E8EF] rounded-lg px-4 py-2.5 flex-1 min-w-[240px] max-w-[400px]">
            <Search className="w-4 h-4 text-[#94A3B8] shrink-0" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm text-[#0C1F33] placeholder:text-[#94A3B8] outline-none w-full"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-[#94A3B8] hover:text-[#0C1F33] shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Type dropdown */}
          <DropdownFilter
            label="Type"
            options={TYPE_OPTIONS}
            selected={selectedTypes}
            onToggle={(val) =>
              toggleFilter(selectedTypes, setSelectedTypes, val)
            }
          />

          {/* Status dropdown */}
          <DropdownFilter
            label="Status"
            options={STATUS_OPTIONS}
            selected={selectedStatuses}
            onToggle={(val) =>
              toggleFilter(selectedStatuses, setSelectedStatuses, val)
            }
          />

          {/* Clear all */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:underline px-2"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-red-600 font-medium">Failed to load courses</p>
        </div>
      )}

      {/* Empty — no courses at all */}
      {!isLoading && !isError && courses?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <BookOpen className="w-16 h-16 text-gray-300" strokeWidth={1.5} />
          <p className="text-lg text-[#64748B]">
            You haven&apos;t created any courses yet
          </p>
          <button
            onClick={() => router.push("/instructor/courses/create")}
            className="px-5 py-2.5 bg-[#22A146] text-white rounded-lg text-sm font-semibold hover:bg-[#1E9040]"
          >
            Create your first course
          </button>
        </div>
      )}

      {/* Empty — filters returned nothing */}
      {!isLoading &&
        !isError &&
        courses &&
        courses.length > 0 &&
        filteredCourses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Search className="w-16 h-16 text-gray-300" strokeWidth={1.5} />
            <p className="text-lg text-[#64748B]">
              No courses match your filters
            </p>
            <button
              onClick={clearAllFilters}
              className="text-[#22A146] font-semibold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}

      {/* Course List */}
      {!isLoading &&
        !isError &&
        courses &&
        courses.length > 0 &&
        filteredCourses.length > 0 && (
          <div className="bg-white border border-[#E3E8EF] rounded-xl overflow-hidden">
            {/* Desktop Header */}
            <div className="hidden lg:grid grid-cols-[minmax(300px,2fr)_130px_120px_120px_120px_280px] items-center gap-4 px-5 py-3 bg-[#F8FAFC] border-b border-[#E3E8EF] text-xs font-semibold text-[#64748B] uppercase tracking-wide">
              <div>Course</div>
              <div>Type</div>
              <div>Students</div>
              <div>Lessons</div>
              <div>Status</div>
              <div>Actions</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-[#E3E8EF]">
              {filteredCourses.map((course) => {
                const status = getStatusBadge(course.status);

                return (
                  <div
                    key={course.id}
                    className="group px-5 py-4 hover:bg-[#F8FAFC] transition-colors"
                  >
                    {/* Desktop */}
                    <div className="hidden lg:grid grid-cols-[minmax(300px,2fr)_130px_120px_120px_120px_280px] items-center gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="relative w-24 h-16 rounded-lg overflow-hidden shrink-0 bg-gradient-to-br from-[#12304E] to-[#2a5070]">
                          {course.thumbnailUrl ? (
                            <Image
                              src={course.thumbnailUrl}
                              alt={course.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/30">
                              <BookOpen className="w-7 h-7" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <h3
                            className="text-base text-[#0C1F33] font-medium truncate"
                            style={{ fontFamily: "'Marcellus', serif" }}
                          >
                            {course.title}
                          </h3>
                          <p className="text-sm text-[#64748B] line-clamp-1 mt-1">
                            {course.summary}
                          </p>
                          {course.status === "DRAFT" &&
                            course.rejectionReason && (
                              <p className="text-xs text-red-600 mt-1 truncate">
                                Rejected: {course.rejectionReason}
                              </p>
                            )}
                        </div>
                      </div>

                      <div>
                        <span className="text-xs font-semibold text-[#64748B] uppercase">
                          {course.type.replace("_", " ")}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-sm text-[#64748B]">
                        <Users className="w-4 h-4" />
                        {course._count?.enrolments ?? 0}
                      </div>

                      <div className="flex items-center gap-1.5 text-sm text-[#64748B]">
                        <BookOpen className="w-4 h-4" />
                        {course.totalLessons}
                      </div>

                      <div>
                        <span
                          className={`inline-flex text-[10px] font-bold px-2.5 py-1 rounded-md ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        <Link
                          href={`/courses/${course.id}`}
                          className="flex items-center gap-1 text-sm font-semibold text-[#12304E] hover:underline"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Link>
                        <Link
                          href={`/instructor/courses/${course.id}/edit`}
                          className="flex items-center gap-1 text-sm font-semibold text-[#22A146] hover:underline"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </Link>
                      </div>
                    </div>

                    {/* Mobile */}
                    <div className="lg:hidden">
                      <div className="flex gap-4">
                        <div className="relative w-28 h-20 rounded-lg overflow-hidden shrink-0 bg-gradient-to-br from-[#12304E] to-[#2a5070]">
                          {course.thumbnailUrl ? (
                            <Image
                              src={course.thumbnailUrl}
                              alt={course.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/30">
                              <BookOpen className="w-8 h-8" />
                            </div>
                          )}
                          <span
                            className={`absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3
                            className="text-base text-[#0C1F33] font-medium line-clamp-2"
                            style={{ fontFamily: "'Marcellus', serif" }}
                          >
                            {course.title}
                          </h3>
                          <p className="text-sm text-[#64748B] line-clamp-2 mt-1">
                            {course.summary}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-[#64748B]">
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" />
                              {course._count?.enrolments ?? 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-3.5 h-3.5" />
                              {course.totalLessons}
                            </span>
                            <span className="uppercase font-semibold">
                              {course.type.replace("_", " ")}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 flex-wrap mt-4 pt-3 border-t border-gray-100">
                        <Link
                          href={`/courses/${course.id}`}
                          className="flex items-center gap-1 text-sm font-semibold text-[#12304E] hover:underline"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Link>
                        <Link
                          href={`/instructor/courses/${course.id}/edit`}
                          className="flex items-center gap-1 text-sm font-semibold text-[#22A146] hover:underline"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
    </div>
  );
}
