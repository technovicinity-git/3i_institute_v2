-- AddForeignKey
ALTER TABLE "Waiver" ADD CONSTRAINT "Waiver_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
