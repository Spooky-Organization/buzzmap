-- CreateEnum
CREATE TYPE "POVVisibility" AS ENUM ('PUBLIC', 'FOLLOWERS');

-- CreateEnum
CREATE TYPE "AnalyticsEventType" AS ENUM ('BUSINESS_VIEWED', 'PRODUCT_VIEWED', 'POV_VIEWED', 'ADD_TO_CART', 'CHECKOUT_STARTED', 'ORDER_PLACED', 'MESSAGE_STARTED');

-- DropForeignKey
ALTER TABLE "POV" DROP CONSTRAINT "POV_businessId_fkey";

-- AlterTable
ALTER TABLE "POV" ADD COLUMN     "visibility" "POVVisibility" NOT NULL DEFAULT 'PUBLIC',
ALTER COLUMN "businessId" DROP NOT NULL,
ALTER COLUMN "starRating" DROP NOT NULL,
ALTER COLUMN "recommends" DROP NOT NULL;

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventType" "AnalyticsEventType" NOT NULL,
    "businessId" TEXT,
    "productId" TEXT,
    "povId" TEXT,
    "orderId" TEXT,
    "conversationId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AnalyticsEvent_userId_createdAt_idx" ON "AnalyticsEvent"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_eventType_createdAt_idx" ON "AnalyticsEvent"("eventType", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_businessId_createdAt_idx" ON "AnalyticsEvent"("businessId", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_productId_createdAt_idx" ON "AnalyticsEvent"("productId", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_povId_createdAt_idx" ON "AnalyticsEvent"("povId", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_orderId_createdAt_idx" ON "AnalyticsEvent"("orderId", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_conversationId_createdAt_idx" ON "AnalyticsEvent"("conversationId", "createdAt");

-- AddForeignKey
ALTER TABLE "POV" ADD CONSTRAINT "POV_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "BusinessProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
