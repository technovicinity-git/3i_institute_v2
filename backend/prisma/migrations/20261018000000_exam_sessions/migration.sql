-- Exams in progress. The server records when each attempt starts and which
-- questions were served, so the time limit and question set can't be
-- changed by the learner's device.

-- CreateTable
CREATE TABLE "ExamSession" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "learnerProfileId" TEXT NOT NULL,
    "questionSet" JSONB NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deadline" TIMESTAMP(3) NOT NULL,
    "attemptId" TEXT,

    CONSTRAINT "ExamSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExamSession_attemptId_key" ON "ExamSession"("attemptId");

-- CreateIndex
CREATE INDEX "ExamSession_examId_learnerProfileId_idx" ON "ExamSession"("examId", "learnerProfileId");

-- AddForeignKey
ALTER TABLE "ExamSession" ADD CONSTRAINT "ExamSession_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamSession" ADD CONSTRAINT "ExamSession_learnerProfileId_fkey" FOREIGN KEY ("learnerProfileId") REFERENCES "LearnerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamSession" ADD CONSTRAINT "ExamSession_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "ExamAttempt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

