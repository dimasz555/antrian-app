"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Stethoscope,
  Pencil,
  Trash2,
  PowerOff,
  Power,
  RotateCcw,
} from "lucide-react";
import DataTable from "@/components/common/DataTable";
import StatusBadge from "@/components/common/StatusBadge";
import EmptyState from "@/components/common/EmptyState";
import TablePagination from "@/components/common/TablePagination";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import PoliModal from "./PoliModal";
import {
  deletePoli,
  hardDeletePoli,
  restorePoli,
  toggleAktifPoli,
} from "./actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Poli = {
  id: number;
  kode: string;
  nama: string;
  aktif: boolean;
  urutan: number;
  _count: { antrian: number };
};

type DeletedPoli = {
  id: number;
  kode: string;
  nama: string;
  aktif: boolean;
  urutan: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

type Props = {
  poliList: Poli[];
  deletedList: DeletedPoli[];
};

const PER_PAGE = 10;

export default function PoliClient({ poliList, deletedList }: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // State modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPoli, setSelectedPoli] = useState<Poli | null>(null);

  // State konfirmasi hapus
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Poli | DeletedPoli | null>(
    null,
  );

  const [restoreTarget, setRestoreTarget] = useState<DeletedPoli | null>(null);
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);

  const [deleteLoading, setDeleteLoading] = useState(false);

  // Filter
  const filtered = poliList.filter(
    (p) =>
      p.nama.toLowerCase().includes(search.toLowerCase()) ||
      p.kode.toLowerCase().includes(search.toLowerCase()),
  );

  const [isHardDelete, setIsHardDelete] = useState(false);

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
      // ← Ini yang error sebelumnya, selalu pakai deletePoli
      const result = isHardDelete
        ? await hardDeletePoli(deleteTarget.id)
        : await deletePoli(deleteTarget.id);

      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      setConfirmOpen(false);
      setIsHardDelete(false);
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

  const handleRestore = (poli: DeletedPoli) => {
    setRestoreTarget(poli);
    setRestoreConfirmOpen(true);
  };

  const handleConfirmRestore = async () => {
    if (!restoreTarget) return;
    setRestoreLoading(true);
    try {
      const result = await restorePoli(restoreTarget.id);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      setRestoreConfirmOpen(false);
    } finally {
      setRestoreLoading(false);
    }
  };

  const handleHardDelete = (poli: DeletedPoli) => {
    setDeleteTarget(poli);
    setIsHardDelete(true);
    setConfirmOpen(true);
  };

  return (
    <>
      <Tabs defaultValue="aktif">
        <TabsList className="mb-2">
          <TabsTrigger value="aktif">
            Aktif
            <span className="ml-2 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
              {poliList.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="dihapus">
            Dihapus
            <span className="ml-2 text-xs bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full">
              {deletedList.length}
            </span>
          </TabsTrigger>
        </TabsList>

        {/* Tab Aktif */}
        <TabsContent value="aktif">
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
                  <th className="px-5 py-3 border-b border-border">
                    Poliklinik
                  </th>
                  <th className="px-5 py-3 border-b border-border">Kode</th>
                  <th className="px-5 py-3 border-b border-border">Status</th>
                  <th className="px-5 py-3 border-b border-border">Antrian</th>
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
                        title="Tidak ada poli ditemukan"
                        description="Coba ubah kata kunci pencarian atau tambah poli baru."
                      />
                    </td>
                  </tr>
                ) : (
                  paginated.map((poli) => (
                    <tr
                      key={poli.id}
                      className="hover:bg-muted/30 transition-colors border-b border-border last:border-0"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Stethoscope size={16} className="text-primary" />
                          </div>
                          <p className="font-semibold text-foreground">
                            {poli.nama}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xl font-extrabold text-foreground">
                          {poli.kode}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge aktif={poli.aktif} />
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {poli._count.antrian}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(poli)}
                            title="Edit"
                            className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                          >
                            <Pencil size={16} />
                          </button>
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
                            onClick={() => handleHapus(poli)}
                            title="Hapus"
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
        </TabsContent>

        {/* Tab Dihapus */}
        <TabsContent value="dihapus">
          <DataTable
            title="Data Terhapus"
            description="Data poli yang sudah dihapus. Anda bisa memulihkan atau menghapus permanen."
          >
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted/50 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                  <th className="px-5 py-3 border-b border-border">
                    Poliklinik
                  </th>
                  <th className="px-5 py-3 border-b border-border">Kode</th>
                  <th className="px-5 py-3 border-b border-border">
                    Dihapus Pada
                  </th>
                  <th className="px-5 py-3 border-b border-border text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {deletedList.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <EmptyState
                        icon={Stethoscope}
                        title="Tidak ada data terhapus"
                        description="Data yang dihapus akan muncul di sini."
                      />
                    </td>
                  </tr>
                ) : (
                  deletedList.map((poli) => (
                    <tr
                      key={poli.id}
                      className="hover:bg-muted/30 transition-colors border-b border-border last:border-0"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <Stethoscope
                              size={16}
                              className="text-muted-foreground"
                            />
                          </div>
                          <p className="font-semibold text-muted-foreground">
                            {poli.nama}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xl font-extrabold text-muted-foreground">
                          {poli.kode}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground text-xs">
                        {new Date(poli.deletedAt!).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleRestore(poli)}
                            title="Pulihkan"
                            className="p-2 rounded-lg text-muted-foreground hover:text-success hover:bg-success/10 transition-all"
                          >
                            <RotateCcw size={16} />
                          </button>
                          <button
                            onClick={() => handleHardDelete(poli)}
                            title="Hapus Permanen"
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
        </TabsContent>
      </Tabs>

      {/* Modal & Dialog tetap di luar Tabs */}
      <PoliModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        poli={selectedPoli}
      />

      <ConfirmDialog
        open={restoreConfirmOpen}
        onClose={() => setRestoreConfirmOpen(false)}
        onConfirm={handleConfirmRestore}
        loading={restoreLoading}
        title="Pulihkan Poli"
        description={`Apakah Anda yakin ingin memulihkan poli "${restoreTarget?.nama}"?`}
        confirmLabel="Pulihkan"
        confirmVariant="default"
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setIsHardDelete(false);
        }}
        onConfirm={handleConfirmHapus}
        loading={deleteLoading}
        title={isHardDelete ? "Hapus Permanen" : "Hapus Poli"}
        description={
          isHardDelete
            ? `Data "${deleteTarget?.nama}" akan dihapus permanen dan tidak bisa dipulihkan!`
            : `Poli "${deleteTarget?.nama}" akan dipindahkan ke sampah.`
        }
        confirmLabel={isHardDelete ? "Hapus Permanen" : "Hapus"}
        confirmVariant="destructive"
      />
    </>
  );
}
