"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  BookOpen,
  Clock,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Calendar,
  Award,
  Globe,
  Share2,
  PlayCircle,
  Heart,
  Users,
  GraduationCap,
  Monitor,
} from "lucide-react";
import { toast } from "sonner";
import { useCourseDetails } from "@/hooks/use-course-details";
import { useProfileStore } from "@/stores/profile-store";

export default function CourseDetailsPage() {
  const params = useParams();
  const courseId = params.id as string;
  const { activeProfile } = useProfileStore();

  const {
    data: course,
    isLoading,
    isError,
  } = useCourseDetails(courseId, activeProfile?.id);

  const [openFaq, setOpenFaq] = useState<number>(0);
  const [openModule, setOpenModule] = useState<number>(0);

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
      {/* ───── HERO ───── */}
      <section className="relative bg-[#12304E] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.08]">
          <div className="w-[1200px] h-[400px] border border-[#B8912F] rotate-45 rounded-sm" />
        </div>

        <div className="relative max-w-[1200px] mx-auto px-6 py-12 lg:py-0 lg:min-h-[480px] flex items-center">
          <div className="max-w-[760px] flex flex-col gap-6">
            {/* Breadcrumbs */}
            <p className="text-[#B8912F] text-sm font-semibold">
              Courses &gt; {course.category} &gt; {course.title}
            </p>

            {/* Badges */}
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold text-[#B8912F] bg-[#B8912F]/[0.08] px-2 py-1 rounded">
                {course.level}
              </span>
              <span className="text-[11px] font-semibold text-[#B8912F] border border-[#B8912F] px-2.5 py-1 rounded-full">
                Included with membership
              </span>
            </div>

            {/* Title */}
            <h1 className="font-serif text-white text-[40px] leading-[48px]">
              {course.title}
            </h1>

            {/* Description */}
            <p className="text-white text-base leading-6 max-w-[760px]">
              {course.summary}
            </p>

            {/* Meta row */}
            <div className="flex items-center gap-6 flex-wrap">
              <span className="flex items-center gap-1.5 text-white text-sm">
                <Star className="w-3.5 h-3.5 text-[#B8912F]" strokeWidth={2} />
                <span className="font-semibold">
                  {course.ratingSummary.average} Rating (
                  {course.ratingSummary.total} reviews)
                </span>
              </span>
              <span className="flex items-center gap-1.5 text-white text-sm">
                <BookOpen className="w-3.5 h-3.5" strokeWidth={2} />
                {course.totalLessons} Lessons
              </span>
              <span className="flex items-center gap-1.5 text-white text-sm">
                <Clock className="w-3.5 h-3.5" strokeWidth={2} />
                {course.durationWeeks} Weeks
              </span>
            </div>

            {/* Instructor */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#64748B] overflow-hidden flex items-center justify-center text-white text-sm font-semibold">
                {course.instructor.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <span className="text-white text-sm">
                Instructed by{" "}
                <span className="font-semibold">{course.instructor.name}</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ───── CONTENT SPLIT ───── */}
      <section className="bg-[#FBF9F4]">
        <div className="max-w-[1200px] mx-auto px-6 pt-12 flex flex-col lg:flex-row gap-10">
          {/* LEFT COLUMN */}
          <div className="flex-1 min-w-0 flex flex-col gap-16">
            {/* What you'll learn */}
            {course.learningOutcomes.length > 0 && (
              <div className="border border-[#E3E8EF] rounded-xl p-8 bg-[#FBF9F4]">
                <h2 className="font-serif text-[22px] text-[#0C1F33] mb-6">
                  What you&apos;ll learn
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  {course.learningOutcomes.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle
                        className="w-4 h-4 text-[#22A146] mt-0.5 shrink-0"
                        strokeWidth={2}
                      />
                      <span className="text-sm text-[#0C1F33]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements */}
            {course.requirements.length > 0 && (
              <div>
                <h2 className="font-serif text-[22px] text-[#0C1F33] mb-4">
                  Requirements
                </h2>
                <ul className="space-y-2">
                  {course.requirements.map((req, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-[15px] text-[#0C1F33]"
                    >
                      <span className="text-[#0C1F33] mt-1.5 shrink-0">•</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* About this course */}
            {course.aboutParagraphs.length > 0 && (
              <div>
                <h2 className="font-serif text-[28px] text-[#0C1F33] mb-5">
                  About this course
                </h2>
                <div className="space-y-5">
                  {course.aboutParagraphs.map((p, i) => (
                    <p key={i} className="text-base leading-7 text-[#0C1F33]">
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Curriculum */}
            {course.curriculum.length > 0 && (
              <div>
                <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
                  <div>
                    <p className="text-sm font-bold text-[#0C1F33] mb-3">
                      Detailed Syllabus
                    </p>
                    <h2 className="font-serif text-[40px] leading-[48px] text-[#0C1F33]">
                      Curriculum
                    </h2>
                  </div>
                  <p className="text-[15px] font-semibold text-[#0C1F33]">
                    {course.totalModules} modules • {course.totalLessons}{" "}
                    lessons
                  </p>
                </div>

                <div className="space-y-3">
                  {course.curriculum.map((mod, idx) => (
                    <div
                      key={idx}
                      className="border border-[#E3E8EF] rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() =>
                          setOpenModule(openModule === idx ? -1 : idx)
                        }
                        className="w-full flex items-center justify-between px-5 py-5 bg-[#FBF9F4] hover:bg-[#F5F0E8] transition-colors"
                      >
                        <div className="flex items-center gap-5">
                          <span className="font-serif text-[22px] text-[#B8912F]">
                            {mod.moduleNum}
                          </span>
                          <span className="font-serif text-[20px] text-[#0C1F33]">
                            {mod.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-[#64748B]">
                            {mod.lessons} lessons • {mod.duration}
                          </span>
                          {openModule === idx ? (
                            <ChevronUp className="w-5 h-5 text-[#64748B]" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-[#64748B]" />
                          )}
                        </div>
                      </button>

                      {openModule === idx && (
                        <div className="bg-white divide-y divide-[#E3E8EF]">
                          {mod.lessonsList.map((lesson, li) => (
                            <div
                              key={li}
                              className="flex items-center justify-between px-5 py-4"
                            >
                              <div className="flex items-center gap-3">
                                <PlayCircle
                                  className="w-4 h-4 text-[#64748B]"
                                  strokeWidth={2}
                                />
                                <span className="text-[15px] text-[#0C1F33]">
                                  {lesson.title}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-[#64748B]">
                                  {lesson.duration}
                                </span>
                                <span className="text-sm font-semibold text-[#22A146]">
                                  Preview
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructor */}
            <div className="flex flex-col sm:flex-row gap-8">
              <div className="shrink-0">
                {course.instructor.avatarUrl ? (
                  <Image
                    src={course.instructor.avatarUrl}
                    alt={course.instructor.name}
                    width={200}
                    height={200}
                    className="w-[120px] h-[120px] sm:w-[200px] sm:h-[200px] rounded-full object-cover"
                  />
                ) : (
                  <div className="w-[120px] h-[120px] sm:w-[200px] sm:h-[200px] rounded-full bg-gradient-to-br from-amber-100 to-amber-200 overflow-hidden flex items-center justify-center">
                    <span className="font-serif text-4xl text-[#B8912F]">
                      {course.instructor.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <p className="text-sm font-bold text-[#0C1F33]">
                  Your Instructor
                </p>
                <h3 className="font-serif text-[32px] text-[#0C1F33]">
                  {course.instructor.name}
                </h3>
                <p className="text-base font-semibold text-[#64748B]">
                  Clinical Advisor & Lead Researcher
                </p>
                <div className="flex items-center gap-6 text-[15px] font-semibold text-[#0C1F33] flex-wrap">
                  <span>{course.instructor.rating} Instructor Rating</span>
                  <span>{course.instructor.courseCount} Courses</span>
                  <span>
                    {course.instructor.studentCount.toLocaleString()} Students
                  </span>
                </div>
                {course.instructor.bio && (
                  <p className="text-[15px] leading-6 text-[#0C1F33] mt-1">
                    {course.instructor.bio}
                  </p>
                )}
              </div>
            </div>

            {/* Reviews */}
            <div>
              <p className="text-sm font-bold text-[#0C1F33] mb-3">
                Student Voices
              </p>
              <h2 className="font-serif text-[40px] leading-[48px] text-[#0C1F33] mb-8">
                Course Reviews
              </h2>

              <div className="flex flex-col sm:flex-row gap-8 mb-10">
                {/* Rating summary */}
                <div className="bg-[#FBF9F4] border border-[#E3E8EF] rounded-xl p-6 flex flex-col items-center justify-center min-w-[140px]">
                  <span className="font-serif text-[56px] text-[#B8912F]">
                    {course.ratingSummary.average}
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

              {/* Individual reviews */}
              {course.reviews.length > 0 ? (
                <div className="divide-y divide-[#E3E8EF]">
                  {course.reviews.map((review) => (
                    <div key={review.id} className="py-6 first:pt-0">
                      <p className="text-[15px] font-bold text-[#0C1F33]">
                        {review.name}
                      </p>
                      <p className="text-[13px] text-[#64748B] mb-2">
                        {review.role}
                      </p>
                      <div className="flex gap-0.5 mb-2">
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
                      <p className="text-sm text-[#0C1F33] leading-6">
                        {review.text}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#64748B]">No reviews yet.</p>
              )}
            </div>
          </div>

          {/* RIGHT RAIL */}
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
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-[54px] h-[54px] rounded-full bg-white/90 flex items-center justify-center">
                      <PlayCircle className="w-5 h-5 text-[#12304E]" />
                    </div>
                  </div>
                </div>

                <div className="p-6 flex flex-col gap-5">
                  {/* CTA */}
                  <div className="flex flex-col gap-3">
                    <p className="text-xs font-bold text-[#B8912F] uppercase tracking-wide">
                      Included with membership
                    </p>
                    <h3 className="font-serif text-2xl text-[#0C1F33]">
                      {course.isEnrolled
                        ? "You're enrolled"
                        : "Start learning today"}
                    </h3>

                    {course.isEnrolled ? (
                      <>
                        {/* Chat Room Button */}
                        <Link
                          href={`/chat?courseId=${course.id}&courseTitle=${encodeURIComponent(course.title)}&batchId=${course.enrolmentBatchId ?? ""}&batchName=${encodeURIComponent("Your Batch")}`}
                          className="w-full py-3 bg-[#12304E] text-white rounded-lg text-[15px] font-semibold hover:bg-[#1a4268] transition-colors text-center"
                        >
                          Chat Room
                        </Link>

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
                    ) : (
                      <>
                        {/* Enrol button */}
                        <Link
                          href={
                            activeProfile
                              ? `/enrol/batch-selection?courseId=${course.id}&courseTitle=${encodeURIComponent(course.title)}&learnerProfileId=${activeProfile.id}`
                              : "/profiles"
                          }
                          className="w-full py-3 bg-[#22A146] text-white rounded-lg text-[15px] font-semibold hover:bg-[#1D8F3D] transition-colors text-center"
                        >
                          {activeProfile
                            ? "View Enrolment Options"
                            : "Select Profile First"}
                        </Link>

                        {/* Wishlist */}
                        <button
                          onClick={() => toast.success("Added to wishlist")}
                          className="w-full py-3 border border-[#12304E] text-[#12304E] rounded-lg text-[15px] font-semibold hover:bg-[#12304E] hover:text-white transition-colors flex items-center justify-center gap-2"
                        >
                          <Heart className="w-4 h-4" />
                          Add to wishlist
                        </button>
                      </>
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
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />{" "}
                      {course.durationWeeks} weeks
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5" /> {course.level}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" /> {course.language}
                    </span>
                  </div>

                  {/* Share */}
                  <p
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success("Link copied");
                    }}
                    className="flex items-center gap-2 text-sm text-[#0C1F33] cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Share this course
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── SPACER ───── */}
      <div className="h-[100px] bg-[#FBF9F4]" />

      {/* ───── MEMBERSHIP BAND ───── */}
      <section className="bg-[#FBF9F4] pb-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="border border-[#E3E8EF] rounded-xl p-12 bg-[#FBF9F4] text-center">
            <p className="text-sm font-bold text-[#B8912F] uppercase tracking-wide mb-3">
              Membership
            </p>
            <h2 className="font-serif text-[32px] text-[#0C1F33] mb-10">
              One membership. Every course.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 text-left">
              <div className="flex flex-col gap-3">
                <div className="w-8 h-8 rounded bg-[#B8912F]/10 flex items-center justify-center">
                  <Monitor className="w-5 h-5 text-[#B8912F]" />
                </div>
                <h3 className="font-serif text-lg text-[#0C1F33]">
                  All 140 courses
                </h3>
                <p className="text-sm text-[#64748B] leading-6">
                  Gain instant access to everything: classical Islamic studies,
                  Qur&apos;anic Arabic, and medical health sciences.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <div className="w-8 h-8 rounded bg-[#B8912F]/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#B8912F]" />
                </div>
                <h3 className="font-serif text-lg text-[#0C1F33]">
                  Live classes included
                </h3>
                <p className="text-sm text-[#64748B] leading-6">
                  Join interactive weekly seminars and live Q&amp;As hosted by
                  senior faculty.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <div className="w-8 h-8 rounded bg-[#B8912F]/10 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-[#B8912F]" />
                </div>
                <h3 className="font-serif text-lg text-[#0C1F33]">
                  Certificates included
                </h3>
                <p className="text-sm text-[#64748B] leading-6">
                  Earn verified accredited certificates on every track you
                  complete.
                </p>
              </div>
            </div>
            <Link
              href="/pricing"
              className="inline-block px-6 py-3 border border-[#12304E] rounded-lg text-[15px] font-semibold text-[#12304E] hover:bg-[#12304E] hover:text-white transition-colors"
            >
              Compare membership plans
            </Link>
          </div>
        </div>
      </section>

      {/* ───── FAQ ───── */}
      {course.faq.length > 0 && (
        <section className="bg-[#FBF9F4] pb-24">
          <div className="max-w-[1200px] mx-auto px-6">
            <h2 className="font-serif text-[32px] text-[#0C1F33] mb-10">
              Common questions
            </h2>
            <div className="divide-y divide-[#E3E8EF]">
              {course.faq.map((faq, i) => (
                <div key={i}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                    className="w-full flex items-center justify-between py-5 text-left"
                  >
                    <span className="font-serif text-lg text-[#0C1F33]">
                      {faq.question}
                    </span>
                    {openFaq === i ? (
                      <ChevronUp className="w-5 h-5 text-[#64748B] shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#64748B] shrink-0" />
                    )}
                  </button>
                  {openFaq === i && faq.answer && (
                    <p className="pb-5 text-[15px] text-[#64748B] leading-7">
                      {faq.answer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ───── RELATED COURSES ───── */}
      {course.relatedCourses.length > 0 && (
        <section className="bg-[#FBF9F4] pb-[120px]">
          <div className="max-w-[1200px] mx-auto px-6">
            <h2 className="font-serif text-[32px] text-[#0C1F33] mb-10">
              Students also took
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {course.relatedCourses.map((related) => (
                <Link
                  key={related.id}
                  href={`/courses/${related.id}`}
                  className="bg-white border border-[#E3E8EF] rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative h-[160px] bg-gray-100">
                    {related.thumbnailUrl ? (
                      <Image
                        src={related.thumbnailUrl}
                        alt={related.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        Course
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-white bg-[#2563BA] px-2 py-1 rounded">
                        {related.level}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-semibold text-[#0C1F33]">
                        <Star className="w-3 h-3 text-[#B8912F] fill-[#B8912F]" />
                        {related.rating}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg text-[#0C1F33] leading-6 min-h-[48px]">
                      {related.title}
                    </h3>
                    <p className="text-[13px] text-[#64748B]">
                      {related.instructor}
                    </p>
                    <div className="border-t border-[#E3E8EF] pt-3 mt-auto">
                      <span className="text-[13px] font-semibold text-[#12304E] hover:underline">
                        Learn More →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
