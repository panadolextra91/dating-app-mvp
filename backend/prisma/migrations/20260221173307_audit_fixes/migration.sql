-- DropIndex
DROP INDEX "User_email_idx";

-- CreateIndex
CREATE INDEX "Like_toUserId_idx" ON "Like"("toUserId");
