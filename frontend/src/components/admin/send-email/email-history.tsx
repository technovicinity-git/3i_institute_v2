"use client";

import { useState } from "react";
import { History, Loader2, Paperclip } from "lucide-react";
import { useAdminEmails } from "@/hooks/use-admin-emails";
import type {
  AdminEmail,
  AdminEmailStatus,
} from "@/services/admin-email.service";
import { Pagination } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/date-format";

const AUDIENCE_LABEL: Record<AdminEmail["audience"], string> = {
  INSTRUCTORS: "All instructors",
  LEARNERS: "All learners",
  ALL: "Instructors & learners",
  USERS: "Selected people",
};

const STATUS_STYLE: Record<AdminEmailStatus, { label: string; className: string }> = {
  SENDING: { label: "Sending", className: "bg-[#2563EB]/10 text-[#2563EB]" },
  SENT: { label: "Sent", className: "bg-[#22A146]/10 text-[#22A146]" },
  PARTIAL: { label: "Partly sent", className: "bg-[#EA580C]/10 text-[#EA580C]" },
  FAILED: { label: "Failed", className: "bg-red-50 text-red-600" },
};

function audienceText(email: AdminEmail) {
  if (email.audience !== "USERS" || !email.recipients?.length) {
    return AUDIENCE_LABEL[email.audience];
  }
  const [first, ...rest] = email.recipients;
  return rest.length === 0 ? first.name : `${first.name} +${rest.length} more`;
}

// First line of the Markdown body without formatting, for the list.
function bodyPreview(markdown: string) {
  return markdown
    .replace(/[#*_>`\\]/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export function EmailHistory() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useAdminEmails(page);

  return (
    <section className="mt-10">
      <h2
        className="mb-4 flex items-center gap-2 text-xl text-[#0C1F33]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        <History className="h-5 w-5 text-[#B8912F]" />
        Sent emails
      </h2>

      {isLoading && (
        <div className="flex justify-center py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0D2B45] border-t-transparent" />
        </div>
      )}

      {isError && (
        <p className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          Couldn&apos;t load sent emails.
        </p>
      )}

      {data && data.emails.length === 0 && (
        <div className="rounded-xl border border-dashed border-[#E3E8EF] bg-white p-10 text-center text-sm text-[#64748B]">
          No emails sent yet.
        </div>
      )}

      {data && data.emails.length > 0 && (
        <div className="divide-y divide-[#E3E8EF] overflow-hidden rounded-xl border border-[#E3E8EF] bg-white">
          {data.emails.map((email) => {
            const status = STATUS_STYLE[email.status] ?? STATUS_STYLE.SENT;
            const done = email.sentCount + email.failedCount;
            return (
              <article key={email.id} className="px-5 py-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold break-words text-[#0C1F33]">
                      {email.subject}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm break-words text-[#64748B]">
                      {bodyPreview(email.body)}
                    </p>
                  </div>
                  <time className="shrink-0 text-xs text-[#94A3B8]">
                    {formatDate(email.createdAt, "dateTime")}
                  </time>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold",
                      status.className,
                    )}
                  >
                    {email.status === "SENDING" && (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    )}
                    {status.label}
                  </span>
                  <span
                    className="rounded-full bg-[#B8912F]/10 px-2 py-0.5 font-semibold text-[#B8912F]"
                    title={email.recipients?.map((r) => r.email).join(", ")}
                  >
                    {audienceText(email)}
                  </span>
                  <span className="text-[#64748B]">
                    {email.status === "SENDING"
                      ? `${done} of ${email.recipientCount} processed`
                      : `${email.sentCount} of ${email.recipientCount} delivered`}
                    {email.failedCount > 0 && (
                      <span className="text-red-600">
                        {" "}
                        · {email.failedCount} failed
                      </span>
                    )}
                  </span>
                  {email.attachments.length > 0 && (
                    <span
                      className="inline-flex items-center gap-1 rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[#334155]"
                      title={email.attachments.map((a) => a.name).join(", ")}
                    >
                      <Paperclip className="h-3 w-3" />
                      {email.attachments.length} file
                      {email.attachments.length === 1 ? "" : "s"}
                    </span>
                  )}
                  <span className="text-[#94A3B8]">
                    · by {email.sender.firstName} {email.sender.lastName}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Pagination
        page={page}
        pageSize={data?.limit ?? 10}
        total={data?.total ?? 0}
        onPageChange={setPage}
        itemLabel="emails"
        className="mt-4"
      />
    </section>
  );
}
