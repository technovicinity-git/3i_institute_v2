/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { chatService } from "@/services/chat.service";
import { getSocket } from "@/lib/socket";
import { useAuthStore } from "@/stores/auth-store";
import type { ChatMessage } from "@/types/chat";

export function useChat(courseId: string, batchId: string | null) {
  const { accessToken } = useAuthStore();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<any>(null);

  // Load initial messages via REST
  useEffect(() => {
    if (!courseId) return;

    const loadMessages = async () => {
      try {
        setIsLoading(true);
        const history = await chatService.getCourseMessages(
          courseId,
          batchId ?? undefined,
        );
        setMessages(history);
        console.log("📝 Loaded", history.length, "messages");
      } catch (error: any) {
        console.error("Failed to load messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [courseId, batchId]);

  // Connect socket
  useEffect(() => {
    if (!courseId || !accessToken) {
      console.log("⚠️ Missing courseId or accessToken for socket");
      return;
    }

    console.log(
      "🔌 Connecting socket for course:",
      courseId,
      "batch:",
      batchId,
    );

    const socket = getSocket(accessToken);
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      setIsConnected(true);
      socket.emit("join-course", { courseId, batchId });
    });

    socket.on("disconnect", (reason: string) => {
      console.log("❌ Socket disconnected:", reason);
      setIsConnected(false);
    });

    socket.on("connect_error", (error: any) => {
      console.error("❌ Socket connection error:", error.message);
      setIsConnected(false);
    });

    socket.on("message-history", (history: ChatMessage[]) => {
      console.log("📝 Socket history:", history.length);
      setMessages(history);
    });

    socket.on("new-message", (message: ChatMessage) => {
      console.log("📨 New message:", message);
      setMessages((prev) => [...prev, message]);
    });

    socket.on("error", (error: { message: string }) => {
      console.error("Socket error:", error);
      toast.error(error.message);
    });

    // If already connected, join room immediately
    if (socket.connected) {
      console.log("Socket already connected, joining room");
      setIsConnected(true);
      socket.emit("join-course", { courseId, batchId });
    }

    return () => {
      if (socket.connected) {
        socket.emit("leave-course");
      }
    };
  }, [courseId, batchId, accessToken]);

  const sendMessage = useCallback(
    (text: string) => {
      const socket = socketRef.current;
      if (!socket || !socket.connected) {
        toast.error("Chat is disconnected. Please refresh.");
        return;
      }

      socket.emit("send-message", {
        courseId,
        batchId,
        message: text.trim(),
      });
    },
    [courseId, batchId],
  );

  const reportMessage = useCallback(
    async (messageId: string, reason: string) => {
      try {
        await chatService.reportMessage(messageId, reason);
        toast.success("Message reported");
      } catch (error: any) {
        const message = error.response?.data?.error?.message;
        toast.error(message ?? "Failed to report message");
      }
    },
    [],
  );

  return {
    messages,
    isLoading,
    isConnected,
    sendMessage,
    reportMessage,
  };
}
