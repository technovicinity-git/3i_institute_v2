-- Admins can archive questions instead of deleting ones that exams or
-- results still use.

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "archivedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Question_archivedAt_idx" ON "Question"("archivedAt");

