-- Add account security fields (OWASP A02)
ALTER TABLE "users" ADD COLUMN "failedAttempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN "lockedUntil" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "isBanned" BOOLEAN NOT NULL DEFAULT false;

-- Add performance indexes
CREATE INDEX "users_role_idx" ON "users"("role");
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");
CREATE INDEX "users_isEmailVerified_idx" ON "users"("isEmailVerified");
CREATE INDEX "users_emailVerificationToken_idx" ON "users"("emailVerificationToken");
CREATE INDEX "users_passwordResetToken_idx" ON "users"("passwordResetToken");
CREATE INDEX "users_refreshToken_idx" ON "users"("refreshToken");
