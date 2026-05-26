import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import type { UpdatePoliInput } from "@/types/poli";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const poliId = Number(id);

    // Validasi ID harus angka
    if (isNaN(poliId)) {
      return errorResponse("ID harus berupa angka", 400);
    }

    const poli = await prisma.poli.findUnique({
      where: { id: poliId },
    });

    if (!poli) {
      return errorResponse("Poli tidak ditemukan", 404);
    }

    return successResponse(poli, "Data poli berhasil diambil");
  } catch (error) {
    console.error("GET /api/poli/[id] error:", error);
    return errorResponse("Gagal mengambil data poli");
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const poliId = Number(id);

    if (isNaN(poliId)) {
      return errorResponse("ID harus berupa angka", 400);
    }

    const input: UpdatePoliInput = await request.json();

    // Cek poli ada atau tidak
    const existing = await prisma.poli.findUnique({
      where: { id: poliId },
    });

    if (!existing) {
      return errorResponse("Poli tidak ditemukan", 404);
    }

    // Jika kode diubah, cek apakah kode baru sudah dipakai poli lain
    if (input.kode && input.kode !== existing.kode) {
      const duplicateKode = await prisma.poli.findFirst({
        where: { kode: input.kode },
      });

      if (duplicateKode) {
        return errorResponse(`Poli dengan kode "${input.kode}" sudah ada`, 409);
      }
    }

    const poli = await prisma.poli.update({
      where: { id: poliId },
      data: input,
    });

    return successResponse(poli, "Poli berhasil diupdate");
  } catch (error) {
    console.error("PUT /api/poli/[id] error:", error);
    return errorResponse("Gagal mengupdate poli");
  }
}

/**
 * DELETE /api/poli/[id]
 *
 * Hapus poli berdasarkan ID.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const poliId = Number(id);

    if (isNaN(poliId)) {
      return errorResponse("ID harus berupa angka", 400);
    }

    // Cek poli ada atau tidak
    const existing = await prisma.poli.findUnique({
      where: { id: poliId },
    });

    if (!existing) {
      return errorResponse("Poli tidak ditemukan", 404);
    }

    await prisma.poli.delete({
      where: { id: poliId },
    });

    return successResponse(null, "Poli berhasil dihapus");
  } catch (error) {
    console.error("DELETE /api/poli/[id] error:", error);
    return errorResponse("Gagal menghapus poli");
  }
}
