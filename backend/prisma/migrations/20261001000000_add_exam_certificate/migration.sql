-- AlterEnum
ALTER TYPE "CertificateType" ADD VALUE 'EXAM';

-- AlterTable
ALTER TABLE "Certificate" ADD COLUMN "details" JSONB;
ALTER TABLE "Certificate" ADD COLUMN "examId" TEXT;