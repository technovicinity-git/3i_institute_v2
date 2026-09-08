// app/course/lesson/page.tsx
"use client";

import { useState, useRef } from "react";
import {
  ArrowLeft,
  Play,
  Pause,
  SkipForward,
  Volume2,
  Subtitles,
  Settings,
  Maximize,
  Maximize2,
  Edit3,
  Bookmark,
  Check,
  ChevronDown,
  ChevronUp,
  Lock,
  User,
} from "lucide-react";

/* ========== Types ========== */
interface Lesson {
  id: string;
  title: string;
  duration: string;
  status: "completed" | "current" | "locked";
}

interface Module {
  id: string;
  number: number;
  title: string;
  status: "completed" | "in-progress" | "locked";
  lessons: Lesson[];
}

/* ========== Data ========== */
const modules: Module[] = [
  {
    id: "m1",
    number: 1,
    title: "Arabic Alphabet & Sounds",
    status: "completed",
    lessons: [],
  },
  {
    id: "m2",
    number: 2,
    title: "Core Pronunciation",
    status: "in-progress",
    lessons: [
      {
        id: "l1",
        title: "Introduction to Vowel Marks",
        duration: "8:20",
        status: "completed",
      },
      {
        id: "l2",
        title: "Long vs Short Vowels",
        duration: "12:45",
        status: "completed",
      },
      {
        id: "l3",
        title: "Understanding Tajweed Rules",
        duration: "45:20",
        status: "current",
      },
      {
        id: "l4",
        title: "Consonant Clusters",
        duration: "15:30",
        status: "locked",
      },
      {
        id: "l5",
        title: "Practice Session: Minimal Pairs",
        duration: "20:00",
        status: "locked",
      },
    ],
  },
  {
    id: "m3",
    number: 3,
    title: "Conversational Phrases",
    status: "locked",
    lessons: [],
  },
];

const learningPoints = [
  "Distinguish between similar-sounding consonants like ث (thā) and ت (tā)",
  "Understand and apply the four rules of noon saakinah and tanween",
  "Identify the correct makhārij (articulation points) for throat and tongue letters",
  "Practice minimal-pair exercises to sharpen your pronunciation accuracy",
];

/* ========== Main Page ========== */
export default function VideoPlayerPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "notes">("overview");
  const [expandedModule, setExpandedModule] = useState<string>("m2");
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(45);
  const [notes, setNotes] = useState("");
  const scrubberRef = useRef<HTMLDivElement>(null);

  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrubberRef.current) return;
    const rect = scrubberRef.current.getBoundingClientRect();
    const pct = Math.max(
      0,
      Math.min(100, ((e.clientX - rect.left) / rect.width) * 100),
    );
    setProgress(pct);
  };

  return (
    <div className="flex h-screen min-h-0 bg-[#FBF9F4] overflow-hidden font-figtree">
      {" "}
      {/* ==================== LEFT: Video + Lesson Detail ==================== */}{" "}
      <div className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden">
        {" "}
        {/* ── Top Status Bar ── */}{" "}
        <div className="flex items-center justify-between h-16 px-6 bg-[#12304E] shrink-0">
          {" "}
          <div className="flex items-center gap-4 min-w-0">
            {" "}
            <button className="shrink-0 text-white/80 hover:text-white transition-colors">
              {" "}
              <ArrowLeft className="w-[18px] h-[18px]" strokeWidth={2} />{" "}
            </button>{" "}
            <span className="text-base font-semibold text-white truncate">
              {" "}
              Conversational Arabic for Beginners{" "}
            </span>{" "}
          </div>{" "}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {" "}
            <span className="text-[13px] text-white/90">67% complete</span>{" "}
            <div className="w-56 h-1.5 bg-[#0C1F33] rounded-full overflow-hidden">
              {" "}
              <div className="h-full w-[67%] bg-[#22A146] rounded-full" />{" "}
            </div>{" "}
          </div>{" "}
          <div className="flex items-center gap-4 shrink-0">
            {" "}
            {[Edit3, Bookmark, Maximize2].map((Icon, i) => (
              <button
                key={i}
                className="text-white/80 hover:text-white transition-colors"
              >
                {" "}
                <Icon className="w-[18px] h-[18px]" strokeWidth={2} />{" "}
              </button>
            ))}{" "}
          </div>{" "}
        </div>{" "}
        {/* ── Scrollable Main Content ── */}{" "}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {" "}
          {/* Video */}{" "}
          <div className="relative w-full aspect-video bg-[#111] overflow-hidden">
            {" "}
            <div className="absolute inset-0 bg-gradient-to-br from-[#2c3e50] via-[#34495e] to-[#1a1a2e]" />{" "}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="absolute inset-0 flex items-center justify-center z-10 group"
            >
              {" "}
              <div className="w-20 h-20 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center group-hover:bg-black/70 transition-all group-hover:scale-105">
                {" "}
                {isPlaying ? (
                  <Pause className="w-8 h-8 text-white" fill="white" />
                ) : (
                  <Play className="w-8 h-8 text-white ml-1" fill="white" />
                )}{" "}
              </div>{" "}
            </button>{" "}
          </div>{" "}
          {/* Player Control Bar */}{" "}
          <div className="flex items-center gap-4 h-[42px] px-6 bg-[#12304E] shrink-0">
            {" "}
            <div className="flex items-center gap-4 shrink-0">
              {" "}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="text-white/80 hover:text-white transition-colors"
              >
                {" "}
                {isPlaying ? (
                  <Pause className="w-[18px] h-[18px]" strokeWidth={2} />
                ) : (
                  <Play className="w-[18px] h-[18px]" strokeWidth={2} />
                )}{" "}
              </button>{" "}
              <button className="text-white/80 hover:text-white transition-colors">
                {" "}
                <SkipForward
                  className="w-[18px] h-[18px]"
                  strokeWidth={2}
                />{" "}
              </button>{" "}
              <span className="text-[13px] text-white tabular-nums whitespace-nowrap">
                {" "}
                12:34 / 45:20{" "}
              </span>{" "}
            </div>{" "}
            <div
              ref={scrubberRef}
              onClick={handleScrub}
              className="flex-1 relative flex items-center cursor-pointer group h-6 min-w-[80px]"
            >
              {" "}
              <div className="w-full h-1.5 bg-white/30 rounded-full relative">
                {" "}
                <div
                  className="h-full bg-[#22A146] rounded-full relative transition-all"
                  style={{ width: `${progress}%` }}
                >
                  {" "}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
            <div className="flex items-center gap-4 shrink-0">
              {" "}
              <button className="text-white/80 hover:text-white">
                {" "}
                <Volume2 className="w-[18px] h-[18px]" />{" "}
              </button>{" "}
              <button className="text-[13px] font-semibold text-white/90">
                {" "}
                1.25x{" "}
              </button>{" "}
              <button className="text-white/80 hover:text-white">
                {" "}
                <Subtitles className="w-[18px] h-[18px]" />{" "}
              </button>{" "}
              <button className="text-white/80 hover:text-white">
                {" "}
                <Settings className="w-[18px] h-[18px]" />{" "}
              </button>{" "}
              <button className="text-white/80 hover:text-white">
                {" "}
                <Maximize className="w-[18px] h-[18px]" />{" "}
              </button>{" "}
            </div>{" "}
          </div>{" "}
          {/* ── Lesson Detail Section ── */}{" "}
          <section className="w-full bg-[#FBF9F4]">
            {" "}
            <div className="px-6 sm:px-8 pt-6 pb-12">
              {" "}
              <div className="w-full max-w-4xl mx-auto">
                {" "}
                {/* Title */}{" "}
                <h1 className="font-marcellus text-[28px] sm:text-[32px] leading-[38px] sm:leading-[40px] text-[#0C1F33]">
                  {" "}
                  Lesson 3 — Understanding Tajweed Rules{" "}
                </h1>{" "}
                <p className="mt-2 text-[13px] leading-5 text-[#475569]">
                  {" "}
                  Course: Conversational Arabic for Beginners • Module 2: Core
                  Pronunciation{" "}
                </p>{" "}
                {/* Tabs */}{" "}
                <div className="flex mt-6 border-b border-[#E3E8EF]">
                  {" "}
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`px-2 py-3 mr-6 text-[15px] border-b-2 transition-colors ${activeTab === "overview" ? "font-medium text-[#157A34] border-[#157A34]" : "font-semibold text-[#475569] border-transparent hover:text-[#0C1F33]"}`}
                  >
                    {" "}
                    Overview{" "}
                  </button>{" "}
                  <button
                    onClick={() => setActiveTab("notes")}
                    className={`px-2 py-3 text-[15px] border-b-2 transition-colors ${activeTab === "notes" ? "font-medium text-[#157A34] border-[#157A34]" : "font-semibold text-[#475569] border-transparent hover:text-[#0C1F33]"}`}
                  >
                    {" "}
                    Notes{" "}
                  </button>{" "}
                </div>{" "}
                {/* Overview */}{" "}
                {activeTab === "overview" && (
                  <div className="pt-6 space-y-8">
                    {" "}
                    <p className="text-base leading-6 text-[#0C1F33]">
                      {" "}
                      This lesson introduces the essential tajweed rules that
                      govern how Arabic letters are pronounced when reading
                      aloud. You&apos;ll learn why precise articulation matters
                      — not just for clarity, but for preserving the meaning and
                      beauty of Quranic recitation. The lesson walks through the
                      core rules for noon saakinah and tanween, demonstrates the
                      differences between commonly confused consonants, and
                      gives you guided practice with minimal pairs. By the end,
                      you should be able to identify and apply these rules in
                      your own recitation with confidence.{" "}
                    </p>{" "}
                    <div>
                      {" "}
                      <h3 className="text-base font-semibold text-[#0C1F33] mb-4">
                        {" "}
                        In this lesson{" "}
                      </h3>{" "}
                      <ul className="space-y-3.5">
                        {" "}
                        {learningPoints.map((point, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            {" "}
                            <span className="text-sm font-medium text-[#157A34] mt-[2px] shrink-0">
                              {" "}
                              ✓{" "}
                            </span>{" "}
                            <span className="text-[15px] leading-[22px] text-[#0C1F33]">
                              {" "}
                              {point}{" "}
                            </span>{" "}
                          </li>
                        ))}{" "}
                      </ul>{" "}
                    </div>{" "}
                  </div>
                )}{" "}
                {/* Notes */}{" "}
                {activeTab === "notes" && (
                  <div className="pt-6 space-y-4">
                    {" "}
                    <p className="text-[13px] text-[#475569]">
                      {" "}
                      Add personal notes for this lesson. Your notes are saved
                      automatically.{" "}
                    </p>{" "}
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Start typing your notes here..."
                      className="w-full min-h-[200px] px-4 py-3 bg-white border border-[#E3E8EF] rounded-lg text-base text-[#0C1F33] placeholder-[#64748B] resize-y focus:outline-none focus:ring-2 focus:ring-[#22A146]/30 focus:border-[#22A146]"
                    />{" "}
                    {notes && (
                      <p className="text-[12px] text-[#157A34]">
                        {" "}
                        ✓ Notes saved{" "}
                      </p>
                    )}{" "}
                  </div>
                )}{" "}
                {/* Navigation */}{" "}
                <div className="flex items-center justify-between gap-4 mt-10 pt-4 border-t border-[#E3E8EF]">
                  {" "}
                  <button className="h-[38px] px-4 border border-[#E3E8EF] rounded-lg text-[15px] font-semibold text-[#0C1F33] hover:bg-white hover:border-[#CBD5E1] transition-colors">
                    {" "}
                    Previous Lesson{" "}
                  </button>{" "}
                  <button className="h-[38px] px-5 bg-[#22A146] hover:bg-[#1B8A3A] rounded-lg text-[15px] font-semibold text-[#0C1F33] transition-colors">
                    {" "}
                    Next Lesson{" "}
                  </button>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
          </section>{" "}
        </div>{" "}
      </div>
      {/* ==================== RIGHT: Course Content Sidebar ==================== */}
      <aside className="w-[432px] shrink-0 bg-white border-l border-[#E3E8EF] flex flex-col overflow-hidden">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E3E8EF] shrink-0">
          <h2 className="font-marcellus text-xl text-[#0C1F33]">
            Course content
          </h2>
          <button className="w-10 h-5 rounded-full border border-[#E3E8EF] flex items-center justify-center hover:bg-gray-50 transition-colors">
            <User
              className="w-[18px] h-[18px] text-[#0C1F33]"
              strokeWidth={2}
            />
          </button>
        </div>

        {/* Stats */}
        <div className="px-6 py-3 shrink-0">
          <span className="text-[13px] text-[#475569]">
            24 lessons • 6h 30m
          </span>
        </div>

        {/* Module Accordion */}
        <div className="flex-1 overflow-y-auto">
          {modules.map((mod) => (
            <ModuleAccordion
              key={mod.id}
              module={mod}
              isExpanded={expandedModule === mod.id}
              onToggle={() =>
                setExpandedModule(expandedModule === mod.id ? "" : mod.id)
              }
            />
          ))}
        </div>
      </aside>
    </div>
  );
}

/* ========== Module Accordion ========== */
function ModuleAccordion({
  module: mod,
  isExpanded,
  onToggle,
}: {
  module: Module;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-[#E3E8EF]">
      {/* Module Header */}
      <button
        onClick={mod.status !== "locked" ? onToggle : undefined}
        className={`w-full flex items-center justify-between px-6 py-4 text-left transition-colors ${
          mod.status === "locked"
            ? "cursor-default"
            : "hover:bg-[#FAFAF8] cursor-pointer"
        } ${isExpanded && mod.status === "in-progress" ? "bg-[#FBF9F4]" : ""}`}
      >
        <div>
          <p
            className={`text-[11px] font-bold uppercase tracking-wider ${
              mod.status === "in-progress" ? "text-[#157A34]" : "text-[#475569]"
            }`}
          >
            MODULE {mod.number}
          </p>
          <p
            className={`text-sm font-medium mt-1 ${
              mod.status === "locked" ? "text-[#475569]" : "text-[#0C1F33]"
            }`}
          >
            {mod.title}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {mod.status === "completed" && (
            <span className="text-xs font-semibold text-[#157A34]">
              Completed
            </span>
          )}
          {mod.status === "locked" ? (
            <Lock className="w-4 h-4 text-[#475569]" />
          ) : isExpanded ? (
            <ChevronUp className="w-4 h-4 text-[#475569]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#475569]" />
          )}
        </div>
      </button>

      {/* Expanded Lessons */}
      {isExpanded && mod.lessons.length > 0 && (
        <div className="border-t border-[#E3E8EF]">
          {mod.lessons.map((lesson) => (
            <LessonRow key={lesson.id} lesson={lesson} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ========== Lesson Row ========== */
function LessonRow({ lesson }: { lesson: Lesson }) {
  const isCurrent = lesson.status === "current";
  const isCompleted = lesson.status === "completed";

  return (
    <button
      className={`w-full flex items-center gap-4 px-6 py-4 text-left transition-colors ${
        isCurrent
          ? "bg-[#F2FBF4] border-l-[3px] border-l-[#22A146]"
          : "border-l-[3px] border-l-transparent hover:bg-[#FAFAF8]"
      }`}
    >
      {/* Status Icon */}
      {isCompleted ? (
        <div className="w-5 h-5 rounded-full bg-[#22A146] flex items-center justify-center shrink-0">
          <Check className="w-3 h-3 text-[#0C1F33]" strokeWidth={3} />
        </div>
      ) : isCurrent ? (
        <div className="w-5 h-5 rounded-full bg-[#157A34] flex items-center justify-center shrink-0">
          <Play
            className="w-[10px] h-[10px] text-white ml-[1px]"
            fill="white"
            strokeWidth={0}
          />
        </div>
      ) : (
        <div className="w-5 h-5 rounded-full border-2 border-[#E3E8EF] shrink-0" />
      )}

      {/* Lesson Info */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm leading-[17px] truncate ${
            isCurrent ? "font-semibold text-[#0C1F33]" : "text-[#0C1F33]"
          }`}
        >
          {lesson.title}
        </p>
        <p
          className={`text-xs mt-1 ${
            isCurrent ? "text-[#157A34]" : "text-[#475569]"
          }`}
        >
          {isCurrent ? `Now Playing • ${lesson.duration}` : lesson.duration}
        </p>
      </div>
    </button>
  );
}
