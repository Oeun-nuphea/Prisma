/*
  Warnings:

  - A unique constraint covering the columns `[endpoint]` on the table `AdminPushSubscription` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "AdminPushSubscription" ALTER COLUMN "isDeleted" SET DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "AdminPushSubscription_endpoint_key" ON "AdminPushSubscription"("endpoint");
