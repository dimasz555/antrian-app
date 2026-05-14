"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type PoliInput = {
  kode: string;
  nama: string;
  urutan: number;
  aktif?: boolean;
};

// CREATE
export async function createPoli(data: PoliInput) {
  try {
    const isAvailable = await prisma.poli.findUnique({
      where: { kode: data.kode.toUpperCase() },
    });

    if (isAvailable) {
      return { success: false, message: `Kode "${data.kode}" sudah digunakan` };
    }

    await prisma.poli.create({
      data: {
        kode: data.kode.toUpperCase(),
        nama: data.nama,
        urutan: data.urutan,
        aktif: data.aktif ?? true,
      },
    });

    revalidatePath("/admin/poli");
    return { success: true, message: "Poli berhasil ditambahkan" };
  } catch {
    return { success: false, message: "Gagal menambahkan poli" };
  }
}

// UPDATE
export async function updatePoli(id: number, data: PoliInput) {
  try {
    // Cek kode duplikat (kecuali poli itu sendiri)
    const isAvailable = await prisma.poli.findFirst({
      where: {
        kode: data.kode.toUpperCase(),
        NOT: { id },
      },
    });

    if (isAvailable) {
      return { success: false, message: `Kode "${data.kode}" sudah digunakan` };
    }

    await prisma.poli.update({
      where: { id },
      data: {
        kode: data.kode.toUpperCase(),
        nama: data.nama,
        urutan: data.urutan,
        aktif: data.aktif ?? true,
      },
    });

    revalidatePath("/admin/poli");
    return { success: true, message: "Poli berhasil diperbaharui" };
  } catch {
    return { success: false, message: "Gagal memperbaharui poli" };
  }
}

// DELETE
export async function deletePoli(id: number) {
  try {
    // Cek antrian aktif
    const antrianAktif = await prisma.antrian.findFirst({
      where: {
        poliId: id,
        status: { in: ["MENUNGGU", "DIPANGGIL"] },
      },
    });

    if (antrianAktif) {
      return {
        success: false,
        message: "Tidak bisa menghapus poli yang masih ada antrian aktif",
      };
    }

    await prisma.poli.delete({ where: { id } });

    revalidatePath("/admin/poli");
    return { success: true, message: "Poli berhasil dihapus" };
  } catch {
    return { success: false, message: "Gagal menghapus poli" };
  }
}

// TOGGLE AKTIF
export async function toggleAktifPoli(id: number, aktif: boolean) {
  try {
    await prisma.poli.update({
      where: { id },
      data: { aktif },
    });

    revalidatePath("/admin/poli");
    return {
      success: true,
      message: `Poli berhasil ${aktif ? "diaktifkan" : "dinonaktifkan"}`,
    };
  } catch {
    return { success: false, message: "Gagal mengubah status poli" };
  }
}
