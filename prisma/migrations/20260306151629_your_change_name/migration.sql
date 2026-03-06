-- CreateTable
CREATE TABLE "UserDevice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "broswer" TEXT NOT NULL,
    "os" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "UserDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
