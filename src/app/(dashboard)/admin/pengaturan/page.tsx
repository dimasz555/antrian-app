import PageHeader from "@/components/common/PageHeader";
import PengaturanClient from "./PengaturanClient";
import { getKonfigurasi } from "./actions";

export default async function AdminPengaturanPage() {
  const config = await getKonfigurasi();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Pengaturan Sistem"
        description="Kelola konfigurasi sistem antrian."
      />
      <PengaturanClient config={config} />
    </div>
  );
}
