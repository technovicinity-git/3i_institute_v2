"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Maximize, Edit3, Bookmark, Save } from "lucide-react";
import { toast } from "sonner";
import { useProfileStore } from "@/stores/profile-store";
import {
  useCourseContent,
  useLessonNotes,
  useSaveNoteMutation,
  useUpdateProgressMutation,
  useLessonVideoUrl,
} from "@/hooks/use-lesson";
import { VideoPlayer } from "@/components/lesson/video-player";
import { CourseContentSidebar } from "@/components/lesson/course-content-sidebar";

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const lessonId = params.lessonId as string;

  const { activeProfile } = useProfileStore();
  const { data: courseContent, isLoading } = useCourseContent(courseId);
  const { data: noteData } = useLessonNotes(activeProfile?.id ?? "", lessonId);
  const saveNoteMutation = useSaveNoteMutation();
  const updateProgressMutation = useUpdateProgressMutation();

  const [activeTab, setActiveTab] = useState<"overview" | "notes">("overview");
  const [expandedModule, setExpandedModule] = useState<string>("module-1");
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [notes, setNotes] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLDivElement>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { data: videoUrlData, isLoading: videoLoading } =
    useLessonVideoUrl(lessonId);

  // Load existing note
  useEffect(() => {
    if (noteData?.details?.content) {
      setNotes(noteData.details.content);
    }
  }, [noteData]);

  // Find current lesson
  const currentLesson = courseContent?.modules
    ?.flatMap((m) => m.lessons)
    ?.find((l) => l.id === lessonId);

  const handleSaveNote = () => {
    if (!activeProfile || !notes.trim()) {
      toast.error("Note cannot be empty");
      return;
    }

    saveNoteMutation.mutate(
      {
        learnerProfileId: activeProfile.id,
        materialId: lessonId,
        content: notes.trim(),
      },
      {
        onSuccess: () => {
          setNoteSaved(true);
          setTimeout(() => setNoteSaved(false), 2000);
        },
      },
    );
  };

  const handleProgressUpdate = (seconds: number, position: number) => {
    if (!activeProfile) return;

    updateProgressMutation.mutate({
      learnerProfileId: activeProfile.id,
      materialId: lessonId,
      watchedSeconds: seconds,
      lastPosition: position,
    });
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      // Start progress tracking
      progressTimerRef.current = setInterval(() => {
        setProgress((prev) => Math.min(100, prev + 0.1));
      }, 1000);
    } else {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    }
  };

  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(
      0,
      Math.min(100, ((e.clientX - rect.left) / rect.width) * 100),
    );
    setProgress(pct);
  };

  const cyclePlaybackSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length]!;
    setPlaybackSpeed(nextSpeed);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (isLoading || !courseContent) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#FBF9F4]">
        <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="flex h-screen min-h-0 bg-[#FBF9F4] overflow-hidden"
      style={{ fontFamily: "'Figtree', sans-serif" }}
    >
      {/* LEFT: Video + Lesson */}
      <div className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16 px-6 bg-[#12304E] shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => router.push(`/my-courses/${courseId}`)}
              className="shrink-0 text-white/80 hover:text-white"
            >
              <ArrowLeft className="w-[18px] h-[18px]" />
            </button>
            <span className="text-base font-semibold text-white truncate">
              {courseContent.courseTitle}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <span className="text-[13px] text-white/90">
              {Math?.round(courseContent.progress) || 0}% complete
            </span>
            <div className="w-56 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#22A146] rounded-full"
                style={{ width: `${courseContent.progress}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <button className="text-white/80 hover:text-white">
              <Edit3 className="w-[18px] h-[18px]" />
            </button>
            <button className="text-white/80 hover:text-white">
              <Bookmark className="w-[18px] h-[18px]" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="text-white/80 hover:text-white"
            >
              <Maximize className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {/* Video */}
          {videoLoading ? (
            <div className="relative w-full aspect-video bg-[#111] flex items-center justify-center">
              <div className="w-10 h-10 rounded-full border-4 border-white border-t-transparent animate-spin" />
            </div>
          ) : videoUrlData?.url ? (
            <VideoPlayer
              videoUrl={videoUrlData.url}
              onProgress={(seconds, position) => {
                if (activeProfile) {
                  updateProgressMutation.mutate({
                    learnerProfileId: activeProfile.id,
                    materialId: lessonId,
                    watchedSeconds: Math?.floor(seconds) || 0,
                    lastPosition: Math?.floor(position) || 0,
                  });
                }
              }}
              onComplete={() => {
                if (activeProfile) {
                  updateProgressMutation.mutate({
                    learnerProfileId: activeProfile.id,
                    materialId: lessonId,
                    watchedSeconds: 999999,
                    lastPosition: 0,
                  });
                }
              }}
            />
          ) : (
            <div className="relative w-full aspect-video bg-[#111] flex items-center justify-center">
              <p className="text-white/60 text-sm">Video unavailable</p>
            </div>
          )}

          {/* Controls */}
          {/* <div className="flex items-center gap-4 h-[42px] px-6 bg-[#12304E] shrink-0">
            <div className="flex items-center gap-4 shrink-0">
              <button
                onClick={togglePlayback}
                className="text-white/80 hover:text-white"
              >
                {isPlaying ? (
                  <Pause className="w-[18px] h-[18px]" />
                ) : (
                  <Play className="w-[18px] h-[18px]" />
                )}
              </button>
              <button className="text-white/80 hover:text-white">
                <SkipForward className="w-[18px] h-[18px]" />
              </button>
              <span className="text-[13px] text-white">
                {currentLesson?.duration
                  ? `${Math.floor(currentLesson.duration / 60)}:${String(currentLesson.duration % 60).padStart(2, "0")}`
                  : "00:00"}
              </span>
            </div>

            <div
              onClick={handleScrub}
              className="flex-1 relative flex items-center cursor-pointer group h-6"
            >
              <div className="w-full h-1.5 bg-white/30 rounded-full">
                <div
                  className="h-full bg-[#22A146] rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <button className="text-white/80 hover:text-white">
                <Volume2 className="w-[18px] h-[18px]" />
              </button>
              <button
                onClick={cyclePlaybackSpeed}
                className="text-[13px] font-semibold text-white/90"
              >
                {playbackSpeed}x
              </button>
              <button className="text-white/80 hover:text-white">
                <Subtitles className="w-[18px] h-[18px]" />
              </button>
              <button className="text-white/80 hover:text-white">
                <Settings className="w-[18px] h-[18px]" />
              </button>
              <button
                onClick={toggleFullscreen}
                className="text-white/80 hover:text-white"
              >
                <Maximize className="w-[18px] h-[18px]" />
              </button>
            </div>
          </div> */}

          {/* Lesson detail */}
          <section className="w-full bg-[#FBF9F4]">
            <div className="px-6 sm:px-8 pt-6 pb-12">
              <div className="w-full max-w-4xl mx-auto">
                <h1
                  className="text-[28px] sm:text-[32px] text-[#0C1F33]"
                  style={{ fontFamily: "'Marcellus', serif" }}
                >
                  {currentLesson?.title ?? "Lesson"}
                </h1>
                <p className="mt-2 text-[13px] text-[#475569]">
                  Course: {courseContent.courseTitle}
                </p>

                {/* Tabs */}
                <div className="flex mt-6 border-b border-[#E3E8EF]">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`px-2 py-3 mr-6 text-[15px] border-b-2 transition-colors ${
                      activeTab === "overview"
                        ? "text-[#157A34] border-[#157A34]"
                        : "text-[#475569] border-transparent"
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab("notes")}
                    className={`px-2 py-3 text-[15px] border-b-2 transition-colors ${
                      activeTab === "notes"
                        ? "text-[#157A34] border-[#157A34]"
                        : "text-[#475569] border-transparent"
                    }`}
                  >
                    Notes
                  </button>
                </div>

                {/* Overview */}
                {activeTab === "overview" && (
                  <div className="pt-6">
                    <p className="text-base leading-6 text-[#0C1F33]">
                      This lesson covers {currentLesson?.title}. Watch the video
                      and take notes as needed.
                    </p>
                  </div>
                )}

                {/* Notes */}
                {activeTab === "notes" && (
                  <div className="pt-6 space-y-4">
                    <p className="text-[13px] text-[#475569]">
                      Add personal notes for this lesson.
                    </p>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Start typing your notes here..."
                      className="w-full min-h-[200px] px-4 py-3 bg-white border border-[#E3E8EF] rounded-lg text-base text-[#0C1F33] placeholder-[#64748B] resize-y focus:outline-none focus:ring-2 focus:ring-[#22A146]/30"
                    />
                    <button
                      onClick={handleSaveNote}
                      disabled={saveNoteMutation.isPending || !notes.trim()}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#22A146] text-white rounded-lg text-sm font-semibold hover:bg-[#1E9040] disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {saveNoteMutation.isPending ? "Saving..." : "Save Note"}
                    </button>
                    {noteSaved && (
                      <p className="text-[12px] text-[#157A34]">✓ Note saved</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
      {/* RIGHT: Sidebar */}
      <aside className="w-[380px] shrink-0 bg-white border-l border-[#E3E8EF] flex flex-col overflow-hidden hidden lg:flex">
        <CourseContentSidebar
          courseId={courseId}
          currentLessonId={lessonId}
          courseContent={courseContent}
        />
      </aside>
    </div>
  );
}
