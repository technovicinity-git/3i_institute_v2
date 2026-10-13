-- Negative marks can be fractions (e.g. 0.25), so question deductions and
-- attempt scores become floating point. Existing whole numbers convert
-- exactly.

-- AlterTable
ALTER TABLE "Question" ALTER COLUMN "negativeMarks" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "ExamAttempt" ALTER COLUMN "score" SET DATA TYPE DOUBLE PRECISION;
