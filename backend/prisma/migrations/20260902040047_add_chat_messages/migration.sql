-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "batchId" TEXT,
    "senderId" TEXT NOT NULL,
    "senderType" TEXT NOT NULL DEFAULT 'ACCOUNT',
    "displayName" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatMessage_courseId_idx" ON "ChatMessage"("courseId");

-- CreateIndex
CREATE INDEX "ChatMessage_batchId_idx" ON "ChatMessage"("batchId");

-- CreateIndex
CREATE INDEX "ChatMessage_courseId_batchId_idx" ON "ChatMessage"("courseId", "batchId");
