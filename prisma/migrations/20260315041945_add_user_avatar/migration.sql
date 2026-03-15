-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "avatarFileId" TEXT,
ADD COLUMN     "avatarUrl" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarFileId" TEXT,
ADD COLUMN     "avatarUrl" TEXT;
