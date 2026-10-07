-- CreateTable
CREATE TABLE "NotificationBroadcast" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "senderRole" TEXT NOT NULL,
    "audience" TEXT NOT NULL,
    "courseId" TEXT,
    "courseTitle" TEXT,
    "batchId" TEXT,
    "batchName" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "channels" "NotificationChannel"[],
    "recipientCount" INTEGER NOT NULL DEFAULT 0,
    "pushDeviceCount" INTEGER NOT NULL DEFAULT 0,
    "pushSentCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationBroadcast_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NotificationBroadcast_senderId_createdAt_idx" ON "NotificationBroadcast"("senderId", "createdAt");

-- CreateIndex
CREATE INDEX "NotificationBroadcast_createdAt_idx" ON "NotificationBroadcast"("createdAt");

-- AddForeignKey
ALTER TABLE "NotificationBroadcast" ADD CONSTRAINT "NotificationBroadcast_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
