"use client";

import { useState, Suspense, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Calendar,
  ArrowRight,
  Flag,
  Send,
  Wifi,
  WifiOff,
  Loader2,
} from "lucide-react";
import { useChat } from "@/hooks/use-chat";
import { useProfileStore } from "@/stores/profile-store";
import type { ChatMessage } from "@/types/chat";

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function ChatContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const courseId = searchParams.get("courseId") ?? "";
  const courseTitle = searchParams.get("courseTitle") ?? "Course";
  const batchId = searchParams.get("batchId") ?? null;
  const batchName = searchParams.get("batchName") ?? "Batch";

  const { activeProfile } = useProfileStore();
  const { messages, isLoading, isConnected, sendMessage, reportMessage } =
    useChat(courseId, batchId);

  const [newMessage, setNewMessage] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportMessageId, setReportMessageId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    sendMessage(newMessage);
    setNewMessage("");
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReport = (messageId: string) => {
    setReportMessageId(messageId);
    setReportReason("");
    setShowReportModal(true);
  };

  const submitReport = () => {
    if (!reportMessageId || !reportReason.trim()) return;
    reportMessage(reportMessageId, reportReason);
    setShowReportModal(false);
    setReportMessageId(null);
    setReportReason("");
  };

  const displayName = activeProfile?.displayName ?? "You";

  return (
    <div className="w-full max-w-[900px] mx-auto bg-white border-x border-[#E3E8EF] min-h-screen flex flex-col">
      {/* Page Header */}
      <div className="px-6 pt-6 pb-4 border-b border-[#E3E8EF]">
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-[24px] sm:text-[32px] leading-[32px] sm:leading-[40px] text-[#0C1F33]"
              style={{ fontFamily: "'Marcellus', serif" }}
            >
              {courseTitle} — {batchName}
            </h1>
            <p className="mt-1 text-[13px] text-[#475569]">Class chat</p>
          </div>
          {/* Connection status */}
          <span
            className={`flex items-center gap-1.5 text-xs font-semibold ${
              isConnected ? "text-[#22A146]" : "text-gray-400"
            }`}
          >
            {isConnected ? (
              <Wifi className="w-4 h-4" />
            ) : (
              <WifiOff className="w-4 h-4" />
            )}
            {isConnected ? "Live" : "Offline"}
          </span>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#22A146] animate-spin" />
        </div>
      )}

      {/* Messages */}
      {!isLoading && (
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-10">
              <p className="text-[#64748B] text-sm">
                No messages yet. Say hello to your classmates!
              </p>
            </div>
          )}

          {messages.map((msg, index) => {
            const isSelf =
              msg.senderId === activeProfile?.accountId ||
              msg.displayName === displayName;

            // Show date separator
            const showDate =
              index === 0 ||
              new Date(msg.createdAt).toDateString() !==
                new Date(messages[index - 1]!.createdAt).toDateString();

            return (
              <div key={msg.id}>
                {showDate && (
                  <div className="flex items-center justify-center my-4">
                    <span className="text-[11px] font-semibold text-[#64748B] bg-[#FBF9F4] px-3 py-1 rounded-full">
                      {formatDate(msg.createdAt)}
                    </span>
                  </div>
                )}

                {isSelf ? (
                  <div className="flex items-end gap-3 justify-end">
                    <div className="flex-1 max-w-[564px]">
                      <div className="flex items-center gap-2 mb-1 justify-end">
                        <span className="text-[13px] text-[#475569]">
                          {formatTime(msg.createdAt)}
                        </span>
                        <span className="text-[15px] font-bold text-[#0C1F33]">
                          You
                        </span>
                      </div>
                      <div className="bg-[#22A146] rounded-lg px-3 py-3">
                        <p className="text-base text-[#0C1F33] leading-6">
                          {msg.message}
                        </p>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#22A146] flex items-center justify-center shrink-0">
                      <span className="text-[13px] font-bold text-[#0C1F33]">
                        {getInitials(displayName)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-end gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#E3E8EF] flex items-center justify-center shrink-0">
                      <span className="text-[13px] font-bold text-[#0C1F33]">
                        {getInitials(msg.displayName)}
                      </span>
                    </div>
                    <div className="flex-1 max-w-[564px]">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[15px] font-bold text-[#0C1F33]">
                          {msg.displayName}
                        </span>
                        <span className="text-[13px] text-[#475569]">
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                      <div className="group relative bg-white border border-[#E3E8EF] rounded-lg px-3 py-3">
                        <p className="text-base text-[#475569] leading-6">
                          {msg.message}
                        </p>
                        {/* Report button */}
                        <button
                          onClick={() => handleReport(msg.id)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center justify-center w-[22px] h-[22px] bg-[#FBF9F4] rounded hover:bg-[#F0EDE6]"
                          title="Report message"
                        >
                          <Flag className="w-[14px] h-[14px] text-[#475569]" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Composer */}
      <div className="flex items-center gap-3 px-5 py-5 border-t border-[#E3E8EF] bg-white">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={!isConnected}
          className="flex-1 h-[42px] px-4 bg-[#FBF9F4] border border-[#E3E8EF] rounded-lg text-[15px] text-[#0C1F33] placeholder-[#475569] focus:outline-none focus:ring-2 focus:ring-[#22A146]/30 focus:border-[#22A146] disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={!newMessage.trim() || !isConnected}
          className="flex items-center gap-2 h-[42px] px-6 bg-[#22A146] hover:bg-[#1B8A3A] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
        >
          <span className="text-[15px] font-semibold text-[#0C1F33]">Send</span>
          <ArrowRight className="w-4 h-4 text-[#0C1F33]" strokeWidth={2} />
        </button>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowReportModal(false)}
          />
          <div className="relative bg-white rounded-xl p-6 w-full max-w-[400px] z-10">
            <h3 className="text-lg font-semibold text-[#0C1F33] mb-2">
              Report Message
            </h3>
            <p className="text-sm text-[#64748B] mb-4">
              Why are you reporting this message?
            </p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              rows={3}
              placeholder="Explain why this message should be reviewed..."
              className="w-full px-3 py-2 border border-[#E3E8EF] rounded-lg text-sm mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 py-2.5 border border-[#E3E8EF] rounded-lg text-sm font-semibold text-[#0C1F33] hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitReport}
                disabled={!reportReason.trim()}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
