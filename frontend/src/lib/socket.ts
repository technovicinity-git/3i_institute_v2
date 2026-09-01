"use client";

import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;
let currentToken: string | null = null;

export function getSocket(token: string): Socket {
  // If socket exists and token hasn't changed, return existing
  if (socket && currentToken === token) {
    return socket;
  }

  // If socket exists but token changed, disconnect old
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  const apiUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

  console.log("🔌 Connecting socket to:", apiUrl);

  socket = io(apiUrl, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  currentToken = token;

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentToken = null;
  }
}
