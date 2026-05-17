"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { hashPassword, verifyPassword } from "@/lib/bcrypt";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

async function getCurrentUserId(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) throw new Error("Tidak terautentikasi");
  const payload = verifyToken(token);
  return payload.id;
}

// UPDATE PROFIL
export async function updateProfil(nama: string, username: string) {
  try {
    if (!nama.trim()) {
      return { success: false, message: "Nama wajib diisi", field: "nama" };
    }

    if (!username.trim()) {
      return {
        success: false,
        message: "Username wajib diisi",
        field: "username",
      };
    }

    if (username.includes(" ")) {
      return {
        success: false,
        message: "Username tidak boleh mengandung spasi",
        field: "username",
      };
    }

    const id = await getCurrentUserId();

    const sudahAda = await prisma.user.findFirst({
      where: {
        username: username.toLowerCase(),
        deletedAt: null,
        NOT: { id },
      },
    });

    if (sudahAda) {
      return {
        success: false,
        message: `Username "${username}" sudah digunakan`,
        field: "username",
      };
    }

    await prisma.user.update({
      where: { id },
      data: { nama, username: username.toLowerCase() },
    });

    revalidatePath("/admin/profil");
    revalidatePath("/petugas/profil");
    return { success: true, message: "Profil berhasil diperbarui" };
  } catch {
    return { success: false, message: "Gagal memperbarui profil" };
  }
}

// UPDATE PASSWORD
export async function updatePassword(
  passwordLama: string,
  passwordBaru: string,
  konfirmasiPassword: string,
) {
  try {
    const id = await getCurrentUserId();

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return { success: false, message: "User tidak ditemukan" };

    const valid = await verifyPassword(passwordLama, user.password);
    if (!valid) {
      return {
        success: false,
        message: "Password lama tidak sesuai",
        field: "passwordLama",
      };
    }

    if (passwordBaru.length < 6) {
      return {
        success: false,
        message: "Password baru minimal 6 karakter",
        field: "passwordBaru",
      };
    }

    if (passwordBaru !== konfirmasiPassword) {
      return {
        success: false,
        message: "Konfirmasi password tidak sesuai",
        field: "konfirmasiPassword",
      };
    }

    const hashed = await hashPassword(passwordBaru);
    await prisma.user.update({ where: { id }, data: { password: hashed } });

    revalidatePath("/admin/profil");
    revalidatePath("/petugas/profil");
    return { success: true, message: "Password berhasil diperbarui" };
  } catch {
    return { success: false, message: "Gagal memperbarui password" };
  }
}
