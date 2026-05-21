"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import {
  broadcastToAll,
  broadcastToPoliId,
} from "@/lib/sse-clients";

async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) throw new Error("Tidak terautentikasi");
  return verifyToken(token);
}

// PANGGIL ANTRIAN BERIKUTNYA
export async function panggilBerikutnya(poliId: number) {
  try {
    const user = await getCurrentUser();

    // Cek apakah ada antrian yang sedang dipanggil
    const sedangDipanggil = await prisma.antrian.findFirst({
      where: { poliId, status: "DIPANGGIL" },
    });

    if (sedangDipanggil) {
      return {
        success: false,
        message: "Selesaikan atau lewati antrian yang sedang dipanggil dulu",
      };
    }

    // Ambil antrian berikutnya
    const berikutnya = await prisma.antrian.findFirst({
      where: {
        poliId,
        status: "MENUNGGU",
        tanggal: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lte: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
      orderBy: { nomorUrut: "asc" },
    });

    if (!berikutnya) {
      return { success: false, message: "Tidak ada antrian yang menunggu" };
    }

    const updated = await prisma.antrian.update({
      where: { id: berikutnya.id },
      data: {
        status: "DIPANGGIL",
        dipanggilAt: new Date(),
        dipanggilOlehId: user.id,
      },
      include: { poli: { select: { nama: true } } },
    });

    broadcastToPoliId(String(poliId), {
      type: "antrian_dipanggil",
      kodeAntrian: updated.kodeAntrian,
      poliId,
    });
    broadcastToAll({
      type: "antrian_update",
      poliId,
    });

    revalidatePath("/petugas/antrian");
    return {
      success: true,
      message: "Antrian berhasil dipanggil",
      data: updated,
    };
  } catch {
    return { success: false, message: "Gagal memanggil antrian" };
  }
}

// PANGGIL ULANG
export async function panggilUlang(antrianId: number) {
  try {
    const updated = await prisma.antrian.update({
      where: { id: antrianId },
      data: { jumlahPanggil: { increment: 1 } },
      include: { poli: { select: { nama: true } } },
    });

    revalidatePath("/petugas/antrian");
    return {
      success: true,
      message: "Antrian dipanggil ulang",
      data: updated,
    };
  } catch {
    return { success: false, message: "Gagal memanggil ulang antrian" };
  }
}

// SELESAIKAN ANTRIAN
export async function selesaikanAntrian(antrianId: number) {
  try {
    const updated = await prisma.antrian.update({
      where: { id: antrianId },
      data: {
        status: "SELESAI",
        selesaiAt: new Date(),
      },
    });

    broadcastToPoliId(String(updated.poliId), { type: "antrian_selesai", poliId: updated.poliId });
    broadcastToAll({ type: "antrian_update", poliId: updated.poliId });

    revalidatePath("/petugas/antrian");
    return { success: true, message: "Antrian diselesaikan" };
  } catch {
    return { success: false, message: "Gagal menyelesaikan antrian" };
  }
}

// LEWATI ANTRIAN
export async function lewatiAntrian(antrianId: number) {
  try {
    const updated = await prisma.antrian.update({
      where: { id: antrianId },
      data: { status: "TERLEWAT" },
    });

    broadcastToPoliId(String(updated.poliId), { type: "antrian_terlewat", poliId: updated.poliId });
    broadcastToAll({ type: "antrian_update", poliId: updated.poliId });

    revalidatePath("/petugas/antrian");
    return { success: true, message: "Antrian dilewati" };
  } catch {
    return { success: false, message: "Gagal melewati antrian" };
  }
}

// RESET ANTRIAN MANUAL
export async function resetAntrianManual(poliId: number) {
  try {
    await prisma.antrian.updateMany({
      where: {
        poliId,
        status: { in: ["MENUNGGU", "DIPANGGIL"] },
        tanggal: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lte: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
      data: { status: "TERLEWAT" },
    });

    broadcastToPoliId(String(poliId), { type: "antrian_reset", poliId });
    broadcastToAll({ type: "antrian_update", poliId });

    revalidatePath("/petugas/antrian");
    return { success: true, message: "Antrian berhasil direset" };
  } catch {
    return { success: false, message: "Gagal mereset antrian" };
  }
}

// GET DATA ANTRIAN HARI INI
export async function getAntrianHariIni(poliId: number) {
  const today = new Date();
  const start = new Date(today.setHours(0, 0, 0, 0));
  const end = new Date(today.setHours(23, 59, 59, 999));

  return prisma.antrian.findMany({
    where: {
      poliId,
      tanggal: { gte: start, lte: end },
    },
    orderBy: { nomorUrut: "asc" },
  });
}
