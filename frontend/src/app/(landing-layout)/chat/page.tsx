"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, ArrowRight, Flag, User } from "lucide-react";

interface Message {
  id: string;
  sender: string;
  initials: string;
  time: string;
  text: string;
  isSelf?: boolean;
  isInstructor?: boolean;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function ChatContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const courseTitle = searchParams.get("courseTitle") ?? "Course";
  const batchName = searchParams.get("batchName") ?? "Batch";

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  // Load initial messages (mock for now — integrate WebSocket later)
  useEffect(() => {
    setMessages([
      {
        id: "1",
        sender: "Ustadh Ibrahim",
        initials: "U",
        time: formatTime(new Date()),
        text: `Welcome to ${courseTitle}! This is the class chat for ${batchName}.`,
        isInstructor: true,
      },
    ]);
  }, [courseTitle, batchName]);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      sender: "You",
      initials: "Y",
      time: formatTime(new Date()),
      text: newMessage.trim(),
      isSelf: true,
    };

    setMessages([...messages, newMsg]);
    setNewMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 bg-[#F9F6F0] min-h-screen">
      <div className="w-full max-w-[900px] mx-auto bg-white border-x border-[#E3E8EF] min-h-[calc(100vh-73px)] flex flex-col">
        {/* Page Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[#E3E8EF]">
          <h1
            className="text-[24px] sm:text-[32px] leading-[32px] sm:leading-[40px] text-[#0C1F33]"
            style={{ fontFamily: "'Marcellus', serif" }}
          >
            {courseTitle} — {batchName}
          </h1>
          <p className="mt-1 text-[13px] text-[#475569]">Class chat</p>
        </div>

        {/* Next Session Bar */}
        <div className="flex items-center gap-3 px-4 py-4 bg-[#F9F6F0] border-b border-[#E3E8EF]">
          <Calendar
            className="w-[18px] h-[18px] text-[#157A34] shrink-0"
            strokeWidth={2}
          />
          <p className="text-[15px] text-[#0C1F33]">
            Next session:{" "}
            <span className="font-bold text-[#157A34]">
              Check your dashboard for schedule
            </span>
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id}>
              {msg.isSelf ? (
                <div className="flex items-end gap-3 justify-end">
                  <div className="flex-1 max-w-[564px]">
                    <div className="flex items-center gap-2 mb-1 justify-end">
                      <span className="text-[13px] text-[#475569]">
                        {msg.time}
                      </span>
                      <span className="text-[15px] font-bold text-[#0C1F33]">
                        You
                      </span>
                    </div>
                    <div className="bg-[#22A146] rounded-lg px-3 py-3">
                      <p className="text-base text-[#0C1F33] leading-6">
                        {msg.text}
                      </p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#22A146] flex items-center justify-center shrink-0">
                    <span className="text-[13px] font-bold text-[#0C1F33]">
                      {msg.initials}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-end gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#E3E8EF] flex items-center justify-center shrink-0">
                    <span className="text-[13px] font-bold text-[#0C1F33]">
                      {msg.initials}
                    </span>
                  </div>
                  <div className="flex-1 max-w-[564px]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[15px] font-bold text-[#0C1F33]">
                        {msg.sender}
                      </span>
                      <span className="text-[13px] text-[#475569]">
                        {msg.time}
                      </span>
                    </div>
                    <div className="group relative bg-white border border-[#E3E8EF] rounded-lg px-3 py-3">
                      <p className="text-base text-[#475569] leading-6">
                        {msg.text}
                      </p>
                      <button className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center justify-center w-[22px] h-[22px] bg-[#FBF9F4] rounded hover:bg-[#F0EDE6]">
                        <Flag className="w-[14px] h-[14px] text-[#475569]" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Composer */}
        <div className="flex items-center gap-3 px-5 py-5 border-t border-[#E3E8EF] bg-white">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 h-[42px] px-4 bg-[#FBF9F4] border border-[#E3E8EF] rounded-lg text-[15px] text-[#0C1F33] placeholder-[#475569] focus:outline-none focus:ring-2 focus:ring-[#22A146]/30 focus:border-[#22A146]"
          />
          <button
            onClick={handleSend}
            className="flex items-center gap-2 h-[42px] px-6 bg-[#22A146] hover:bg-[#1B8A3A] rounded-lg transition-colors cursor-pointer"
          >
            <span className="text-[15px] font-semibold text-[#0C1F33]">
              Send
            </span>
            <ArrowRight className="w-4 h-4 text-[#0C1F33]" strokeWidth={2} />
          </button>
        </div>
      </div>
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
