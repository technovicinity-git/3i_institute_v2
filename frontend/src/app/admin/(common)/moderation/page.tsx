"use client";

import { useState } from "react";
import { MessageSquare, Flag, Trash2, Ban, CheckCircle } from "lucide-react";
import {
  useModerationQueue,
  useModerateMessageMutation,
} from "@/hooks/use-admin";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function AdminModerationPage() {
  const { data: reports, isLoading, isError } = useModerationQueue();
  const moderateMutation = useModerateMessageMutation();

  const [confirmAction, setConfirmAction] = useState<{
    id: string;
    action: string;
  } | null>(null);

  const handleModerate = (messageId: string, action: string) => {
    if (confirmAction?.id === messageId && confirmAction.action === action) {
      moderateMutation.mutate(
        { messageId, action },
        { onSuccess: () => setConfirmAction(null) },
      );
    } else {
      setConfirmAction({ id: messageId, action });
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-[800px] mx-auto">
      <div className="mb-6">
        <h1
          className="text-3xl md:text-[36px] text-[#0C1F33]"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          Moderation Queue
        </h1>
        <p className="text-base text-[#64748B]">
          {reports?.length ?? 0} pending reports
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-[#0D2B45] border-t-transparent animate-spin" />
        </div>
      )}

      {!isLoading && !isError && reports?.length === 0 && (
        <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-[#64748B]">No reports pending review.</p>
        </div>
      )}

      {!isLoading && !isError && reports && reports.length > 0 && (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-xl border border-[#E3E8EF] p-5"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                    <Flag className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0C1F33]">
                      Message Reported
                    </p>
                    <p className="text-xs text-[#64748B] mt-1">
                      Report ID: {report.id.slice(0, 8)}
                    </p>
                    <p className="text-sm text-[#0C1F33] mt-2">
                      {report.reason}
                    </p>
                    <p className="text-xs text-[#94A3B8] mt-2">
                      {formatDate(report.reportedAt)} at{" "}
                      {formatTime(report.reportedAt)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleModerate(report.messageId, "DELETE")}
                    disabled={moderateMutation.isPending}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold ${
                      confirmAction?.id === report.messageId &&
                      confirmAction?.action === "DELETE"
                        ? "bg-red-600 text-white"
                        : "border border-red-300 text-red-600 hover:bg-red-50"
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {confirmAction?.id === report.messageId &&
                    confirmAction?.action === "DELETE"
                      ? "Confirm?"
                      : "Delete"}
                  </button>

                  <button
                    onClick={() => handleModerate(report.messageId, "MUTE")}
                    disabled={moderateMutation.isPending}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold ${
                      confirmAction?.id === report.messageId &&
                      confirmAction?.action === "MUTE"
                        ? "bg-orange-500 text-white"
                        : "border border-orange-300 text-orange-600 hover:bg-orange-50"
                    }`}
                  >
                    <Ban className="w-3.5 h-3.5" />
                    {confirmAction?.id === report.messageId &&
                    confirmAction?.action === "MUTE"
                      ? "Confirm?"
                      : "Mute User"}
                  </button>

                  <button
                    onClick={() => handleModerate(report.messageId, "REMOVE")}
                    disabled={moderateMutation.isPending}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold ${
                      confirmAction?.id === report.messageId &&
                      confirmAction?.action === "REMOVE"
                        ? "bg-[#22A146] text-white"
                        : "border border-[#22A146] text-[#22A146] hover:bg-green-50"
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {confirmAction?.id === report.messageId &&
                    confirmAction?.action === "REMOVE"
                      ? "Confirm?"
                      : "Dismiss"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
