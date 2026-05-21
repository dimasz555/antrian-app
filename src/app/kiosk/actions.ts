"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { broadcastToAll } from "@/lib/sse-clients";

// VERIFY PIN
export async function verifyKioskPin(pin: string) {
  try {
    const config = await prisma.konfigurasi.findUnique({
      where: { key: "KIOSK_PIN" },
    });

    if (!config) {
      return { success: false, message: "PIN belum dikonfigurasi" };
    }

    if (pin !== config.value) {
      return { success: false, message: "PIN salah" };
    }

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set("kiosk_session", "authenticated", {
      httpOnly: true,
      sameSite: "lax",
      path: "/kiosk",
    });

    return { success: true, message: "PIN benar" };
  } catch {
    return { success: false, message: "Terjadi kesalahan" };
  }
}

// GENERATE ANTRIAN
export async function generateAntrian(poliId: number) {
  try {
    const today = new Date();
    const start = new Date(new Date().setHours(0, 0, 0, 0));
    const end = new Date(new Date().setHours(23, 59, 59, 999));

    // Ambil poli
    const poli = await prisma.poli.findUnique({
      where: { id: poliId, aktif: true, deletedAt: null },
    });

    if (!poli) {
      return { success: false, message: "Poli tidak ditemukan" };
    }

    // Hitung nomor urut hari ini
    const totalHariIni = await prisma.antrian.count({
      where: {
        poliId,
        tanggal: { gte: start, lte: end },
      },
    });

    const nomorUrut = totalHariIni + 1;
    const kodeAntrian = `${poli.kode}-${String(nomorUrut).padStart(3, "0")}`;

    const antrian = await prisma.antrian.create({
      data: {
        kodeAntrian,
        nomorUrut,
        poliId,
        status: "MENUNGGU",
        tanggal: today,
      },
      include: {
        poli: { select: { nama: true, kode: true } },
      },
    });

    broadcastToAll({
      type: "antrian_baru",
      poliId,
      kodeAntrian: antrian.kodeAntrian,
    });

    return {
      success: true,
      message: "Antrian berhasil dibuat",
      data: {
        id: antrian.id,
        kodeAntrian: antrian.kodeAntrian,
        nomorUrut: antrian.nomorUrut,
        namaPoli: antrian.poli.nama,
        kodePoli: antrian.poli.kode,
        createdAt: antrian.createdAt,
      },
    };
  } catch {
    return { success: false, message: "Gagal membuat antrian" };
  }
}

// GET DATA UNTUK KIOSK
export async function getKioskData() {
  const [poliList, configList] = await Promise.all([
    prisma.poli.findMany({
      where: { aktif: true, deletedAt: null },
      orderBy: { urutan: "asc" },
      select: {
        id: true,
        kode: true,
        nama: true,
        _count: {
          select: {
            antrian: {
              where: {
                status: { in: ["MENUNGGU", "DIPANGGIL"] },
                tanggal: {
                  gte: new Date(new Date().setHours(0, 0, 0, 0)),
                  lte: new Date(new Date().setHours(23, 59, 59, 999)),
                },
              },
            },
          },
        },
      },
    }),
    prisma.konfigurasi.findMany({
      where: { key: { in: ["NAMA_RS", "JAM_BUKA", "JAM_TUTUP"] } },
    }),
  ]);

  const config = Object.fromEntries(configList.map((c) => [c.key, c.value]));
  return { poliList, config };
}
