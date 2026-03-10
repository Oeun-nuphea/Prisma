import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const databaseUrl = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "admin@example.com";
  const password = "admin1234";
  const name = "Super Admin";

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
    return;
  }

  const hashed = await bcrypt.hash(password, 10);

  const admin = await prisma.admin.create({
    data: {
      name,
      email,
      password: hashed,
      private: process.env.ADMIN_SECRET ?? "supersecretadminkey123",
    },
  });

  console.log(`✅ Admin seeded:`);
  console.log(`   Email   : ${admin.email}`);
  console.log(`   Password: ${password}`);
  console.log(`   Role    : ${admin.role}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
