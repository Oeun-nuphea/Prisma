import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { pagination } from "prisma-extension-pagination";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });

export const prisma = new PrismaClient({ adapter }).$extends(
  pagination({
    pages: {
      limit: 10,
      includePageCount: true,
    },
  }),
);