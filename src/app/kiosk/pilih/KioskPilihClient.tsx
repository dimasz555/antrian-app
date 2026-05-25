"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Stethoscope, Printer, X } from "lucide-react";
import LiveClock from "@/components/common/LiveClock";
import { generateAntrian } from "../actions";
import { useRouter } from "next/navigation";
import { useSSE } from "@/hooks/useSSE";
import AppLogo from "@/components/common/AppLogo";

type Poli = {
  id: number;
  kode: string;
  nama: string;
  _count: { antrian: number };
};

type TiketData = {
  kodeAntrian: string;
  namaPoli: string;
  createdAt: Date;
};

type Props = {
  poliList: Poli[];
  config: Record<string, string>;
};

export default function KioskPilihClient({ poliList, config }: Props) {
  const router = useRouter();
  const [selectedPoli, setSelectedPoli] = useState<Poli | null>(null);
  const [tiket, setTiket] = useState<TiketData | null>(null);
  const [loading, setLoading] = useState(false);

  const logoRS = config.LOGO_RS ?? "";
  const namaRS = config.NAMA_RS ?? "Sistem Antrian";

  useSSE({
    poliId: "all",
    onMessage: (event) => {
      if (event.type === "antrian_baru" || event.type === "antrian_update") {
        router.refresh();
      }
    },
  });

  const handlePilihPoli = (poli: Poli) => {
    if (selectedPoli?.id === poli.id) {
      setSelectedPoli(null);
      return;
    }
    setSelectedPoli(poli);
  };

  const handleAmbilAntrian = async () => {
    if (!selectedPoli) return;
    setLoading(true);
    try {
      const result = await generateAntrian(selectedPoli.id);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      setTiket({
        kodeAntrian: result.data!.kodeAntrian,
        namaPoli: result.data!.namaPoli,
        createdAt: result.data!.createdAt,
      });
      setSelectedPoli(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCetak = () => {
    window.print();
  };

  const handleSelesai = () => {
    setTiket(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-primary px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex gap-2">
          <AppLogo logoBase64={logoRS} namaRS={namaRS} size={40} />
          <div className="flex flex-col">
            <h1 className="text-background font-bold text-lg leading-tight">
              {namaRS}
            </h1>
            <p className="text-accent text-xs mt-0.5">
              Jam Layanan: {config.JAM_BUKA ?? "07:00"} –{" "}
              {config.JAM_TUTUP ?? "16:00"} WIB
            </p>
          </div>
        </div>
        <LiveClock variant="kiosk" />
      </header>

      <main className="flex-1 p-6">
        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold text-foreground">
            Pilih Layanan Poli
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Sentuh salah satu kotak di bawah untuk mengambil nomor antrean
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {poliList.map((poli) => {
            const isSelected = selectedPoli?.id === poli.id;
            return (
              <button
                key={poli.id}
                onClick={() => handlePilihPoli(poli)}
                className={`rounded-2xl p-5 flex flex-col items-center gap-3 text-center border-2 transition-all active:scale-95 ${
                  isSelected
                    ? "bg-primary border-primary text-primary-foreground shadow-lg scale-105"
                    : "bg-card border-border hover:border-primary/50 hover:bg-accent"
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center ${
                    isSelected ? "bg-white/20" : "bg-primary/10"
                  }`}
                >
                  <Stethoscope
                    size={24}
                    className={isSelected ? "text-background" : "text-primary"}
                  />
                </div>
                <div>
                  <p
                    className={`text-lg font-bold leading-tight ${
                      isSelected ? "text-accent" : "text-foreground"
                    }`}
                  >
                    {poli.nama}
                  </p>
                </div>
                <p
                  className={`text-xs ${
                    isSelected ? "text-white/70" : "text-muted-foreground"
                  }`}
                >
                  Jumlah Antrean: {poli._count.antrian}
                </p>
              </button>
            );
          })}
        </div>
      </main>

      <div
        className={`fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-2xl transition-transform duration-300 ${
          selectedPoli ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="max-w-lg mx-auto p-5 flex items-center gap-4">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Poli dipilih:</p>
            <p className="font-bold text-foreground">{selectedPoli?.nama}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {selectedPoli?._count.antrian} antrean menunggu
            </p>
          </div>
          <button
            onClick={() => setSelectedPoli(null)}
            className="px-4 py-3 rounded-xl border border-border text-muted-foreground hover:bg-muted transition-all font-medium text-sm"
          >
            Batal
          </button>
          <button
            onClick={handleAmbilAntrian}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Ambil Antrean"}
          </button>
        </div>
      </div>

      {tiket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="bg-primary px-6 py-5 text-center">
              <p className="text-white/80 text-xs font-medium uppercase tracking-widest mb-1">
                {namaRS}
              </p>
              <p className="text-white/70 text-xs">Nomor Antrean Anda</p>
            </div>

            <div className="px-6 py-8 text-center" id="tiket-print">
              <p
                className="font-extrabold text-primary leading-none mb-4"
                style={{ fontSize: "72px" }}
              >
                {tiket.kodeAntrian}
              </p>
              <div className="w-16 h-1 bg-border rounded-full mx-auto mb-4" />
              <p className="font-semibold text-foreground text-lg mb-1">
                {tiket.namaPoli}
              </p>
              <p className="text-muted-foreground text-sm">
                {new Date(tiket.createdAt).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </p>
              <p className="text-xs text-muted-foreground mt-4">
                Harap menunggu hingga nomor Anda dipanggil
              </p>
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={handleCetak}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 active:scale-95 transition-all"
              >
                <Printer size={18} />
                Cetak Tiket
              </button>
              <button
                onClick={handleSelesai}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-foreground font-semibold hover:bg-muted active:scale-95 transition-all"
              >
                <X size={18} />
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          body > *:not(#tiket-print) {
            display: none !important;
          }
          #tiket-print {
            position: fixed;
            top: 0;
            left: 0;
            width: 80mm;
            padding: 10mm;
          }
        }
      `,
        }}
      />
    </div>
  );
}
