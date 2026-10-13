-- Existing verification tokens were stored raw and shared with password
-- reset, and no email carrying them was ever sent. Clear them: tokens are now
-- stored hashed, and users can request a new verification email.
UPDATE "User" SET "emailVerifyToken" = NULL, "emailVerifyExpires" = NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "passwordResetToken" TEXT,
ADD COLUMN     "passwordResetExpires" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "User_emailVerifyToken_key" ON "User"("emailVerifyToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_passwordResetToken_key" ON "User"("passwordResetToken");
