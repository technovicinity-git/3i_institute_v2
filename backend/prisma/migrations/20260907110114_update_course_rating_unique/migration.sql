/*
  Warnings:

  - A unique constraint covering the columns `[courseId,learnerProfileId]` on the table `CourseRating` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "CourseRating_courseId_accountId_key";

-- CreateIndex
CREATE UNIQUE INDEX "CourseRating_courseId_learnerProfileId_key" ON "CourseRating"("courseId", "learnerProfileId");
