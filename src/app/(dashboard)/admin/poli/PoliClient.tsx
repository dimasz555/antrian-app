"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Stethoscope, Pencil, Trash2, PowerOff, Power } from "lucide-react";
import DataTable from "@/components/common/DataTable";
import StatusBadge from "@/components/common/StatusBadge";
import EmptyState from "@/components/common/EmptyState";
import TablePagination from "@/components/common/TablePagination";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import PoliModal from "./PoliModal";
import { deletePoli, toggleAktifPoli } from "./actions";

type Poli = {
  id: number;
  kode: string;
  nama: string;
  aktif: boolean;
  urutan: number;
  _count: { antrian: number };
};

type Props = {
  poliList: Poli[];
};

const PER_PAGE = 10;

export default function PoliClient({ poliList }: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // State modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPoli, setSelectedPoli] = useState<Poli | null>(null);

  // State konfirmasi hapus
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Poli | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Filter
  const filtered = poliList.filter(
    (p) =>
      p.nama.toLowerCase().includes(search.toLowerCase()) ||
      p.kode.toLowerCase().includes(search.toLowerCase()),
  );

  // Pagination
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  // Buka modal tambah
  const handleTambah = () => {
    setSelectedPoli(null);
    setModalOpen(true);
  };

  // Buka modal edit
  const handleEdit = (poli: Poli) => {
    setSelectedPoli(poli);
    setModalOpen(true);
  };

  // Buka konfirmasi hapus
  const handleHapus = (poli: Poli) => {
    setDeleteTarget(poli);
    setConfirmOpen(true);
  };

  // Konfirmasi hapus
  const handleConfirmHapus = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const result = await deletePoli(deleteTarget.id);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      setConfirmOpen(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Toggle aktif/nonaktif
  const handleToggleAktif = async (poli: Poli) => {
    const result = await toggleAktifPoli(poli.id, !poli.aktif);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
  };

  return (
    <>
      <DataTable
        title="Daftar Poliklinik"
        description="Kelola status operasional poli."
        searchPlaceholder="Cari poli..."
        onSearch={handleSearch}
        onTambah={handleTambah}
        labelTambah="Tambah Poli"
        footer={
          <TablePagination
            page={page}
            totalPages={totalPages}
            total={filtered.length}
            perPage={PER_PAGE}
            onPrev={() => setPage((p) => p - 1)}
            onNext={() => setPage((p) => p + 1)}
          />
        }
      >
        <table className="w-full text-left">
          <thead>
            <tr className="bg-muted/50 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
              <th className="px-5 py-3 border-b border-border">Poliklinik</th>
              <th className="px-5 py-3 border-b border-border">Kode</th>
              <th className="px-5 py-3 border-b border-border">
                Antrian Aktif
              </th>
              <th className="px-5 py-3 border-b border-border">Status</th>
              <th className="px-5 py-3 border-b border-border text-right">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <EmptyState
                    icon={Stethoscope}
                    title="Belum ada poli"
                    description="Tambahkan poli pertama untuk memulai."
                  />
                </td>
              </tr>
            ) : (
              paginated.map((poli) => (
                <tr
                  key={poli.id}
                  className="hover:bg-muted/30 transition-colors border-b border-border last:border-0"
                >
                  {/* Nama */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Stethoscope size={16} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {poli.nama}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Urutan: {poli.urutan}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Kode */}
                  <td className="px-5 py-4">
                    <span className="text-xl font-extrabold text-primary">
                      {poli.kode}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span className="font-semibold">{poli._count.antrian}</span>
                    <span className="text-muted-foreground"> pasien</span>
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge aktif={poli.aktif} />
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleToggleAktif(poli)}
                        title={poli.aktif ? "Nonaktifkan" : "Aktifkan"}
                        className={`p-2 rounded-lg transition-all ${
                          poli.aktif
                            ? "text-muted-foreground hover:text-yellow-600 hover:bg-yellow-50"
                            : "text-muted-foreground hover:text-success hover:bg-success/10"
                        }`}
                      >
                        {poli.aktif ? (
                          <PowerOff size={16} />
                        ) : (
                          <Power size={16} />
                        )}
                      </button>

                      <button
                        onClick={() => handleEdit(poli)}
                        title="Edit Poli"
                        className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() => handleHapus(poli)}
                        title="Hapus Poli"
                        className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </DataTable>

      {/* Modal Tambah/Edit */}
      <PoliModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        poli={selectedPoli}
      />

      {/* Dialog Konfirmasi Hapus */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmHapus}
        loading={deleteLoading}
        title="Hapus Poli"
        description={`Apakah Anda yakin ingin menghapus poli "${deleteTarget?.nama}"? Tindakan ini tidak dapat dibatalkan.`}
      />
    </>
  );
}
