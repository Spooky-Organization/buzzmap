/*
  Warnings:

  - You are about to drop the column `thumbnailUrl` on the `POV` table. All the data in the column will be lost.
  - You are about to drop the column `videoUrl` on the `POV` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "POVMediaType" AS ENUM ('IMAGE', 'VIDEO');

-- AlterTable
ALTER TABLE "POV" DROP COLUMN "thumbnailUrl",
DROP COLUMN "videoUrl";

-- CreateTable
CREATE TABLE "POVMedia" (
    "id" TEXT NOT NULL,
    "povId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "POVMediaType" NOT NULL,
    "thumbnailUrl" TEXT,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "POVMedia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "POVMedia_povId_position_idx" ON "POVMedia"("povId", "position");

-- AddForeignKey
ALTER TABLE "POVMedia" ADD CONSTRAINT "POVMedia_povId_fkey" FOREIGN KEY ("povId") REFERENCES "POV"("id") ON DELETE CASCADE ON UPDATE CASCADE;
