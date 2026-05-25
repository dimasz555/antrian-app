import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Simpan instance Prisma di globalThis supaya tidak membuat
// koneksi database baru setiap kali Next.js hot reload (development)
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  return new PrismaClient({ adapter });
}

// Pakai instance yang sudah ada, atau buat baru jika belum ada
export const prisma = globalForPrisma.prisma || createPrismaClient();

// Di development, simpan ke globalThis supaya persist antar hot reload
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
