import { prisma } from "@/lib/prisma";
import { Users, ShieldCheck, Stethoscope, UserX } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import UserClient from "./PetugasClient";

async function getData() {
  const [userList, poliList] = await Promise.all([
    prisma.user.findMany({
      where: { deletedAt: null, role: "PETUGAS_POLI" },
      orderBy: { createdAt: "desc" },
      include: { poli: { select: { id: true, kode: true, nama: true } } },
    }),
    prisma.poli.findMany({
      where: {
        aktif: true,
        deletedAt: null,
      },
      orderBy: { urutan: "asc" },
      select: { id: true, kode: true, nama: true },
    }),
  ]);
  return { userList, poliList };
}

export default async function AdminUsersPage() {
  const { userList, poliList } = await getData();

  const totalPetugas = userList.length;
  const totalAktif = userList.filter((u) => u.aktif).length;
  const totalNonaktif = userList.filter((u) => !u.aktif).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Manajemen Petugas"
        description="Kelola akun petugas sistem antrian."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Petugas" value={totalPetugas} icon={Users} />
        <StatCard
          label="Petugas Aktif"
          value={totalAktif}
          icon={Stethoscope}
          variant="secondary"
        />
        <StatCard
          label="Petugas Nonaktif"
          value={totalNonaktif}
          icon={UserX}
          variant="danger"
        />
      </div>

      <UserClient userList={userList} poliList={poliList} />
    </div>
  );
}
