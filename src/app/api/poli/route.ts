import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import type { CreatePoliInput } from "@/types/poli";

export async function GET() {
  try {
    const poliList = await prisma.poli.findMany({
      orderBy: { urutan: "asc" },
    });

    return successResponse(poliList, "Data poli berhasil diambil");
  } catch (error) {
    console.error("GET /api/poli error:", error);
    return errorResponse("Gagal mengambil data poli");
  }
}

export async function POST(request: Request) {
  try {
    const input: CreatePoliInput = await request.json();

    if (!input.kode || !input.nama || input.urutan === undefined) {
      return errorResponse("Field kode, nama, dan urutan wajib diisi", 400);
    }

    // Cek apakah kode sudah dipakai
    const existing = await prisma.poli.findUnique({
      where: { kode: input.kode },
    });

    if (existing) {
      return errorResponse(`Poli dengan kode "${input.kode}" sudah ada`, 409);
    }

    const poli = await prisma.poli.create({
      data: {
        kode: input.kode,
        nama: input.nama,
        urutan: input.urutan,
        aktif: input.aktif ?? true,
      },
    });

    return successResponse(poli, "Poli berhasil dibuat", 201);
  } catch (error) {
    console.error("POST /api/poli error:", error);
    return errorResponse("Gagal membuat poli");
  }
}
