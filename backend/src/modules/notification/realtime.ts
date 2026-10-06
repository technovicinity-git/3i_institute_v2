import type { Server as SocketIOServer } from "socket.io";

// Socket.IO server reference, registered by the socket bootstrap. Kept here
// (instead of importing chat/socket) to avoid a circular import between the
// chat socket and the notification service.
let io: SocketIOServer | null = null;

export function registerNotificationSocket(server: SocketIOServer): void {
  io = server;
}

export const userRoom = (userId: string) => `user:${userId}`;

export function emitToUser(
  userId: string,
  event: string,
  payload: unknown,
): void {
  io?.to(userRoom(userId)).emit(event, payload);
}
