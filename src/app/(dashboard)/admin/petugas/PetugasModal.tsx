"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createUser, updateUser } from "./actions";

type Poli = { id: number; kode: string; nama: string };

type User = {
  id: string;
  nama: string;
  username: string;
  role: "ADMIN" | "PETUGAS_POLI";
  poliId: number | null;
  aktif: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  user?: User | null;
  poliList: Poli[];
};

type FormErrors = {
  nama?: string;
  username?: string;
  password?: string;
  poliId?: string;
};

function UserForm({
  user,
  poliList,
  onClose,
}: {
  user?: User | null;
  poliList: Poli[];
  onClose: () => void;
}) {
  const isEdit = !!user;

  const [form, setForm] = useState({
    nama: user?.nama ?? "",
    username: user?.username ?? "",
    password: "",
    role: user?.role ?? ("PETUGAS_POLI" as "ADMIN" | "PETUGAS_POLI"),
    poliId: user?.poliId ?? (null as number | null),
    aktif: user?.aktif ?? true,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.nama.trim()) newErrors.nama = "Nama wajib diisi";
    if (!form.username.trim()) newErrors.username = "Username wajib diisi";
    else if (form.username.includes(" "))
      newErrors.username = "Username tidak boleh mengandung spasi";

    if (!isEdit && !form.password) {
      newErrors.password = "Password wajib diisi";
    } else if (form.password && form.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
    }

    if (form.role === "PETUGAS_POLI" && !form.poliId) {
      newErrors.poliId = "Poli wajib dipilih untuk petugas poli";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearError = (field: keyof FormErrors) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const result = isEdit
        ? await updateUser(user!.id, form)
        : await createUser(form);

      if (!result.success) {
        // Error field spesifik
        if ("field" in result && result.field) {
          setErrors({ [result.field]: result.message });
        } else {
          toast.error(result.message);
        }
        return;
      }

      toast.success(result.message);
      onClose();
    } catch {
      toast.error("Terjadi kesalahan, silakan coba lagi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 py-2">
        {/* Nama */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nama">
            Nama Lengkap <span className="text-destructive">*</span>
          </Label>
          <Input
            id="nama"
            placeholder="Contoh: Budi Santoso"
            value={form.nama}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, nama: e.target.value }));
              clearError("nama");
            }}
            className={
              errors.nama
                ? "border-destructive focus-visible:ring-destructive"
                : ""
            }
          />
          {errors.nama && (
            <p className="text-xs text-destructive">{errors.nama}</p>
          )}
        </div>

        {/* Username */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="username">
            Username <span className="text-destructive">*</span>
          </Label>
          <Input
            id="username"
            placeholder="Contoh: budi.santoso"
            value={form.username}
            onChange={(e) => {
              setForm((prev) => ({
                ...prev,
                username: e.target.value.toLowerCase(),
              }));
              clearError("username");
            }}
            className={
              errors.username
                ? "border-destructive focus-visible:ring-destructive"
                : ""
            }
          />
          {errors.username ? (
            <p className="text-xs text-destructive">{errors.username}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Huruf kecil, tanpa spasi.
            </p>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">
            Password {!isEdit && <span className="text-destructive">*</span>}
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder={
                isEdit
                  ? "Kosongkan jika tidak ingin mengubah"
                  : "Minimal 6 karakter"
              }
              value={form.password}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, password: e.target.value }));
                clearError("password");
              }}
              className={`pr-10 ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password ? (
            <p className="text-xs text-destructive">{errors.password}</p>
          ) : isEdit ? (
            <p className="text-xs text-muted-foreground">
              Kosongkan jika tidak ingin mengubah password.
            </p>
          ) : null}
        </div>

        {/* Role */}
        <div className="flex flex-col gap-1.5">
          <Label>
            Role <span className="text-destructive">*</span>
          </Label>
          <Select
            value={form.role}
            onValueChange={(value: "ADMIN" | "PETUGAS_POLI") => {
              setForm((prev) => ({
                ...prev,
                role: value,
                // Reset poliId jika ganti ke ADMIN
                poliId: value === "ADMIN" ? null : prev.poliId,
              }));
              clearError("poliId");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="PETUGAS_POLI">Petugas Poli</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Poli — hanya muncul jika PETUGAS_POLI */}
        {form.role === "PETUGAS_POLI" && (
          <div className="flex flex-col gap-1.5">
            <Label>
              Poli <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.poliId?.toString() ?? ""}
              onValueChange={(value) => {
                setForm((prev) => ({ ...prev, poliId: Number(value) }));
                clearError("poliId");
              }}
            >
              <SelectTrigger
                className={
                  errors.poliId
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
              >
                <SelectValue placeholder="Pilih poli" />
              </SelectTrigger>
              <SelectContent>
                {poliList.map((poli) => (
                  <SelectItem key={poli.id} value={poli.id.toString()}>
                    {poli.kode} — {poli.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.poliId && (
              <p className="text-xs text-destructive">{errors.poliId}</p>
            )}
          </div>
        )}

        {/* Status aktif */}
        <div className="flex items-center gap-3">
          <input
            id="aktif"
            type="checkbox"
            checked={form.aktif}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, aktif: e.target.checked }))
            }
            className="w-4 h-4 rounded border-border accent-primary"
          />
          <Label htmlFor="aktif" className="cursor-pointer">
            Akun aktif
          </Label>
        </div>
      </div>

      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Batal
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading && <Loader2 size={15} className="animate-spin mr-1" />}
          {isEdit ? "Simpan Perubahan" : "Tambah Petugas"}
        </Button>
      </DialogFooter>
    </>
  );
}

export default function UserModal({ open, onClose, user, poliList }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {user ? "Edit Petugas" : "Tambah Petugas Baru"}
          </DialogTitle>
          <DialogDescription>
            {user
              ? "Ubah informasi petugas yang sudah ada."
              : "Isi form berikut untuk menambahkan petugas baru."}
          </DialogDescription>
        </DialogHeader>
        <UserForm
          key={user?.id ?? "new"}
          user={user}
          poliList={poliList}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
