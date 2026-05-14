import { prisma } from "@/lib/prisma";
import { Stethoscope } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import PoliClient from "./PoliClient";

async function getPoliList() {
  return prisma.poli.findMany({
    orderBy: { urutan: "asc" },
    include: {
      _count: {
        select: {
          antrian: {
            where: { status: { in: ["MENUNGGU", "DIPANGGIL"] } },
          },
        },
      },
    },
  });
}

export default async function AdminPoliPage() {
  const poliList = await getPoliList();

  const totalAktif = poliList.filter((p) => p.aktif).length;
  const totalNonaktif = poliList.length - totalAktif;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Kelola Poli"
        description="Kelola data poliklinik dan status operasionalnya."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Total Poli"
          value={poliList.length}
          icon={Stethoscope}
        />
        <StatCard
          label="Poli Aktif"
          value={totalAktif}
          icon={Stethoscope}
          variant="success"
        />
        <StatCard
          label="Poli Nonaktif"
          value={totalNonaktif}
          icon={Stethoscope}
          variant="danger"
        />
      </div>

      {/* Pass data ke client component */}
      <PoliClient poliList={poliList} />
    </div>
  );
}
