import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

async function main() {
  const adapter = new PrismaPg({
    connectionString: process.env["DATABASE_URL"],
  });
  const prisma = new PrismaClient({ adapter });

  const hashedPassword = await bcrypt.hash("admin123", 10);

  const existing = await prisma.user.findFirst({
    where: {
      username: "admin",
      deletedAt: null,
    },
  });

  if (existing) {
    console.log("ℹ️  Akun admin sudah ada, seed dilewati.");
    console.log(`   Username : ${existing.username}`);
    console.log(`   Role     : ${existing.role}`);
  } else {
    const admin = await prisma.user.create({
      data: {
        nama: "Administrator",
        username: "admin",
        password: hashedPassword,
        role: "ADMIN",
        aktif: true,
      },
    });
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Gagal seed:", e);
  process.exit(1);
});
