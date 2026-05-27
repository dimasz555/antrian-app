import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const today = new Date();
  const start = new Date(today.setHours(0, 0, 0, 0));
  const end = new Date(today.setHours(23, 59, 59, 999));

  const poliList = await prisma.poli.findMany({
    where: { aktif: true, deletedAt: null },
    orderBy: { urutan: "asc" },
    include: {
      antrian: {
        where: {
          tanggal: { gte: start, lte: end },
          status: { in: ["MENUNGGU", "DIPANGGIL"] },
        },
        orderBy: { nomorUrut: "asc" },
      },
    },
  });

  const poliData = poliList.map((poli) => {
    const dipanggil = poli.antrian.find((a) => a.status === "DIPANGGIL");
    const menunggu = poli.antrian.filter((a) => a.status === "MENUNGGU");
    return {
      id: poli.id,
      kode: poli.kode,
      nama: poli.nama,
      sedangDipanggil: dipanggil?.kodeAntrian ?? null,
      berikutnya: menunggu[0]?.kodeAntrian ?? null,
      totalMenunggu: menunggu.length,
    };
  });

  return NextResponse.json(poliData);
}
