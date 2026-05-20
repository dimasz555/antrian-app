"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Save, Building2, Clock, Video, Lock, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { upsertKonfigurasi } from "./actions";

type Props = {
  config: Record<string, string>;
};

export default function PengaturanClient({ config }: Props) {
  const [form, setForm] = useState({
    NAMA_RS: config.NAMA_RS ?? "",
    ALAMAT_RS: config.ALAMAT_RS ?? "",
    TELP_RS: config.TELP_RS ?? "",
    JAM_BUKA: config.JAM_BUKA ?? "07:00",
    JAM_TUTUP: config.JAM_TUTUP ?? "16:00",
    KIOSK_PIN: config.KIOSK_PIN ?? "",
    TICKER_TEXT: config.TICKER_TEXT ?? "",
    VIDEO_URL_1: config.VIDEO_URL_1 ?? "",
    VIDEO_URL_2: config.VIDEO_URL_2 ?? "",
    VIDEO_URL_3: config.VIDEO_URL_3 ?? "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSimpan = async (keys: (keyof typeof form)[]) => {
    setLoading(true);
    try {
      const items = keys.map((key) => ({ key, value: form[key] }));
      const result = await upsertKonfigurasi(items);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-8xl flex flex-col gap-6">
      {/* Section Informasi RS */}
      <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Building2 size={16} className="text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Informasi Fasilitas</h3>
        </div>
        <Separator />

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nama_rs">Nama Puskesmas / RS</Label>
          <Input
            id="nama_rs"
            placeholder="Contoh: Puskesmas Digital Pontianak"
            value={form.NAMA_RS}
            onChange={(e) => handleChange("NAMA_RS", e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="alamat_rs">Alamat</Label>
          <Input
            id="alamat_rs"
            placeholder="Contoh: Jl. Example No. 1"
            value={form.ALAMAT_RS}
            onChange={(e) => handleChange("ALAMAT_RS", e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="telp_rs">Nomor Telepon</Label>
          <Input
            id="telp_rs"
            placeholder="Contoh: 0561-123456"
            value={form.TELP_RS}
            onChange={(e) => handleChange("TELP_RS", e.target.value)}
          />
        </div>

        <div className="flex justify-end pt-2 border-t border-border">
          <Button
            onClick={() => handleSimpan(["NAMA_RS", "ALAMAT_RS", "TELP_RS"])}
            disabled={loading}
            className="gap-2"
          >
            {loading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Save size={15} />
            )}
            Simpan
          </Button>
        </div>
      </div>

      {/* Section Jam Operasional */}
      <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Jam Operasional</h3>
        </div>
        <Separator />

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="jam_buka">Jam Buka</Label>
            <Input
              id="jam_buka"
              type="time"
              value={form.JAM_BUKA}
              onChange={(e) => handleChange("JAM_BUKA", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="jam_tutup">Jam Tutup</Label>
            <Input
              id="jam_tutup"
              type="time"
              value={form.JAM_TUTUP}
              onChange={(e) => handleChange("JAM_TUTUP", e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-border">
          <Button
            onClick={() => handleSimpan(["JAM_BUKA", "JAM_TUTUP"])}
            disabled={loading}
            className="gap-2"
          >
            {loading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Save size={15} />
            )}
            Simpan
          </Button>
        </div>
      </div>

      {/* Section PIN Kiosk */}
      <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Lock size={16} className="text-muted-foreground" />
          <h3 className="font-semibold text-foreground">PIN Kiosk</h3>
        </div>
        <Separator />

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="kiosk_pin">PIN</Label>
          <Input
            id="kiosk_pin"
            type="password"
            placeholder="4-6 digit angka"
            maxLength={6}
            value={form.KIOSK_PIN}
            onChange={(e) =>
              handleChange("KIOSK_PIN", e.target.value.replace(/\D/g, ""))
            }
          />
          <p className="text-xs text-muted-foreground">
            PIN ini digunakan untuk mengakses halaman kiosk pasien.
          </p>
        </div>

        <div className="flex justify-end pt-2 border-t border-border">
          <Button
            onClick={() => handleSimpan(["KIOSK_PIN"])}
            disabled={loading}
            className="gap-2"
          >
            {loading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Save size={15} />
            )}
            Simpan PIN
          </Button>
        </div>
      </div>

      {/* Section Display TV */}
      <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Tv size={16} className="text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Display TV</h3>
        </div>
        <Separator />

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ticker">Teks Berjalan</Label>
          <Input
            id="ticker"
            placeholder="Harap menjaga ketenangan..."
            value={form.TICKER_TEXT}
            onChange={(e) => handleChange("TICKER_TEXT", e.target.value)}
          />
        </div>

        <div className="flex justify-end pt-2 border-t border-border">
          <Button
            onClick={() => handleSimpan(["TICKER_TEXT"])}
            disabled={loading}
            className="gap-2"
          >
            {loading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Save size={15} />
            )}
            Simpan
          </Button>
        </div>
      </div>

      {/* Section Video Edukasi */}
      <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Video size={16} className="text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Video Edukasi</h3>
        </div>
        <Separator />
        <p className="text-xs text-muted-foreground">
          Gunakan URL embed YouTube. Contoh: https://youtube.com/embed/xxxxx
        </p>

        {[1, 2, 3].map((num) => (
          <div key={num} className="flex flex-col gap-1.5">
            <Label htmlFor={`video_${num}`}>Video {num}</Label>
            <Input
              id={`video_${num}`}
              placeholder="https://youtube.com/embed/..."
              value={form[`VIDEO_URL_${num}` as keyof typeof form]}
              onChange={(e) =>
                handleChange(
                  `VIDEO_URL_${num}` as keyof typeof form,
                  e.target.value,
                )
              }
            />
          </div>
        ))}

        <div className="flex justify-end pt-2 border-t border-border">
          <Button
            onClick={() =>
              handleSimpan(["VIDEO_URL_1", "VIDEO_URL_2", "VIDEO_URL_3"])
            }
            disabled={loading}
            className="gap-2"
          >
            {loading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Save size={15} />
            )}
            Simpan
          </Button>
        </div>
      </div>
    </div>
  );
}
