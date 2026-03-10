/*
  Warnings:

  - You are about to drop the column `role` on the `UserDevice` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user';

-- AlterTable
ALTER TABLE "UserDevice" DROP COLUMN "role";
