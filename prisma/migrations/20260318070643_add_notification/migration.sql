-- CreateTable
CREATE TABLE "AdminPushSubscription" (
    "id" SERIAL NOT NULL,
    "adminId" INTEGER NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminPushSubscription_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AdminPushSubscription" ADD CONSTRAINT "AdminPushSubscription_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
