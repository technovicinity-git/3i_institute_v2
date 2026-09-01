export interface ChatMessage {
  id: string;
  courseId: string;
  batchId: string | null;
  senderId: string;
  senderType: "ACCOUNT" | "GUARDIAN";
  displayName: string;
  message: string;
  createdAt: string;
}

export interface ChatRoomInfo {
  courseId: string;
  courseTitle: string;
  batchId: string | null;
  batchName: string;
  guardianOnly: boolean;
  isClosed: boolean;
}
