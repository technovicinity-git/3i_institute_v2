-- Waivers become single-use discounts for one learner profile, applied to a
-- manual subscription request. The Stripe-era subscription link is dropped.

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "WaiverStatus" ADD VALUE 'USED';
ALTER TYPE "WaiverStatus" ADD VALUE 'EXPIRED';

-- DropForeignKey
ALTER TABLE "Waiver" DROP CONSTRAINT "Waiver_subscriptionId_fkey";

-- DropIndex
DROP INDEX "Waiver_subscriptionId_key";

-- AlterTable
ALTER TABLE "SubscriptionRequest" ADD COLUMN     "discountPercent" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "listPrice" DECIMAL(10,2),
ADD COLUMN     "waiverId" TEXT,
ALTER COLUMN "transactionId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Waiver" DROP COLUMN "effectiveAt",
DROP COLUMN "subscriptionId",
ADD COLUMN     "learnerProfileId" TEXT,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "usedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Waiver_learnerProfileId_status_idx" ON "Waiver"("learnerProfileId", "status");

-- CreateIndex
CREATE INDEX "Waiver_status_createdAt_idx" ON "Waiver"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "SubscriptionRequest" ADD CONSTRAINT "SubscriptionRequest_waiverId_fkey" FOREIGN KEY ("waiverId") REFERENCES "Waiver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Waiver" ADD CONSTRAINT "Waiver_learnerProfileId_fkey" FOREIGN KEY ("learnerProfileId") REFERENCES "LearnerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

