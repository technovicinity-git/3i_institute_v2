/*
  Warnings:

  - Made the column `courseId` on table `Question` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_courseId_fkey";

-- AlterTable
ALTER TABLE "Question" ALTER COLUMN "courseId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Question_courseId_idx" ON "Question"("courseId");

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
