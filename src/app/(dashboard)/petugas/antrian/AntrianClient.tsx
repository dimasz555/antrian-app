"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronRight,
  RotateCcw,
  CheckCircle,
  SkipForward,
  AlertTriangle,
  Clock,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
  panggilBerikutnya,
  panggilUlang,
  selesaikanAntrian,
  lewatiAntrian,
  resetAntrianManual,
} from "./actions";
import { useSSE } from "@/hooks/useSSE";

type Antrian = {
  id: number;
  kodeAntrian: string;
  nomorUrut: number;
  status: "MENUNGGU" | "DIPANGGIL" | "SELESAI" | "TERLEWAT";
  jumlahPanggil: number;
  dipanggilAt: Date | null;
  selesaiAt: Date | null;
  createdAt: Date;
};

type Poli = {
  id: number;
  kode: string;
  nama: string;
};

type Props = {
  poli: Poli;
  antrianList: Antrian[];
};

const STATUS_CONFIG = {
  MENUNGGU: {
    label: "Menunggu",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  DIPANGGIL: {
    label: "Dipanggil",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  SELESAI: {
    label: "Selesai",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  TERLEWAT: {
    label: "Terlewat",
    className: "bg-red-100 text-red-700 border-red-200",
  },
};

export default function AntrianClient({ poli, antrianList }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Subscribe SSE
  useSSE({
    poliId: poli.id,
    onMessage: (event) => {
      if (
        event.type === "antrian_baru" ||
        event.type === "antrian_dipanggil" ||
        event.type === "antrian_selesai" ||
        event.type === "antrian_terlewat" ||
        event.type === "antrian_reset"
      ) {
        router.refresh();
      }
    },
  });
  // Derived state
  const sedangDipanggil = antrianList.find((a) => a.status === "DIPANGGIL");
  const menunggu = antrianList.filter((a) => a.status === "MENUNGGU");
  const selesai = antrianList.filter((a) => a.status === "SELESAI");
  const terlewat = antrianList.filter((a) => a.status === "TERLEWAT");

  // Handlers
  const handlePanggilBerikutnya = () => {
    startTransition(async () => {
      const result = await panggilBerikutnya(poli.id);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
    });
  };

  const handlePanggilUlang = () => {
    if (!sedangDipanggil) return;
    startTransition(async () => {
      const result = await panggilUlang(sedangDipanggil.id);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
    });
  };

  const handleSelesaikan = () => {
    if (!sedangDipanggil) return;
    startTransition(async () => {
      const result = await selesaikanAntrian(sedangDipanggil.id);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
    });
  };

  const handleLewati = () => {
    if (!sedangDipanggil) return;
    startTransition(async () => {
      const result = await lewatiAntrian(sedangDipanggil.id);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
    });
  };

  const handleReset = async () => {
    setResetLoading(true);
    try {
      const result = await resetAntrianManual(poli.id);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      setResetConfirmOpen(false);
    } finally {
      setResetLoading(false);
    }
  };

  const formatTime = (date: Date | null) => {
    if (!date) return "–";
    const completedAt = new Date(date);
    const hours = completedAt.getHours().toString().padStart(2, "0");
    const minutes = completedAt.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="flex flex-col gap-4">
          <div
            className={`rounded-2xl p-6 flex flex-col items-center text-center border-2 ${
              sedangDipanggil
                ? "bg-primary border-primary"
                : "bg-card border-border"
            }`}
          >
            <p
              className={`text-xs font-bold tracking-widest uppercase mb-3 ${
                sedangDipanggil
                  ? "text-primary-foreground/70"
                  : "text-muted-foreground"
              }`}
            >
              Sedang Dipanggil
            </p>
            <p
              className={`font-extrabold leading-none mb-2 ${
                sedangDipanggil
                  ? "text-primary-foreground"
                  : "text-muted-foreground"
              }`}
              style={{ fontSize: "clamp(48px, 6vw, 72px)" }}
            >
              {sedangDipanggil?.kodeAntrian ?? "–"}
            </p>
            {sedangDipanggil && (
              <p className="text-primary-foreground/70 text-xs mt-1">
                Dipanggil {sedangDipanggil.jumlahPanggil}x
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {sedangDipanggil ? (
              <>
                <Button
                  onClick={handlePanggilUlang}
                  disabled={isPending}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <RotateCcw size={16} />
                  Panggil Ulang
                </Button>
                <Button
                  onClick={handleSelesaikan}
                  disabled={isPending}
                  className="w-full gap-2 bg-success hover:bg-success/90 text-success-foreground"
                >
                  <CheckCircle size={16} />
                  Selesaikan
                </Button>
                <Button
                  onClick={handleLewati}
                  disabled={isPending}
                  variant="outline"
                  className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                >
                  <SkipForward size={16} />
                  Lewati
                </Button>
              </>
            ) : (
              <Button
                onClick={handlePanggilBerikutnya}
                disabled={isPending || menunggu.length === 0}
                className="w-full gap-2"
                size="lg"
              >
                <ChevronRight size={18} />
                Panggil Berikutnya
              </Button>
            )}
          </div>

          <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Statistik Hari Ini
            </p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {menunggu.length}
                </p>
                <p className="text-xs text-muted-foreground">Menunggu</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-success">
                  {selesai.length}
                </p>
                <p className="text-xs text-muted-foreground">Selesai</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-destructive">
                  {terlewat.length}
                </p>
                <p className="text-xs text-muted-foreground">Terlewat</p>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => setResetConfirmOpen(true)}
            className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
          >
            <RefreshCw size={16} />
            Reset Antrean Hari Ini
          </Button>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-yellow-600" />
                <p className="font-semibold text-sm text-foreground">
                  Menunggu
                </p>
              </div>
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold">
                {menunggu.length} antrean
              </span>
            </div>
            <div className="divide-y divide-border max-h-64 overflow-y-auto">
              {menunggu.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-8">
                  Tidak ada antrean menunggu
                </p>
              ) : (
                menunggu.map((a) => (
                  <div
                    key={a.id}
                    className="px-5 py-3 flex items-center justify-between"
                  >
                    <span className="font-bold text-foreground">
                      {a.kodeAntrian}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      #{a.nomorUrut}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle size={15} className="text-success" />
                <p className="font-semibold text-sm text-foreground">Selesai</p>
              </div>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                {selesai.length} antrean
              </span>
            </div>
            <div className="divide-y divide-border max-h-48 overflow-y-auto">
              {selesai.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-6">
                  Belum ada antrean selesai
                </p>
              ) : (
                selesai.map((a) => (
                  <div
                    key={a.id}
                    className="px-5 py-3 flex items-center justify-between"
                  >
                    <span className="font-medium text-muted-foreground">
                      {a.kodeAntrian}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(a.selesaiAt ? new Date(a.selesaiAt) : null)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {terlewat.length > 0 && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={15} className="text-destructive" />
                  <p className="font-semibold text-sm text-foreground">
                    Terlewat
                  </p>
                </div>
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">
                  {terlewat.length} antrian
                </span>
              </div>
              <div className="divide-y divide-border max-h-40 overflow-y-auto">
                {terlewat.map((a) => (
                  <div
                    key={a.id}
                    className="px-5 py-3 flex items-center justify-between"
                  >
                    <span className="font-medium text-muted-foreground line-through">
                      {a.kodeAntrian}
                    </span>
                    <span className="text-xs text-destructive">Terlewat</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        onConfirm={handleReset}
        loading={resetLoading}
        title="Reset Antrean"
        description="Semua antrean yang menunggu dan sedang dipanggil akan ditandai sebagai terlewat. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Reset Sekarang"
        confirmVariant="destructive"
      />
    </>
  );
}
