"use client";

import { useState } from "react";
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

/* ────────────────────────────── data ────────────────────────────── */

const WHAT_YOU_LEARN = [
  "Master foundational principles of classical Unani & Prophetic medicine systems.",
  "Understand clinical human anatomy through traditional and holistic frameworks.",
  "Analyze raw botanical herbs, formulas, and classical dietary models.",
  "Interpret classical treatises on preventative health and mental wellness.",
  "Correlate classical healing methods with modern laboratory pathology.",
  "Implement holistic clinical practices that respect both scientific and sacred truths.",
];

const REQUIREMENTS = [
  "No advanced medical background is required; foundational anatomy concepts are fully explained.",
  "An interest in holistic health systems and classical Islamic scholarship traditions.",
  "Study materials, core reading lists, and primary text translations are completely provided.",
];

const ABOUT_PARAGRAPHS = [
  "Foundations of Prophetic Medicine (Tibb) serves as the primary bridge connecting classical wellness systems with modern clinical physiology. For centuries, the rich tradition of Tibb al-Nabawi has guided communities through preventative care, herbal pharmacology, and holistic anatomy. This course systematically examines each classical concept, validates its scientific merit, and equips modern learners with actionable clinical knowledge.",
  "Under the guidance of leading researchers and medical advisors, you will explore the historical significance of the Unani-Arab hospital networks, the preventative health protocols found in classical treatises, and the botanical pharmacology that underpins traditional healing arts. Each module balances rigorous medical textbook analysis with practical case studies drawn from centuries of clinical tradition.",
  "Whether you are an active health practitioner, a student of the sacred sciences, or a seeker of holistic truth, this program delivers a rigorous intellectual and practical path. By uniting physical and spiritual wellness, the curriculum helps you approach clinical scenarios with clarity, compassion, and evidence.",
];

const MODULES = [
  {
    num: "01",
    title: "Principles & Metaphysics of Tibb",
    lessons: 4,
    duration: "2h 15m",
  },
  {
    num: "02",
    title: "The Humors (Akhlat) & Bodily Fluids",
    lessons: 4,
    duration: "2h 45m",
  },
  {
    num: "03",
    title: "Dietetics & Classical Nourishment Protocols",
    lessons: 5,
    duration: "3h 10m",
  },
  {
    num: "04",
    title: "Pharmacology of Botanical Herbs",
    lessons: 4,
    duration: "2h 30m",
  },
  {
    num: "05",
    title: "Mental Health, Breath, and Spiritual State",
    lessons: 3,
    duration: "1h 50m",
  },
  {
    num: "06",
    title: "Anatomy & The Cardiopulmonary System",
    lessons: 4,
    duration: "2h 10m",
  },
];

const MODULE_1_LESSONS = [
  { title: "Introduction to Traditional Medicine Systems", duration: "35:10" },
  {
    title: "The Concept of Mizaj (Temperaments) in Healing",
    duration: "42:15",
  },
  { title: "Anatomy & Modern Biochemical Paradigms", duration: "28:40" },
  {
    title: "Case Studies: Historical Clinical Methodologies",
    duration: "29:15",
  },
];

const WHATS_INCLUDED = [
  "48 on-demand video lessons",
  "12 live Q&A seminars",
  "Downloadable notes and study guides",
  "Practical clinical scenario bank",
  "Verified graduation certificate",
  "Lifetime access to course updates",
];

const FAQ_ITEMS = [
  {
    question: "Is this course included in my membership?",
    answer:
      "Yes, absolutely. Foundations of Prophetic Medicine (Tibb) is entirely covered under our standard single membership model. As long as your membership is active, you can access all 48 video lectures, download learning packets, and register for weekly clinical Q&A sessions without any additional costs.",
  },
  { question: "Do I need prior medical training?", answer: "" },
  { question: "Are the live classes recorded?", answer: "" },
  { question: "What certificate do I receive?", answer: "" },
  { question: "Can I cancel my membership anytime?", answer: "" },
  { question: "Is the course available in Arabic?", answer: "" },
];

const REVIEWS = [
  {
    name: "Dr. Bilal Al-Hasan",
    role: "Consultant Physician",
    text: "Analyzing classical texts alongside physiological studies transformed my approach. The curriculum is highly balanced, medically rigorous, and historically authentic.",
  },
  {
    name: "Sarah Siddique",
    role: "Bioethics Advocate",
    text: "Dr. Tariq is an exceptional scholar. He untangles highly complex treatises on herbalism with immense clarity, making this course highly recommended for clinicians and laypeople alike.",
  },
  {
    name: "Zayd Mahmood",
    role: "Traditional Medicine Student",
    text: "A spectacular clinical bridge. I appreciated how the syllabus kept absolute fidelity to classical Usul texts while tackling contemporary health scenarios with modern terminology.",
  },
];

const RELATED_COURSES = [
  {
    title: "Holistic Herbalism & Human Anatomy",
    instructor: "Prof. Sarah Sterling",
    rating: "4.9",
  },
  {
    title: "Classical Arabic Grammar & Rhetoric",
    instructor: "Ustadh Yusuf Farooq",
    rating: "4.8",
  },
  {
    title: "Introduction to Islamic Jurisprudence",
    instructor: "Shaykh Dr. Anas Rafiq",
    rating: "5.0",
  },
  {
    title: "Islamic Bioethics in Clinical Practice",
    instructor: "Dr. Amina Rahman",
    rating: "4.8",
  },
];

const RATING_BARS = [
  { stars: 5, pct: 82 },
  { stars: 4, pct: 12 },
  { stars: 3, pct: 4 },
  { stars: 2, pct: 1 },
  { stars: 1, pct: 1 },
];

/* ────────────────────────────── page ────────────────────────────── */

export default function CoursePage() {
  const [openFaq, setOpenFaq] = useState<number>(0);
  const [openModule, setOpenModule] = useState<number>(0);

  return (
    <main className="min-h-screen bg-[#FBF9F4] font-figtree">
      {/* ───── HERO ───── */}
      <section className="relative bg-[#12304E] overflow-hidden">
        {/* decorative diamond lines */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.08]">
          <div className="w-[1200px] h-[400px] border border-[#B8912F] rotate-45 rounded-sm" />
        </div>

        <div className="relative max-w-[1200px] mx-auto px-6 py-12 lg:py-0 lg:min-h-[480px] flex items-center">
          <div className="max-w-[760px] flex flex-col gap-6">
            {/* breadcrumbs */}
            <p className="text-[#B8912F] text-sm font-semibold">
              Courses &gt; Health Sciences &gt; Prophetic Medicine
            </p>

            {/* badges */}
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold text-[#B8912F] bg-[#B8912F]/[0.08] px-2 py-1 rounded">
                Intermediate
              </span>
              <span className="text-[11px] font-semibold text-[#B8912F] border border-[#B8912F] px-2.5 py-1 rounded-full">
                Included with membership
              </span>
            </div>

            {/* title */}
            <h1 className="font-marcellus text-white text-[40px] leading-[48px]">
              Foundations of Prophetic Medicine (Tibb)
            </h1>

            {/* description */}
            <p className="text-white text-base leading-6 max-w-[760px]">
              An exhaustive study of classical Prophetic medicine (Tibb
              al-Nabawi) integrated with modern anatomy, wellness, and
              evidence-based holistic physiology. Learn to bridge traditional
              healing arts and contemporary biomedical science.
            </p>

            {/* meta row */}
            <div className="flex items-center gap-6 flex-wrap">
              <span className="flex items-center gap-1.5 text-white text-sm">
                <Star className="w-3.5 h-3.5 text-[#B8912F]" strokeWidth={2} />
                <span className="font-semibold">4.8 Rating (214 reviews)</span>
              </span>
              <span className="flex items-center gap-1.5 text-white text-sm">
                <BookOpen className="w-3.5 h-3.5" strokeWidth={2} />
                48 Lessons
              </span>
              <span className="flex items-center gap-1.5 text-white text-sm">
                <Clock className="w-3.5 h-3.5" strokeWidth={2} />
                12 Weeks
              </span>
            </div>

            {/* instructor */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#64748B] overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-amber-700 to-amber-900" />
              </div>
              <span className="text-white text-sm">
                Instructed by{" "}
                <span className="font-semibold">Dr. Tariq Al-Jamil, PhD</span>
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
            <div className="border border-[#E3E8EF] rounded-xl p-8 bg-[#FBF9F4]">
              <h2 className="font-marcellus text-[22px] text-[#0C1F33] mb-6">
                What you&apos;ll learn
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                {WHAT_YOU_LEARN.map((item, i) => (
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

            {/* Requirements */}
            <div>
              <h2 className="font-marcellus text-[22px] text-[#0C1F33] mb-4">
                Requirements
              </h2>
              <ul className="space-y-2">
                {REQUIREMENTS.map((req, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-[15px] text-[#0C1F33]"
                  >
                    <span className="text-[#0C1F33] mt-1.5 shrink-0">
                      &#8226;
                    </span>
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            {/* About this course */}
            <div>
              <h2 className="font-marcellus text-[28px] text-[#0C1F33] mb-5">
                About this course
              </h2>
              <div className="space-y-5">
                {ABOUT_PARAGRAPHS.map((p, i) => (
                  <p key={i} className="text-base leading-7 text-[#0C1F33]">
                    {p}
                  </p>
                ))}
              </div>
            </div>

            {/* Curriculum */}
            <div>
              <div className="flex items-end justify-between mb-8">
                <div>
                  <p className="text-sm font-bold text-[#0C1F33] mb-3">
                    Detailed Syllabus
                  </p>
                  <h2 className="font-marcellus text-[40px] leading-[48px] text-[#0C1F33]">
                    Curriculum
                  </h2>
                </div>
                <p className="text-[15px] font-semibold text-[#0C1F33]">
                  12 modules &middot; 48 lessons &middot; 26h 40m
                </p>
              </div>

              <div className="space-y-3">
                {MODULES.map((mod, idx) => (
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
                        <span className="font-marcellus text-[22px] text-[#B8912F]">
                          {mod.num}
                        </span>
                        <span className="font-marcellus text-[20px] text-[#0C1F33]">
                          {mod.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-[#64748B]">
                          {mod.lessons} lessons &middot; {mod.duration}
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
                        {MODULE_1_LESSONS.map((lesson, li) => (
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

            {/* Instructor */}
            <div className="flex gap-12">
              <div className="shrink-0">
                <div className="w-[200px] h-[200px] rounded-full bg-gradient-to-br from-amber-100 to-amber-200 overflow-hidden">
                  <div className="w-full h-full bg-[#12304E]/10" />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <p className="text-sm font-bold text-[#0C1F33]">
                  Your Instructor
                </p>
                <h3 className="font-marcellus text-[32px] text-[#0C1F33]">
                  Dr. Tariq Al-Jamil
                </h3>
                <p className="text-base font-semibold text-[#64748B]">
                  Clinical Advisor &amp; Lead Researcher, PhD
                </p>
                <div className="flex items-center gap-6 text-[15px] font-semibold text-[#0C1F33]">
                  <span>4.9 Instructor Rating</span>
                  <span>6 Courses</span>
                  <span>8,400 Students</span>
                </div>
                <p className="text-[15px] leading-6 text-[#0C1F33] mt-1">
                  Dr. Tariq Al-Jamil completed his academic training in history
                  of science and religious studies, specializing in classical
                  Islamic medicine and botanicals. His research bridges the
                  medieval Bimaristan hospital systems with modern integrative
                  wellness science.
                </p>
                <p className="text-[15px] leading-6 text-[#0C1F33]">
                  A clinical advisor to multiple global holistic health
                  registries, he is renowned for making highly dense historical
                  treatises immediately relevant to modern nursing and medical
                  practitioners.
                </p>
              </div>
            </div>

            {/* Reviews */}
            <div>
              <p className="text-sm font-bold text-[#0C1F33] mb-3">
                Student Voices
              </p>
              <h2 className="font-marcellus text-[40px] leading-[48px] text-[#0C1F33] mb-8">
                Course Reviews
              </h2>

              <div className="flex gap-10 mb-10">
                {/* rating summary */}
                <div className="bg-[#FBF9F4] border border-[#E3E8EF] rounded-xl p-6 flex flex-col items-center justify-center min-w-[140px]">
                  <span className="font-marcellus text-[56px] text-[#B8912F]">
                    4.8
                  </span>
                  <div className="flex gap-0.5 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-3.5 h-3.5 text-[#B8912F] fill-[#B8912F]"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-[#64748B]">Based on 214 reviews</p>
                </div>

                {/* rating bars */}
                <div className="flex-1 flex flex-col justify-center gap-2">
                  {RATING_BARS.map((bar) => (
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

              {/* individual reviews */}
              <div className="divide-y divide-[#E3E8EF]">
                {REVIEWS.map((review, i) => (
                  <div key={i} className="py-6 first:pt-0">
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
                          className="w-3 h-3 text-[#B8912F] fill-[#B8912F]"
                        />
                      ))}
                    </div>
                    <p className="text-sm text-[#0C1F33] leading-6">
                      {review.text}
                    </p>
                  </div>
                ))}
              </div>

              <button className="mt-6 px-5 py-2.5 border border-[#12304E] rounded-lg text-[15px] font-semibold text-[#12304E] hover:bg-[#12304E] hover:text-white transition-colors">
                Show all 214 reviews
              </button>
            </div>
          </div>

          {/* RIGHT RAIL */}
          <div className="w-full lg:w-[380px] shrink-0">
            <div className="lg:sticky lg:top-6">
              <div className="bg-white border border-[#E3E8EF] rounded-xl overflow-hidden">
                {/* video thumbnail */}
                <div className="relative h-[214px] bg-gradient-to-br from-[#12304E] to-[#0C1F33] flex items-center justify-center">
                  <div className="w-[54px] h-[54px] rounded-full bg-white/90 flex items-center justify-center">
                    <PlayCircle className="w-5 h-5 text-[#12304E]" />
                  </div>
                </div>

                <div className="p-6 flex flex-col gap-5">
                  {/* CTA */}
                  <div className="flex flex-col gap-3">
                    <p className="text-xs font-bold text-[#B8912F] uppercase tracking-wide">
                      Included with membership
                    </p>
                    <h3 className="font-marcellus text-2xl text-[#0C1F33]">
                      Start learning today
                    </h3>
                    <button className="w-full py-3 bg-[#22A146] text-white rounded-lg text-[15px] font-semibold hover:bg-[#1D8F3D] transition-colors">
                      Start 7-day free trial
                    </button>
                    <button className="w-full py-3 border border-[#12304E] text-[#12304E] rounded-lg text-[15px] font-semibold hover:bg-[#12304E] hover:text-white transition-colors flex items-center justify-center gap-2">
                      <Heart className="w-4 h-4" />
                      Add to wishlist
                    </button>
                    <p className="text-sm font-semibold text-[#12304E] text-center underline cursor-pointer">
                      See membership plans
                    </p>
                  </div>

                  <hr className="border-[#E3E8EF]" />

                  {/* What's included */}
                  <div>
                    <p className="text-[13px] font-bold text-[#0C1F33] mb-3">
                      What&apos;s included
                    </p>
                    <ul className="space-y-3">
                      {WHATS_INCLUDED.map((item, i) => (
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

                  {/* Meta */}
                  <div className="flex items-center justify-between text-[13px] text-[#64748B]">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> 12 weeks
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5" /> Intermediate
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" /> English
                    </span>
                  </div>

                  {/* Share */}
                  <p className="flex items-center gap-2 text-sm text-[#0C1F33] cursor-pointer">
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
            <h2 className="font-marcellus text-[32px] text-[#0C1F33] mb-10">
              One membership. Every course.
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 text-left">
              {[
                {
                  icon: <Monitor className="w-5 h-5 text-[#B8912F]" />,
                  title: "All 140 courses",
                  desc: "Gain instant access to everything: classical Islamic studies, Qur'anic Arabic, and medical health sciences.",
                },
                {
                  icon: <Users className="w-5 h-5 text-[#B8912F]" />,
                  title: "Live classes included",
                  desc: "Join interactive weekly seminars and live Q&As hosted directly by senior scholarly faculty and clinical leads.",
                },
                {
                  icon: <GraduationCap className="w-5 h-5 text-[#B8912F]" />,
                  title: "Certificates included",
                  desc: "Earn verified accredited certificates signed by faculty advisors on every curriculum track you complete.",
                },
              ].map((col, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <div className="w-8 h-8 rounded bg-[#B8912F]/10 flex items-center justify-center">
                    {col.icon}
                  </div>
                  <h3 className="font-marcellus text-lg text-[#0C1F33]">
                    {col.title}
                  </h3>
                  <p className="text-sm text-[#64748B] leading-6">{col.desc}</p>
                </div>
              ))}
            </div>

            <button className="px-6 py-3 border border-[#12304E] rounded-lg text-[15px] font-semibold text-[#12304E] hover:bg-[#12304E] hover:text-white transition-colors">
              Compare membership plans
            </button>
          </div>
        </div>
      </section>

      {/* ───── FAQ ───── */}
      <section className="bg-[#FBF9F4] pb-24">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="font-marcellus text-[32px] text-[#0C1F33] mb-10">
            Common questions
          </h2>

          <div className="divide-y divide-[#E3E8EF]">
            {FAQ_ITEMS.map((faq, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  className="w-full flex items-center justify-between py-5 text-left"
                >
                  <span className="font-marcellus text-lg text-[#0C1F33]">
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

      {/* ───── RELATED COURSES ───── */}
      <section className="bg-[#FBF9F4] pb-[120px]">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="font-marcellus text-[32px] text-[#0C1F33] mb-10">
            Students also took
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {RELATED_COURSES.map((course, i) => (
              <div
                key={i}
                className="bg-white border border-[#E3E8EF] rounded-xl overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="h-[160px] bg-gradient-to-br from-[#12304E] to-[#1a3d5f]" />
                <div className="p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white bg-[#2563BA] px-2 py-1 rounded">
                      Intermediate
                    </span>
                    <span className="flex items-center gap-1 text-xs font-semibold text-[#0C1F33]">
                      <Star className="w-3 h-3 text-[#B8912F] fill-[#B8912F]" />
                      {course.rating}
                    </span>
                  </div>
                  <h3 className="font-marcellus text-lg text-[#0C1F33] leading-6 min-h-[48px]">
                    {course.title}
                  </h3>
                  <p className="text-[13px] text-[#64748B]">
                    {course.instructor}
                  </p>
                  <div className="border-t border-[#E3E8EF] pt-3 mt-auto">
                    <span className="text-[13px] font-semibold text-[#12304E] cursor-pointer hover:underline">
                      Learn More &rarr;
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
