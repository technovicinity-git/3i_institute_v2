-- CreateEnum
CREATE TYPE "SeatStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'EXPIRED');

-- AlterTable
ALTER TABLE "LearnerProfile" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Seat" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "learnerProfileId" TEXT NOT NULL,
    "status" "SeatStatus" NOT NULL DEFAULT 'ACTIVE',
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "Seat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafetyMessage" (
    "id" TEXT NOT NULL,
    "messageKey" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "isHumanTranslated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SafetyMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Seat_subscriptionId_idx" ON "Seat"("subscriptionId");

-- CreateIndex
CREATE INDEX "Seat_learnerProfileId_idx" ON "Seat"("learnerProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "Seat_subscriptionId_learnerProfileId_key" ON "Seat"("subscriptionId", "learnerProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "SafetyMessage_messageKey_key" ON "SafetyMessage"("messageKey");

-- AddForeignKey
ALTER TABLE "Seat" ADD CONSTRAINT "Seat_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seat" ADD CONSTRAINT "Seat_learnerProfileId_fkey" FOREIGN KEY ("learnerProfileId") REFERENCES "LearnerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
