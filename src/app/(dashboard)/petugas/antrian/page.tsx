import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/common/PageHeader";
import AntrianClient from "./AntrianClient";

async function getData(poliId: number) {
  const today = new Date();
  const start = new Date(new Date().setHours(0, 0, 0, 0));
  const end = new Date(new Date().setHours(23, 59, 59, 999));

  const [poli, antrian] = await Promise.all([
    prisma.poli.findUnique({
      where: { id: poliId },
      select: { id: true, kode: true, nama: true },
    }),
    prisma.antrian.findMany({
      where: {
        poliId,
        tanggal: { gte: start, lte: end },
      },
      orderBy: { nomorUrut: "asc" },
    }),
  ]);

  return { poli, antrian };
}

export default async function PetugasAntrianPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) redirect("/login");

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    redirect("/login?reason=expired");
  }

  // Pastikan petugas punya poli
  if (!payload.poliId) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Antrian Saya"
          description="Kelola antrian poli Anda."
        />
        <div className="bg-card border border-border rounded-xl p-10 text-center">
          <p className="text-muted-foreground">
            Akun Anda belum ditetapkan ke poli manapun. Hubungi admin.
          </p>
        </div>
      </div>
    );
  }

  const { poli, antrian } = await getData(payload.poliId);

  if (!poli) redirect("/login");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Antrian — ${poli.nama}`}
        description={`Kode Poli: ${poli.kode} • Kelola antrian pasien hari ini.`}
      />
      <AntrianClient poli={poli} antrianList={antrian} />
    </div>
  );
}
