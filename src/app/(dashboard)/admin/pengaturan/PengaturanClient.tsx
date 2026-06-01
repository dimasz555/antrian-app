"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  Loader2,
  Save,
  Building2,
  Clock,
  Video,
  Lock,
  Tv,
  ImageIcon,
  X,
  PlusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { upsertKonfigurasi } from "./actions";
import Image from "next/image";

type Props = {
  config: Record<string, string>;
};

export default function PengaturanClient({ config }: Props) {
  const [logoPreview, setLogoPreview] = useState<string>(config.LOGO_RS || "");
  const [logoLoading, setLogoLoading] = useState(false);
  const [pinError, setPinError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tickerItems, setTickerItems] = useState<string[]>(
    config.TICKER_TEXT
      ? config.TICKER_TEXT.split("•")
          .map((s) => s.trim())
          .filter(Boolean)
      : [""],
  );

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

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      toast.error("Ukuran logo maksimal 500KB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setLogoPreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSimpanLogo = async () => {
    if (!logoPreview) return;
    setLogoLoading(true);
    try {
      const result = await upsertKonfigurasi([
        { key: "LOGO_RS", value: logoPreview },
      ]);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success("Logo berhasil disimpan");
    } finally {
      setLogoLoading(false);
    }
  };

  const handleHapusLogo = async () => {
    setLogoLoading(true);
    try {
      const result = await upsertKonfigurasi([{ key: "LOGO_RS", value: "" }]);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      setLogoPreview("");
      toast.success("Logo berhasil dihapus");
    } finally {
      setLogoLoading(false);
    }
  };

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

  const handleSimpanPin = async () => {
    if (form.KIOSK_PIN.length !== 6) {
      setPinError("PIN harus terdiri dari 6 digit angka");
      return;
    }
    setPinError("");
    setLoading(true);
    try {
      const result = await upsertKonfigurasi([
        { key: "KIOSK_PIN", value: form.KIOSK_PIN },
      ]);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success("PIN berhasil disimpan");
    } finally {
      setLoading(false);
    }
  };

  const handleTickerChange = (index: number, value: string) => {
    setTickerItems((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleAddTicker = () => {
    setTickerItems((prev) => [...prev, ""]);
  };

  const handleRemoveTicker = (index: number) => {
    if (tickerItems.length === 1) return;
    setTickerItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSimpanTicker = async () => {
    const filtered = tickerItems.filter((t) => t.trim() !== "");
    if (filtered.length === 0) {
      toast.error("Minimal satu teks berjalan harus diisi");
      return;
    }
    setLoading(true);
    try {
      const value = filtered.join(" || ");
      const result = await upsertKonfigurasi([{ key: "TICKER_TEXT", value }]);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success("Teks berjalan berhasil disimpan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-8xl flex flex-col gap-6">
      <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <ImageIcon size={16} className="text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Logo Fasilitas</h3>
        </div>
        <Separator />

        <div className="flex items-center gap-6">
          <div className="shrink-0">
            {logoPreview ? (
              <div className="relative w-20 h-20">
                <Image
                  src={logoPreview}
                  alt="Logo RS"
                  width={80}
                  height={80}
                  unoptimized
                  className="w-20 h-20 rounded-xl object-contain border border-border bg-muted"
                />
                <button
                  onClick={handleHapusLogo}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:opacity-80 transition-opacity"
                >
                  <X size={11} />
                </button>
              </div>
            ) : (
              <div className="w-20 h-20 rounded-xl border-2 border-dashed border-border bg-muted flex items-center justify-center">
                <ImageIcon size={24} className="text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 flex-1">
            <p className="text-sm text-foreground font-medium">
              {logoPreview ? "Logo aktif" : "Belum ada logo"}
            </p>
            <p className="text-xs text-muted-foreground">
              Format: PNG, JPG, SVG. Maksimal 500KB. Akan ditampilkan di display
              TV, kiosk, dan sidebar.
            </p>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoChange}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                {logoPreview ? "Ganti Logo" : "Upload Logo"}
              </Button>
              {logoPreview && (
                <Button
                  size="sm"
                  onClick={handleSimpanLogo}
                  disabled={logoLoading}
                  className="gap-1.5"
                >
                  {logoLoading ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Save size={13} />
                  )}
                  Simpan
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

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
            placeholder="6 digit angka"
            maxLength={6}
            value={form.KIOSK_PIN}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              handleChange("KIOSK_PIN", val);
              if (val.length === 6) setPinError("");
            }}
            className={
              pinError
                ? "border-destructive focus-visible:ring-destructive"
                : ""
            }
          />
          {pinError ? (
            <p className="text-xs text-destructive">{pinError}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              PIN digunakan untuk mengakses kiosk pasien. Harus tepat 6 digit.
            </p>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-border">
          <Button
            onClick={handleSimpanPin}
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

      <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Tv size={16} className="text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Teks Berjalan</h3>
        </div>
        <Separator />

        <div className="flex flex-col gap-3">
          {tickerItems.map((item, index) => (
            <div key={index} className="flex gap-2 items-center">
              <Input
                placeholder={`Teks berjalan ${index + 1}`}
                value={item}
                onChange={(e) => handleTickerChange(index, e.target.value)}
                className="flex-1"
              />
              {tickerItems.length > 1 && (
                <button
                  onClick={() => handleRemoveTicker(index)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all shrink-0"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}

          <button
            onClick={handleAddTicker}
            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors w-fit"
          >
            <PlusCircle size={15} />
            Tambah Teks
          </button>
        </div>

        <div className="flex justify-end pt-2 border-t border-border">
          <Button
            onClick={handleSimpanTicker}
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
