import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  adminEmailService,
  type AdminEmailAudience,
  type SendAdminEmailInput,
} from "@/services/admin-email.service";

export function useAdminEmails(page: number) {
  return useQuery({
    queryKey: ["admin-emails", page],
    queryFn: () => adminEmailService.list(page),
    // Emails send in the background; poll while any is still going out.
    refetchInterval: (query) =>
      query.state.data?.emails.some((email) => email.status === "SENDING")
        ? 3000
        : false,
  });
}

export function useAdminEmailPreview(
  audience: AdminEmailAudience,
  userIds: string[],
) {
  return useQuery({
    queryKey: ["admin-email-preview", audience, userIds],
    queryFn: () => adminEmailService.preview(audience, userIds),
    enabled: audience !== "USERS" || userIds.length > 0,
  });
}

export function useSendAdminEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SendAdminEmailInput) => adminEmailService.send(input),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["admin-emails"] });
      toast.success("Email is being sent", {
        description: `Going out to ${result.recipientCount} recipient${result.recipientCount === 1 ? "" : "s"}. Progress shows under Sent emails.`,
      });
    },
    onError: (error) => {
      const message = (
        error as { response?: { data?: { error?: { message?: string } } } }
      )?.response?.data?.error?.message;
      toast.error(message ?? "Failed to send email");
    },
  });
}
