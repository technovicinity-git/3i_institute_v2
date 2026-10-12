/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  contentService,
  type FaqItemInput,
  type SiteSettings,
} from "@/services/content.service";

const errorMessage = (error: any, fallback: string) =>
  error?.response?.data?.error?.message ?? fallback;

// ─── Public ───

export function usePublishedPages() {
  return useQuery({
    queryKey: ["site-pages"],
    queryFn: contentService.publishedPages,
    staleTime: 10 * 60 * 1000,
  });
}

export function usePublicPage(slug: string) {
  return useQuery({
    queryKey: ["site-page", slug],
    queryFn: () => contentService.publicPage(slug),
    enabled: !!slug,
    retry: false,
  });
}

export function usePublicFaq() {
  return useQuery({
    queryKey: ["site-faq"],
    queryFn: contentService.publicFaq,
    staleTime: 10 * 60 * 1000,
  });
}

export function usePublicSettings() {
  return useQuery({
    queryKey: ["site-settings"],
    queryFn: contentService.publicSettings,
    staleTime: 10 * 60 * 1000,
  });
}

// ─── Admin ───

export function useAdminPages() {
  return useQuery({
    queryKey: ["admin-content-pages"],
    queryFn: contentService.listPages,
  });
}

export function useAdminPage(slug: string) {
  return useQuery({
    queryKey: ["admin-content-page", slug],
    queryFn: () => contentService.getPage(slug),
    enabled: !!slug,
    retry: false,
  });
}

export function useSavePageMutation(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { title: string; body: string; published: boolean }) =>
      contentService.savePage(slug, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-content-pages"] });
      queryClient.invalidateQueries({ queryKey: ["admin-content-page", slug] });
      queryClient.invalidateQueries({ queryKey: ["site-pages"] });
      queryClient.invalidateQueries({ queryKey: ["site-page", slug] });
      toast.success("Page saved");
    },
    onError: (error) => toast.error(errorMessage(error, "Failed to save page")),
  });
}

export function useDeletePageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: contentService.deletePage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-content-pages"] });
      queryClient.invalidateQueries({ queryKey: ["site-pages"] });
      toast.success("Page removed");
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Failed to remove page")),
  });
}

export function useAdminFaq() {
  return useQuery({
    queryKey: ["admin-content-faq"],
    queryFn: contentService.listFaq,
  });
}

function useInvalidateFaq() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["admin-content-faq"] });
    queryClient.invalidateQueries({ queryKey: ["site-faq"] });
  };
}

export function useCreateFaqMutation() {
  const invalidate = useInvalidateFaq();
  return useMutation({
    mutationFn: (input: FaqItemInput) => contentService.createFaq(input),
    onSuccess: () => {
      invalidate();
      toast.success("Question added");
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Failed to add question")),
  });
}

export function useUpdateFaqMutation() {
  const invalidate = useInvalidateFaq();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<FaqItemInput> }) =>
      contentService.updateFaq(id, input),
    onSuccess: () => {
      invalidate();
      toast.success("Question updated");
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Failed to update question")),
  });
}

export function useDeleteFaqMutation() {
  const invalidate = useInvalidateFaq();
  return useMutation({
    mutationFn: contentService.deleteFaq,
    onSuccess: () => {
      invalidate();
      toast.success("Question deleted");
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Failed to delete question")),
  });
}

export function useAdminSettings() {
  return useQuery({
    queryKey: ["admin-content-settings"],
    queryFn: contentService.getSettings,
  });
}

export function useSaveSettingsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: SiteSettings) =>
      contentService.saveSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-content-settings"] });
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      toast.success("Settings saved");
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Failed to save settings")),
  });
}
