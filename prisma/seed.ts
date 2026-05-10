import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

async function main() {
  const adapter = new PrismaPg({
    connectionString: process.env["DATABASE_URL"],
  });
  const prisma = new PrismaClient({ adapter });

  // Hash password
  const hashedPassword = await bcrypt.hash("admin123", 10);

  // Buat atau update akun admin
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      nama: "Administrator",
      username: "admin",
      password: hashedPassword,
      role: "ADMIN",
      aktif: true,
    },
  });

  console.log("✅ Akun admin berhasil dibuat:");
  console.log(`   Nama     : ${admin.nama}`);
  console.log(`   Username : ${admin.username}`);
  console.log(`   Password : admin123`);
  console.log(`   Role     : ${admin.role}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Gagal seed:", e);
  process.exit(1);
});
