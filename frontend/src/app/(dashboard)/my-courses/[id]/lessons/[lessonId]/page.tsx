"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";
import { toast } from "sonner";
import { useProfileStore } from "@/stores/profile-store";
import {
  useCourseContent,
  useLessonNotes,
  useSaveNoteMutation,
  useUpdateProgressMutation,
  useLessonMaterialUrl,
  useMaterialProgress,
} from "@/hooks/use-lesson";
import { VideoPlayer } from "@/components/lesson/video-player";
import { CourseContentSidebar } from "@/components/lesson/course-content-sidebar";
import { useQueryClient } from "@tanstack/react-query";
import { DocumentViewer } from "@/components/lesson/document-viewer";

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const courseId = params.id as string;
  const lessonId = params.lessonId as string;

  const { activeProfile } = useProfileStore();
  const { data: courseContent, isLoading } = useCourseContent(
    courseId,
    activeProfile?.id,
  );

  const { data: noteData } = useLessonNotes(activeProfile?.id ?? "", lessonId);
  const saveNoteMutation = useSaveNoteMutation();
  const updateProgressMutation = useUpdateProgressMutation();

  const [activeTab, setActiveTab] = useState<"overview" | "notes">("overview");

  const [notes, setNotes] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);

  const progressDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const { data: progressData } = useMaterialProgress(
    activeProfile?.id ?? "",
    lessonId,
  );

  const { data: materialUrlData, isLoading: materialLoading } =
    useLessonMaterialUrl(lessonId);

  // Flatten all lessons in order
  const allLessons = courseContent?.modules?.flatMap((m) => m.lessons) ?? [];
  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < allLessons.length - 1
      ? allLessons[currentIndex + 1]
      : null;

  const goToLesson = (targetLessonId: string) => {
    router.push(`/my-courses/${courseId}/lessons/${targetLessonId}`);
  };

  // Debounced progress update
  const handleProgressUpdate = useCallback(
    (seconds: number, position: number) => {
      if (!activeProfile) return;

      if (progressDebounceRef.current) {
        clearTimeout(progressDebounceRef.current);
      }

      progressDebounceRef.current = setTimeout(() => {
        // Check if we should mark as complete (90% of video duration)
        const videoElement = document.querySelector("video");
        const videoDuration = videoElement?.duration ?? 0;
        const isComplete = videoDuration > 0 && seconds >= videoDuration * 0.9;

        updateProgressMutation.mutate(
          {
            learnerProfileId: activeProfile.id,
            materialId: lessonId,
            watchedSeconds: Math.floor(seconds),
            lastPosition: Math.floor(position),
            completed: isComplete,
          },
          {
            onSuccess: () => {
              queryClient.invalidateQueries({
                queryKey: ["material-progress"],
              });
              queryClient.invalidateQueries({
                queryKey: ["course-content", courseId, activeProfile.id],
              });
            },
          },
        );
      }, 5000);
    },
    [queryClient, activeProfile, lessonId, updateProgressMutation, courseId],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressDebounceRef.current) {
        clearTimeout(progressDebounceRef.current);
      }
    };
  }, []);

  // Load existing note
  useEffect(() => {
    if (noteData?.details?.content) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
        {/* Scrollable content */}
        <div className="flex-1 pl-4 pt-4 min-h-0 overflow-y-auto">
          {/* Video */}
          {/* Media content */}
          {materialLoading ? (
            <div className="relative w-full aspect-video bg-[#111] flex items-center justify-center">
              <div className="w-10 h-10 rounded-full border-4 border-white border-t-transparent animate-spin" />
            </div>
          ) : !materialUrlData?.url ? (
            <div className="relative w-full aspect-video bg-[#111] flex items-center justify-center">
              <p className="text-white/60 text-sm">Content unavailable</p>
            </div>
          ) : materialUrlData.contentType === "document" ? (
            /* Document — inline PDF viewer, no download */
            <div className="w-full rounded-lg border border-[#E3E8EF] bg-white overflow-hidden">
              <iframe
                src={`${materialUrlData.url}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
                className="w-full h-[75vh]"
                title={currentLesson?.title ?? "Document"}
              />
              <div className="px-4 py-3 bg-[#FBF9F4] border-t border-[#E3E8EF] text-xs text-[#64748B] text-center">
                Read-only preview • Please read through the document
              </div>
            </div>
          ) : (
            /* Video */
            <VideoPlayer
              videoUrl={materialUrlData.url}
              initialPosition={progressData?.lastPosition ?? 0}
              onProgress={handleProgressUpdate}
              onComplete={() => {
                if (activeProfile) {
                  updateProgressMutation.mutate({
                    learnerProfileId: activeProfile.id,
                    materialId: lessonId,
                    watchedSeconds:
                      Math.floor(progressData?.watchedSeconds ?? 0) + 999,
                    lastPosition: 0,
                    completed: true,
                  });
                }

                if (nextLesson) {
                  setTimeout(() => {
                    router.push(
                      `/my-courses/${courseId}/lessons/${nextLesson.id}`,
                    );
                  }, 1500);
                }
              }}
            />
          )}

          {/* Auto-mark document complete after 30 seconds */}
          {materialUrlData?.contentType === "document" && (
            <DocumentCompletionTracker
              activeProfileId={activeProfile?.id}
              materialId={lessonId}
              courseId={courseId}
              onComplete={() => {
                queryClient.invalidateQueries({
                  queryKey: ["material-progress"],
                });
                queryClient.invalidateQueries({
                  queryKey: ["course-content", courseId, activeProfile?.id],
                });
              }}
            />
          )}

          {/* Previous / Next navigation */}
          <div className="flex items-center justify-between gap-4 mt-10 pt-6 border-t border-[#E3E8EF]">
            <button
              onClick={() => previousLesson && goToLesson(previousLesson.id)}
              disabled={!previousLesson}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                previousLesson
                  ? "border border-[#E3E8EF] text-[#0C1F33] hover:bg-gray-50"
                  : "border border-[#E3E8EF] text-[#94A3B8] cursor-not-allowed opacity-50"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            <button
              onClick={() => nextLesson && goToLesson(nextLesson.id)}
              disabled={!nextLesson}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                nextLesson
                  ? "bg-[#22A146] text-white hover:bg-[#1E9040]"
                  : "bg-gray-100 text-[#94A3B8] cursor-not-allowed opacity-50"
              }`}
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

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
                    {currentLesson?.description ? (
                      <p className="text-base leading-6 text-[#0C1F33] whitespace-pre-wrap">
                        {currentLesson.description}
                      </p>
                    ) : (
                      <p className="text-base leading-6 text-[#64748B] italic">
                        No overview available for this lesson.
                      </p>
                    )}
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

function DocumentCompletionTracker({
  activeProfileId,
  materialId,
  courseId,
  onComplete,
}: {
  activeProfileId?: string;
  materialId: string;
  courseId: string;
  onComplete: () => void;
}) {
  const updateProgressMutation = useUpdateProgressMutation();

  useEffect(() => {
    if (!activeProfileId) return;

    const timer = setTimeout(() => {
      updateProgressMutation.mutate(
        {
          learnerProfileId: activeProfileId,
          materialId,
          watchedSeconds: 30,
          lastPosition: 0,
          completed: true,
        },
        {
          onSuccess: () => {
            onComplete();
          },
        },
      );
    }, 30 * 1000);

    return () => clearTimeout(timer);
  }, [
    activeProfileId,
    materialId,
    courseId,
    updateProgressMutation,
    onComplete,
  ]);

  return null;
}
