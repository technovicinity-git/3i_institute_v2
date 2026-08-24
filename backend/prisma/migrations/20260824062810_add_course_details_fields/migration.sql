-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "faq" JSONB,
ADD COLUMN     "learningOutcomes" JSONB,
ADD COLUMN     "requirements" JSONB,
ADD COLUMN     "totalDurationMinutes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalLessons" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalModules" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "whatIncluded" JSONB;
