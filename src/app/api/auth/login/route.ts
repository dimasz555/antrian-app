import { NextRequest } from "next/server";
import { LoginBody } from "@/types/auth";
import { errorResponse, successResponse } from "@/lib/response";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/bcrypt";
import { generateToken } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  try {
    const body: LoginBody = await request.json();

    if (!body.username || !body.password) {
      return errorResponse("Nama pengguna dan kata sandi wajib diisi", 400);
    }

    const user = await prisma.user.findFirst({
      where: {
        username: body.username,
        deletedAt: null,
      },
    });

    // check user exist
    if (!user) {
      return errorResponse("Nama pengguna atau kata sandi salah", 401);
    }

    // check active user
    if (!user.aktif) {
      return errorResponse(
        "Akun Anda tidak aktif. Hubungi administrator.",
        403,
      );
    }

    // password validation
    const passwordValid = await verifyPassword(body.password, user.password);
    if (!passwordValid) {
      return errorResponse("Nama pengguna atau kata sandi salah", 401);
    }

    // generate JWT token
    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role,
      poliId: user.poliId,
    });

    // response httpOnly cookie
    const response = successResponse(
      {
        id: user.id,
        name: user.nama,
        username: user.username,
        role: user.role,
        poliId: user.poliId,
      },
      "Login berhasil",
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return errorResponse("Terjadi kesalahan pada server", 500);
  }
}
