"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type KonfigurasiInput = {
  key: string;
  value: string;
};

// GET SEMUA KONFIGURASI
export async function getKonfigurasi() {
  const data = await prisma.konfigurasi.findMany({
    orderBy: { key: "asc" },
  });
  return Object.fromEntries(data.map((k) => [k.key, k.value]));
}

// UPSERT KONFIGURASI
export async function upsertKonfigurasi(items: KonfigurasiInput[]) {
  try {
    await Promise.all(
      items.map((item) =>
        prisma.konfigurasi.upsert({
          where: { key: item.key },
          update: { value: item.value },
          create: { key: item.key, value: item.value },
        })
      )
    );

    revalidatePath("/admin/pengaturan");
    revalidatePath("/kiosk");
    revalidatePath("/display");
    return { success: true, message: "Pengaturan berhasil disimpan" };
  } catch {
    return { success: false, message: "Gagal menyimpan pengaturan" };
  }
}