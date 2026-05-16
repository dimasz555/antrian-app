"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Users, Pencil, Trash2, PowerOff, Power } from "lucide-react";
import DataTable from "@/components/common/DataTable";
import StatusBadge from "@/components/common/StatusBadge";
import EmptyState from "@/components/common/EmptyState";
import TablePagination from "@/components/common/TablePagination";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import UserModal from "./PetugasModal";
import { deleteUser, toggleAktifUser } from "./actions";

type Poli = { id: number; kode: string; nama: string };

type User = {
  id: string;
  nama: string;
  username: string;
  role: "ADMIN" | "PETUGAS_POLI";
  poliId: number | null;
  aktif: boolean;
  poli: Poli | null;
};

type Props = {
  userList: User[];
  poliList: Poli[];
};

const PER_PAGE = 10;

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Admin",
  PETUGAS_POLI: "Petugas Poli",
};

export default function UserClient({ userList, poliList }: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const filtered = userList.filter(
    (u) =>
      u.nama.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      ROLE_LABEL[u.role].toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleTambah = () => {
    setSelectedUser(null);
    setModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleHapus = (user: User) => {
    setDeleteTarget(user);
    setConfirmOpen(true);
  };

  const handleConfirmHapus = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const result = await deleteUser(deleteTarget.id);
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

  const handleToggleAktif = async (user: User) => {
    const result = await toggleAktifUser(user.id, !user.aktif);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
  };

  return (
    <>
      <DataTable
        title="Daftar Petugas"
        description="Kelola akun petugas dan admin sistem."
        searchPlaceholder="Cari nama, username, role..."
        onSearch={handleSearch}
        onTambah={handleTambah}
        labelTambah="Tambah Petugas"
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
              <th className="px-5 py-3 border-b border-border">Petugas</th>
              <th className="px-5 py-3 border-b border-border">Username</th>
              <th className="px-5 py-3 border-b border-border">Role</th>
              <th className="px-5 py-3 border-b border-border">Poli</th>
              <th className="px-5 py-3 border-b border-border">Status</th>
              <th className="px-5 py-3 border-b border-border text-right">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    icon={Users}
                    title="Belum ada petugas"
                    description="Tambahkan petugas pertama untuk memulai."
                  />
                </td>
              </tr>
            ) : (
              paginated.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-muted/30 transition-colors border-b border-border last:border-0"
                >
                  {/* Nama */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-bold text-primary text-sm">
                        {user.nama.charAt(0).toUpperCase()}
                      </div>
                      <p className="font-semibold text-foreground">
                        {user.nama}
                      </p>
                    </div>
                  </td>

                  {/* Username */}
                  <td className="px-5 py-4 text-muted-foreground">
                    @{user.username}
                  </td>

                  {/* Role */}
                  <td className="px-5 py-4">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        user.role === "ADMIN"
                          ? "bg-primary/10 text-primary"
                          : "bg-secondary/10 text-secondary"
                      }`}
                    >
                      {ROLE_LABEL[user.role]}
                    </span>
                  </td>

                  {/* Poli */}
                  <td className="px-5 py-4 text-muted-foreground">
                    {user.poli ? (
                      `${user.poli.kode} — ${user.poli.nama}`
                    ) : (
                      <span className="italic text-xs">Semua poli</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <StatusBadge
                      aktif={user.aktif}
                      labelAktif="Aktif"
                      labelNonaktif="Nonaktif"
                    />
                  </td>

                  {/* Aksi */}
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleToggleAktif(user)}
                        title={user.aktif ? "Nonaktifkan" : "Aktifkan"}
                        className={`p-2 rounded-lg transition-all ${
                          user.aktif
                            ? "text-muted-foreground hover:text-yellow-600 hover:bg-yellow-50"
                            : "text-muted-foreground hover:text-success hover:bg-success/10"
                        }`}
                      >
                        {user.aktif ? (
                          <PowerOff size={16} />
                        ) : (
                          <Power size={16} />
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleHapus(user)}
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

      <UserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        user={selectedUser}
        poliList={poliList}
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmHapus}
        loading={deleteLoading}
        title="Hapus Petugas"
        description={`Apakah Anda yakin ingin menghapus petugas "${deleteTarget?.nama}"? Tindakan ini tidak dapat dibatalkan.`}
      />
    </>
  );
}
