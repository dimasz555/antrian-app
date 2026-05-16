"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { hashPassword } from "@/lib/bcrypt";

type UserInput = {
  nama: string;
  username: string;
  password?: string;
  role: "ADMIN" | "PETUGAS_POLI";
  poliId?: number | null;
  aktif?: boolean;
};

// CREATE
export async function createUser(data: UserInput) {
  try {
    if (!data.password) {
      return { success: false, message: "Password wajib diisi" };
    }

    // Cek username duplikat
    const isAvailable = await prisma.user.findFirst({
      where: {
        username: data.username,
        deletedAt: null,
      },
    });

    if (isAvailable) {
      return {
        success: false,
        message: `Username "${data.username}" sudah digunakan`,
        field: "username",
      };
    }

    // Validasi poliId wajib jika PETUGAS_POLI
    if (data.role === "PETUGAS_POLI" && !data.poliId) {
      return {
        success: false,
        message: "Poli wajib dipilih untuk petugas poli",
        field: "poliId",
      };
    }

    const hashed = await hashPassword(data.password);

    await prisma.user.create({
      data: {
        nama: data.nama,
        username: data.username,
        password: hashed,
        role: data.role,
        poliId: data.role === "PETUGAS_POLI" ? data.poliId : null,
        aktif: data.aktif ?? true,
      },
    });

    revalidatePath("/admin/petugas");
    return { success: true, message: "Petugas berhasil ditambahkan" };
  } catch {
    return { success: false, message: "Gagal menambahkan petugas" };
  }
}

// UPDATE
export async function updateUser(id: string, data: UserInput) {
  try {
    // Cek username duplikat (kecuali user itu sendiri)
    const isAvailable = await prisma.user.findFirst({
      where: {
        username: data.username,
        deletedAt: null,
        NOT: { id },
      },
    });

    if (isAvailable) {
      return {
        success: false,
        message: `Username "${data.username}" sudah digunakan`,
        field: "username",
      };
    }

    if (data.role === "PETUGAS_POLI" && !data.poliId) {
      return {
        success: false,
        message: "Poli wajib dipilih untuk petugas poli",
        field: "poliId",
      };
    }

    // Hash password baru jika diisi
    const passwordData = data.password
      ? { password: await hashPassword(data.password) }
      : {};

    await prisma.user.update({
      where: { id },
      data: {
        nama: data.nama,
        username: data.username,
        role: data.role,
        poliId: data.role === "PETUGAS_POLI" ? data.poliId : null,
        aktif: data.aktif ?? true,
        ...passwordData,
      },
    });

    revalidatePath("/admin/petugas");
    return { success: true, message: "Petugas berhasil diupdate" };
  } catch {
    return { success: false, message: "Gagal mengupdate petugas" };
  }
}

// DELETE
export async function deleteUser(id: string) {
  try {
    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    revalidatePath("/admin/petugas");
    return { success: true, message: "Petugas berhasil dihapus" };
  } catch {
    return { success: false, message: "Gagal menghapus petugas" };
  }
}

// TOGGLE AKTIF
export async function toggleAktifUser(id: string, aktif: boolean) {
  try {
    await prisma.user.update({ where: { id }, data: { aktif } });
    revalidatePath("/admin/petugas");
    return {
      success: true,
      message: `Petugas berhasil ${aktif ? "diaktifkan" : "dinonaktifkan"}`,
    };
  } catch {
    return { success: false, message: "Gagal mengubah status petugas" };
  }
}
