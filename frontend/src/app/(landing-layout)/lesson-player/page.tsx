"use client";

import { useState } from "react";

// ===================== ICONS =====================

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
    >
      <path
        d="M15 9H3M3 9L9 3M3 9L9 15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
    >
      <path
        d="M5 3L15 9L5 15V3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SkipForwardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M4 14L10 9L4 4V14Z"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="14"
        y1="4"
        x2="14"
        y2="14"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function VolumeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M1 7.5V10.5H4L8 14.5V3.5L4 7.5H1Z"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M13 2L16 5L5.5 15.5H2.5V12.5L13 2Z"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M14 16L9 12L4 16V3C4 2.44772 4.44772 2 5 2H13C13.5523 2 14 2.44772 14 3V16Z"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MaximizeIcon({ color = "white" }: { color?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M3 7V3H7M11 3H15V7M15 11V15H11M7 15H3V11"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="3" stroke="white" strokeWidth="1.2" />
      <path
        d="M14.7 11.1L13.9 12.5L12.3 12L11.5 12.7L12 14.3L10.6 15.1L9.7 13.7H8.7L7.8 15.1L6.4 14.3L6.9 12.7L6.1 12L4.5 12.5L3.7 11.1L5.1 10.1V9.1L3.7 8.1L4.5 6.7L6.1 7.2L6.9 6.5L6.4 4.9L7.8 4.1L8.7 5.5H9.7L10.6 4.1L12 4.9L11.5 6.5L12.3 7.2L13.9 6.7L14.7 8.1L13.3 9.1V10.1L14.7 11.1Z"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TvIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect
        x="2"
        y="3"
        width="14"
        height="10"
        rx="1"
        stroke="white"
        strokeWidth="1.2"
      />
      <line
        x1="7"
        y1="16"
        x2="11"
        y2="16"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <line
        x1="9"
        y1="13"
        x2="9"
        y2="16"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckCircleIcon({ color = "#22A146" }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke={color} strokeWidth="1.3" />
      <path
        d="M5 8L7 10L11 6"
        stroke={color}
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlayCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="#22A146" strokeWidth="1.3" />
      <path
        d="M6.5 5.5L11 8L6.5 10.5V5.5Z"
        stroke="#22A146"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronDownIcon({ color = "#64748B" }: { color?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M3.5 5.25L7 8.75L10.5 5.25"
        stroke={color}
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronUpIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M3.5 8.75L7 5.25L10.5 8.75"
        stroke="#12304E"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AwardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="7" r="5" stroke="#B8912F" strokeWidth="1.3" />
      <path
        d="M7.5 11.5L6 18L10 16L14 18L12.5 11.5"
        stroke="#B8912F"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect
        x="3"
        y="6.5"
        width="8"
        height="6"
        rx="1"
        stroke="#64748B"
        strokeWidth="1.2"
      />
      <path
        d="M5 6.5V4.5C5 3.39543 5.89543 2.5 7 2.5C8.10457 2.5 9 3.39543 9 4.5V6.5"
        stroke="#64748B"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EmptyCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="#94A3B8" strokeWidth="1.3" />
    </svg>
  );
}

// ===================== TOP BAR =====================

function TopBar() {
  return (
    <header className="flex items-center justify-between w-full h-16 px-6 lg:px-10 bg-[#12304E] shrink-0">
      {/* Left: back + title */}
      <div className="flex items-center gap-4 text-white min-w-0">
        <button aria-label="Go back" className="shrink-0 hover:opacity-80">
          <ArrowLeftIcon className="text-white" />
        </button>
        <h1
          className="text-base lg:text-lg text-white truncate"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          Islamic Bioethics in Clinical Practice
        </h1>
      </div>

      {/* Center: progress */}
      <div className="hidden md:flex items-center gap-3 shrink-0">
        <span className="text-xs text-white whitespace-nowrap">
          62% complete
        </span>
        <div className="w-48 lg:w-[311px] h-1.5 bg-white/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#22A146] rounded-full"
            style={{ width: "62%" }}
          />
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-4 shrink-0">
        <button aria-label="Notes" className="hover:opacity-80 hidden sm:block">
          <EditIcon />
        </button>
        <button
          aria-label="Bookmark"
          className="hover:opacity-80 hidden sm:block"
        >
          <BookmarkIcon />
        </button>
        <button aria-label="Fullscreen" className="hover:opacity-80">
          <MaximizeIcon />
        </button>
      </div>
    </header>
  );
}

// ===================== VIDEO PLAYER =====================

function VideoPlayer() {
  return (
    <div className="relative w-full aspect-video bg-[#0C1F33] overflow-hidden">
      {/* Placeholder image overlay */}
      <div className="absolute inset-0 bg-[#0C1F33]/35" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0C1F33]/80 to-transparent" />

      {/* Controls bar */}
      <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex items-center gap-3 sm:gap-5 bg-[#0C1F33] rounded-xl px-4 py-3 sm:py-4">
        <button aria-label="Play" className="shrink-0 hover:opacity-80">
          <PlayIcon className="text-white" />
        </button>
        <button
          aria-label="Skip forward"
          className="shrink-0 hover:opacity-80 hidden sm:block"
        >
          <SkipForwardIcon />
        </button>
        <span className="text-xs text-white whitespace-nowrap">
          12:04 / 28:36
        </span>

        {/* Seek bar */}
        <div className="flex-1 h-1.5 bg-white/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#22A146] rounded-full"
            style={{ width: "36%" }}
          />
        </div>

        <button
          aria-label="Volume"
          className="shrink-0 hover:opacity-80 hidden md:block"
        >
          <VolumeIcon />
        </button>
        <span className="text-xs text-white hidden md:inline">1.25x</span>
        <button
          aria-label="Picture-in-picture"
          className="shrink-0 hover:opacity-80 hidden lg:block"
        >
          <TvIcon />
        </button>
        <button
          aria-label="Settings"
          className="shrink-0 hover:opacity-80 hidden lg:block"
        >
          <SettingsIcon />
        </button>
        <button
          aria-label="Fullscreen"
          className="shrink-0 hover:opacity-80 hidden sm:block"
        >
          <MaximizeIcon />
        </button>
      </div>
    </div>
  );
}

// ===================== TABS =====================

const TABS = ["Overview", "Notes", "Resources", "Q&A", "Transcript"] as const;
type Tab = (typeof TABS)[number];

function TabBar({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (t: Tab) => void;
}) {
  return (
    <div className="flex gap-6 sm:gap-8 border-b border-[#E3E8EF] overflow-x-auto">
      {TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`pb-3 text-[15px] font-semibold whitespace-nowrap transition-colors ${
            active === tab
              ? "text-[#22A146] border-b-2 border-[#22A146]"
              : "text-[#64748B] hover:text-[#334155]"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

// ===================== NOTE CARD =====================

interface NoteCardProps {
  timestamp: string;
  savedAgo: string;
  text: string;
}

function NoteCard({ timestamp, savedAgo, text }: NoteCardProps) {
  return (
    <div className="border border-[#E3E8EF] rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center px-2 py-1 bg-[#22A146]/10 rounded text-[10px] font-bold text-[#22A146]">
          {timestamp}
        </span>
        <span className="text-[10px] text-[#64748B]">{savedAgo}</span>
      </div>
      <p className="text-sm text-[#0C1F33] leading-relaxed">{text}</p>
    </div>
  );
}

// ===================== NOTES TAB =====================

function NotesContent() {
  return (
    <div className="flex flex-col gap-6">
      {/* New note input */}
      <div className="flex flex-col gap-3">
        <div className="border border-[#E3E8EF] rounded-lg p-4">
          <textarea
            placeholder="Type your timestamped note here..."
            className="w-full min-h-[60px] text-sm text-[#0C1F33] placeholder:text-[#64748B] resize-none outline-none bg-transparent"
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#22A146]">
            Timestamp 12:04
          </span>
          <button className="px-5 py-2 bg-[#22A146] rounded-md text-xs font-semibold text-white hover:bg-[#1E9040] transition-colors">
            Save note
          </button>
        </div>
      </div>

      {/* Saved notes */}
      <div className="flex flex-col gap-4">
        <NoteCard
          timestamp="08:32"
          savedAgo="Saved 10m ago"
          text="Scholarly consensus on ensoulment timeline (120 days vs earlier opinions) impacts medical guidelines on intervention in high-risk early pregnancies."
        />
        <NoteCard
          timestamp="03:15"
          savedAgo="Saved 20m ago"
          text="Prophetic medicine paradigm prioritizes preservation of life (Hifz al-Nafs) as a primary purpose (Maqasid) of sacred bioethics."
        />
      </div>
    </div>
  );
}

// ===================== LESSON FOOTER =====================

function LessonFooter() {
  return (
    <div className="flex items-center justify-between border-t border-[#E3E8EF] pt-6">
      <button className="px-5 py-3 border border-[#12304E] rounded-lg text-sm font-semibold text-[#12304E] hover:bg-gray-50 transition-colors">
        ← Previous Lesson
      </button>
      <button className="px-5 py-3 bg-[#22A146] rounded-lg text-sm font-semibold text-white hover:bg-[#1E9040] transition-colors">
        Next Lesson →
      </button>
    </div>
  );
}

// ===================== SIDEBAR =====================

interface Lesson {
  title: string;
  duration: string;
  status: "completed" | "active" | "upcoming";
}

interface Module {
  number: number;
  title: string;
  status: "completed" | "active" | "locked";
  lessons?: Lesson[];
  quiz?: { title: string; description: string };
}

const modules: Module[] = [
  { number: 1, title: "Introduction & Core Principles", status: "completed" },
  { number: 2, title: "Sources & Fiqh Methodology", status: "completed" },
  {
    number: 3,
    title: "Bioethics & Embryological Realities",
    status: "active",
    lessons: [
      {
        title: "1. Historical Bioethical Milestones",
        duration: "18 mins",
        status: "completed",
      },
      {
        title: "2. Beginning-of-life Ethics",
        duration: "28 mins",
        status: "active",
      },
      {
        title: "3. End-of-life Decisions & Palliative Care",
        duration: "34 mins",
        status: "upcoming",
      },
    ],
    quiz: {
      title: "Module 3 Final Quiz",
      description: "Test your knowledge to unlock Module 4",
    },
  },
  {
    number: 4,
    title: "Organ Transplantation & Death Criteria",
    status: "locked",
  },
];

function LessonItem({ lesson }: { lesson: Lesson }) {
  const isActive = lesson.status === "active";
  return (
    <div
      className={`flex items-center gap-3 px-6 py-3 border-b border-[#E3E8EF] ${
        isActive ? "bg-[#22A146]/10 border-l-4 border-l-[#22A146]" : ""
      }`}
    >
      <div className="shrink-0">
        {lesson.status === "completed" && <CheckCircleIcon />}
        {lesson.status === "active" && <PlayCircleIcon />}
        {lesson.status === "upcoming" && <EmptyCircleIcon />}
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span
          className={`text-xs ${isActive ? "font-bold" : "font-medium"} text-[#12304E] truncate`}
        >
          {lesson.title}
        </span>
        <span
          className={`text-[10px] ${isActive ? "font-semibold text-[#22A146]" : "text-[#64748B]"}`}
        >
          {isActive ? `Now Playing • ${lesson.duration}` : lesson.duration}
        </span>
      </div>
    </div>
  );
}

function QuizCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3 mx-4 my-3 p-4 bg-[#FFFBF4] border border-[#B8912F] rounded-lg">
      <AwardIcon />
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <span className="text-xs font-bold text-[#12304E]">{title}</span>
        <span className="text-[10px] text-[#64748B]">{description}</span>
      </div>
      <button className="shrink-0 px-3 py-1.5 bg-[#B8912F] rounded-md text-[10px] font-bold text-white hover:bg-[#A57F28] transition-colors">
        Start
      </button>
    </div>
  );
}

function ModuleHeader({ mod }: { mod: Module }) {
  const isActive = mod.status === "active";
  const isLocked = mod.status === "locked";

  return (
    <div
      className={`flex items-center justify-between px-5 py-5 border-b border-[#E3E8EF] ${isActive ? "bg-[#FBF9F4]" : ""} ${isLocked ? "opacity-60" : ""}`}
    >
      <div className="flex flex-col gap-1">
        <span
          className={`text-xs font-semibold ${isActive ? "font-bold text-[#B8912F]" : "text-[#64748B]"}`}
        >
          MODULE {mod.number}
          {isActive ? " • ACTIVE" : ""}
        </span>
        <span
          className={`text-sm ${isActive ? "font-bold" : "font-semibold"} text-[#12304E]`}
        >
          {mod.title}
        </span>
      </div>
      <div className="shrink-0">
        {isLocked ? (
          <LockIcon />
        ) : isActive ? (
          <ChevronUpIcon />
        ) : (
          <ChevronDownIcon />
        )}
      </div>
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="w-full lg:w-[380px] shrink-0 bg-white border-l border-[#E3E8EF] overflow-y-auto">
      {/* Header */}
      <div className="px-6 py-6 border-b border-[#E3E8EF]">
        <h2
          className="text-lg text-[#12304E]"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          Course content
        </h2>
        <p className="text-xs text-[#64748B] mt-1">48 lessons • 26h 40m</p>
      </div>

      {/* Modules */}
      {modules.map((mod) => (
        <div key={mod.number}>
          <ModuleHeader mod={mod} />
          {mod.status === "active" && mod.lessons && (
            <>
              {mod.lessons.map((lesson) => (
                <LessonItem key={lesson.title} lesson={lesson} />
              ))}
              {mod.quiz && (
                <QuizCard
                  title={mod.quiz.title}
                  description={mod.quiz.description}
                />
              )}
            </>
          )}
        </div>
      ))}
    </aside>
  );
}

// ===================== MAIN PAGE =====================

export default function LessonPlayerPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Notes");
  const [showSidebar, setShowSidebar] = useState(true);

  return (
    <div
      className="flex flex-col h-screen bg-[#FBF9F4]"
      style={{ fontFamily: "'Figtree', sans-serif" }}
    >
      <TopBar />

      <div className="flex flex-1 overflow-hidden">
        {/* Main content area */}
        <div className="flex flex-col flex-1 min-w-0 overflow-y-auto">
          <VideoPlayer />

          {/* Below-video content */}
          <div className="bg-white flex-1 p-6 sm:p-8 lg:p-10 flex flex-col gap-8">
            {/* Lesson meta */}
            <div className="flex flex-col gap-3">
              <h2
                className="text-xl sm:text-[22px] text-[#12304E]"
                style={{ fontFamily: "'Marcellus', serif" }}
              >
                Lesson 2 — Beginning-of-life Ethics
              </h2>
              <div className="flex items-center gap-3 flex-wrap text-xs text-[#64748B]">
                <span>Course: Islamic Bioethics</span>
                <span className="w-1 h-1 rounded-full bg-[#64748B]" />
                <span>Module 3: Embryology &amp; Moral Status</span>
              </div>
            </div>

            {/* Tabs */}
            <TabBar active={activeTab} onChange={setActiveTab} />

            {/* Tab content */}
            {activeTab === "Notes" && <NotesContent />}
            {activeTab !== "Notes" && (
              <p className="text-sm text-[#64748B]">
                {activeTab} content will appear here.
              </p>
            )}

            {/* Lesson navigation */}
            <LessonFooter />
          </div>
        </div>

        {/* Sidebar — hidden on mobile, toggle-able */}
        <div className={`${showSidebar ? "block" : "hidden"} hidden lg:block`}>
          <Sidebar />
        </div>
      </div>

      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="lg:hidden fixed bottom-6 right-6 z-50 w-12 h-12 bg-[#12304E] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#1A4068] transition-colors"
        aria-label="Toggle course content"
      >
        <ChevronDownIcon color="white" />
      </button>

      {/* Mobile sidebar overlay */}
      {showSidebar && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/30"
          onClick={() => setShowSidebar(false)}
        >
          <div
            className="absolute right-0 top-0 bottom-0 w-[85%] max-w-[380px]"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar />
          </div>
        </div>
      )}
    </div>
  );
}
