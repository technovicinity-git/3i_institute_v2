-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN     "learnerProfileId" TEXT;

-- CreateIndex
CREATE INDEX "ChatMessage_learnerProfileId_idx" ON "ChatMessage"("learnerProfileId");
