/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { lessonService } from "@/services/lesson.service";

export function useCourseContent(courseId: string) {
  return useQuery({
    queryKey: ["course-content", courseId],
    queryFn: () => lessonService.getCourseContent(courseId),
    enabled: !!courseId,
  });
}

export function useLessonNotes(learnerProfileId: string, materialId: string) {
  return useQuery({
    queryKey: ["lesson-notes", learnerProfileId, materialId],
    queryFn: () => lessonService.getLessonNotes(learnerProfileId, materialId),
    enabled: !!learnerProfileId && !!materialId,
  });
}

export function useSaveNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      learnerProfileId,
      materialId,
      content,
    }: {
      learnerProfileId: string;
      materialId: string;
      content: string;
    }) => lessonService.saveLessonNote(learnerProfileId, materialId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lesson-notes"] });
      toast.success("Note saved");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to save note");
    },
  });
}

export function useUpdateProgressMutation() {
  return useMutation({
    mutationFn: ({
      learnerProfileId,
      materialId,
      watchedSeconds,
      lastPosition,
    }: {
      learnerProfileId: string;
      materialId: string;
      watchedSeconds: number;
      lastPosition: number;
    }) =>
      lessonService.updateProgress(
        learnerProfileId,
        materialId,
        watchedSeconds,
        lastPosition,
      ),
    onError: () => {
      // Silent fail for progress updates
    },
  });
}
