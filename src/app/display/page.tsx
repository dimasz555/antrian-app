import { prisma } from "@/lib/prisma";
import DisplayClient from "./DisplayClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getData() {
  const today = new Date();
  const start = new Date(new Date().setHours(0, 0, 0, 0));
  const end = new Date(new Date().setHours(23, 59, 59, 999));

  const [poliList, configList] = await Promise.all([
    prisma.poli.findMany({
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
    }),
    prisma.konfigurasi.findMany({
      where: {
        key: {
          in: [
            "NAMA_RS",
            "TICKER_TEXT",
            "VIDEO_URL_1",
            "VIDEO_URL_2",
            "VIDEO_URL_3",
            "LOGO_RS",
          ],
        },
      },
    }),
  ]);

  const config = Object.fromEntries(configList.map((c) => [c.key, c.value]));

  // Format data poli
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

  return { poliData, config };
}

export default async function DisplayPage() {
  const { poliData, config } = await getData();

  return <DisplayClient poliData={poliData} config={config} />;
}
