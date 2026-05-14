"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
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
import { createPoli, updatePoli } from "./actions";

type Poli = {
  id: number;
  kode: string;
  nama: string;
  urutan: number;
  aktif: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  poli?: Poli | null;
};

// Tipe error per field
type FormErrors = {
  kode?: string;
  nama?: string;
  urutan?: string;
};

function PoliForm({
  poli,
  onClose,
}: {
  poli?: Poli | null;
  onClose: () => void;
}) {
  const isEdit = !!poli;

  const [form, setForm] = useState({
    kode: poli?.kode ?? "",
    nama: poli?.nama ?? "",
    urutan: poli?.urutan ?? 1,
    aktif: poli?.aktif ?? true,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  // Validasi per field
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.kode.trim()) {
      newErrors.kode = "Kode poli wajib diisi";
    } else if (form.kode.length > 3) {
      newErrors.kode = "Kode maksimal 3 huruf";
    }

    if (!form.nama.trim()) {
      newErrors.nama = "Nama poli wajib diisi";
    }

    if (!form.urutan || form.urutan < 1) {
      newErrors.urutan = "Urutan harus lebih dari 0";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Clear error saat user mengetik
  const clearError = (field: keyof FormErrors) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const result = isEdit
        ? await updatePoli(poli!.id, form)
        : await createPoli(form);

      if (!result.success) {
        if (result.message.toLowerCase().includes("kode")) {
          setErrors({ kode: result.message });
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
        {/* Kode */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="kode">
            Kode Poli <span className="text-destructive">*</span>
          </Label>
          <Input
            id="kode"
            placeholder="Contoh: A, B, C"
            maxLength={3}
            value={form.kode}
            onChange={(e) => {
              setForm((prev) => ({
                ...prev,
                kode: e.target.value.toUpperCase(),
              }));
              clearError("kode");
            }}
            className={
              errors.kode
                ? "border-destructive focus-visible:ring-destructive"
                : ""
            }
          />
          {errors.kode ? (
            <p className="text-xs text-destructive">{errors.kode}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Kode unik 1-3 huruf. Contoh: A → antrian A-001
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nama">
            Nama Poli <span className="text-destructive">*</span>
          </Label>
          <Input
            id="nama"
            placeholder="Contoh: Kluster 1 - Umum"
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

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="urutan">
            Urutan Tampil <span className="text-destructive">*</span>
          </Label>
          <Input
            id="urutan"
            type="number"
            min={1}
            value={form.urutan}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, urutan: Number(e.target.value) }));
              clearError("urutan");
            }}
            className={
              errors.urutan
                ? "border-destructive focus-visible:ring-destructive"
                : ""
            }
          />
          {errors.urutan ? (
            <p className="text-xs text-destructive">{errors.urutan}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Urutan poli pada layar display antrian.
            </p>
          )}
        </div>

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
            Poli aktif
          </Label>
        </div>
      </div>

      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Batal
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading && <Loader2 size={15} className="animate-spin mr-1" />}
          {isEdit ? "Simpan Perubahan" : "Tambah Poli"}
        </Button>
      </DialogFooter>
    </>
  );
}

export default function PoliModal({ open, onClose, poli }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{poli ? "Edit Poli" : "Tambah Poli Baru"}</DialogTitle>
          <DialogDescription>
            {poli
              ? "Ubah informasi poli yang sudah ada."
              : "Isi form berikut untuk menambahkan poli baru."}
          </DialogDescription>
        </DialogHeader>
        <PoliForm key={poli?.id ?? "new"} poli={poli} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
}
