"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Loader2,
  Eye,
  EyeOff,
  KeyRound,
  Info,
  Save,
  UserPen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfil, updatePassword } from "./actions";

type Props = {
  user: {
    nama: string;
    username: string;
    role: string;
  };
};

type ProfilErrors = { nama?: string; username?: string };
type PasswordErrors = {
  passwordLama?: string;
  passwordBaru?: string;
  konfirmasiPassword?: string;
};

export default function ProfilClient({ user }: Props) {
  // State profil
  const [profilForm, setProfilForm] = useState({
    nama: user.nama,
    username: user.username,
  });
  const [profilErrors, setProfilErrors] = useState<ProfilErrors>({});
  const [profilLoading, setProfilLoading] = useState(false);

  // State password
  const [passwordForm, setPasswordForm] = useState({
    passwordLama: "",
    passwordBaru: "",
    konfirmasiPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({});
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showLama, setShowLama] = useState(false);
  const [showBaru, setShowBaru] = useState(false);
  const [showKonfirmasi, setShowKonfirmasi] = useState(false);

  // Handler profil
  const handleUpdateProfil = async () => {
    const errors: ProfilErrors = {};
    if (!profilForm.nama.trim()) errors.nama = "Nama wajib diisi";
    if (!profilForm.username.trim()) errors.username = "Username wajib diisi";
    else if (profilForm.username.includes(" "))
      errors.username = "Username tidak boleh mengandung spasi";

    if (Object.keys(errors).length > 0) {
      setProfilErrors(errors);
      return;
    }

    setProfilErrors({});
    setProfilLoading(true);
    try {
      const result = await updateProfil(profilForm.nama, profilForm.username);
      if (!result.success) {
        if (result.field) setProfilErrors({ [result.field]: result.message });
        else toast.error(result.message);
        return;
      }
      toast.success(result.message);
    } finally {
      setProfilLoading(false);
    }
  };

  // Handler password
  const handleUpdatePassword = async () => {
    const errors: PasswordErrors = {};
    if (!passwordForm.passwordLama)
      errors.passwordLama = "Password lama wajib diisi";
    if (!passwordForm.passwordBaru)
      errors.passwordBaru = "Password baru wajib diisi";
    if (!passwordForm.konfirmasiPassword)
      errors.konfirmasiPassword = "Konfirmasi password wajib diisi";

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setPasswordErrors({});
    setPasswordLoading(true);
    try {
      const result = await updatePassword(
        passwordForm.passwordLama,
        passwordForm.passwordBaru,
        passwordForm.konfirmasiPassword,
      );

      if (!result.success) {
        if (result.field) setPasswordErrors({ [result.field]: result.message });
        else toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setPasswordForm({
        passwordLama: "",
        passwordBaru: "",
        konfirmasiPassword: "",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const clearPasswordError = (field: keyof PasswordErrors) => {
    setPasswordErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <div className="max-w-8xl flex flex-col gap-6">
      <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <UserPen size={20} className="text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Ubah Profil</h2>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-start mb-6">
          <div className="relative group shrink-0">
            <div className="w-28 h-28 rounded-full bg-primary/10 border-4 border-muted flex items-center justify-center">
              <span className="text-4xl font-bold text-primary">
                {user.nama.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          <div className="flex-1 w-full grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nama" className="font-semibold">
                Nama Lengkap
              </Label>
              <Input
                id="nama"
                value={profilForm.nama}
                onChange={(e) => {
                  setProfilForm((prev) => ({
                    ...prev,
                    nama: e.target.value,
                  }));
                  setProfilErrors((prev) => ({ ...prev, nama: undefined }));
                }}
                className={`h-10 ${
                  profilErrors.nama
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }`}
              />
              {profilErrors.nama && (
                <p className="text-xs text-destructive">{profilErrors.nama}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="username" className="font-semibold">
                Username
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                  @
                </span>
                <Input
                  id="username"
                  value={profilForm.username}
                  onChange={(e) => {
                    setProfilForm((prev) => ({
                      ...prev,
                      username: e.target.value.toLowerCase(),
                    }));
                    setProfilErrors((prev) => ({
                      ...prev,
                      username: undefined,
                    }));
                  }}
                  className={`h-10 pl-8 ${
                    profilErrors.username
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }`}
                />
              </div>
              {profilErrors.username ? (
                <p className="text-xs text-destructive">
                  {profilErrors.username}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Huruf kecil, tanpa spasi.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <Button
            onClick={handleUpdateProfil}
            disabled={profilLoading}
            size="lg"
            className="gap-2"
          >
            {profilLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Simpan Perubahan
          </Button>
        </div>
      </section>

      <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
            <KeyRound size={20} className="text-secondary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            Ganti Kata Sandi
          </h2>
        </div>

        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="passwordLama" className="font-semibold">
              Kata Sandi Saat Ini
            </Label>
            <div className="relative">
              <Input
                id="passwordLama"
                type={showLama ? "text" : "password"}
                placeholder="••••••••"
                value={passwordForm.passwordLama}
                onChange={(e) => {
                  setPasswordForm((prev) => ({
                    ...prev,
                    passwordLama: e.target.value,
                  }));
                  clearPasswordError("passwordLama");
                }}
                className={`h-10 pr-10 ${passwordErrors.passwordLama ? "border-destructive focus-visible:ring-destructive" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowLama((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showLama ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {passwordErrors.passwordLama && (
              <p className="text-xs text-destructive">
                {passwordErrors.passwordLama}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="passwordBaru" className="font-semibold">
                Kata Sandi Baru
              </Label>
              <div className="relative">
                <Input
                  id="passwordBaru"
                  type={showBaru ? "text" : "password"}
                  placeholder="Minimal 6 karakter"
                  value={passwordForm.passwordBaru}
                  onChange={(e) => {
                    setPasswordForm((prev) => ({
                      ...prev,
                      passwordBaru: e.target.value,
                    }));
                    clearPasswordError("passwordBaru");
                  }}
                  className={`h-10 pr-10 ${passwordErrors.passwordBaru ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowBaru((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showBaru ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passwordErrors.passwordBaru && (
                <p className="text-xs text-destructive">
                  {passwordErrors.passwordBaru}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="konfirmasiPassword" className="font-semibold">
                Konfirmasi Kata Sandi Baru
              </Label>
              <div className="relative">
                <Input
                  id="konfirmasiPassword"
                  type={showKonfirmasi ? "text" : "password"}
                  placeholder="Ulangi kata sandi baru"
                  value={passwordForm.konfirmasiPassword}
                  onChange={(e) => {
                    setPasswordForm((prev) => ({
                      ...prev,
                      konfirmasiPassword: e.target.value,
                    }));
                    clearPasswordError("konfirmasiPassword");
                  }}
                  className={`h-10 pr-10 ${passwordErrors.konfirmasiPassword ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowKonfirmasi((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showKonfirmasi ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passwordErrors.konfirmasiPassword && (
                <p className="text-xs text-destructive">
                  {passwordErrors.konfirmasiPassword}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg mb-6">
          <div className="flex gap-3 items-start">
            <Info size={16} className="text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Gunakan kombinasi huruf besar, huruf kecil, angka, dan simbol
              untuk keamanan yang lebih baik.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <Button
            onClick={handleUpdatePassword}
            disabled={passwordLoading}
            size="lg"
            className="gap-2"
          >
            {passwordLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <KeyRound size={16} />
            )}
            Perbarui Kata Sandi
          </Button>
        </div>
      </section>
    </div>
  );
}
