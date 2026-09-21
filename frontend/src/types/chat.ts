export interface ChatMessage {
  id: string;
  courseId: string;
  batchId: string | null;
  senderId: string;
  senderType: "ACCOUNT" | "GUARDIAN";
  displayName: string;
  learnerProfileId?: string | null; // NEW
  message: string;
  avatarUrl?: string | null;
  isInstructor?: boolean;
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
