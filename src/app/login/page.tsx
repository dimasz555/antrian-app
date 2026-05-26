"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, LogIn, UserCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SessionExpiredNotifier() {
  const searchParams = useSearchParams();
  if (searchParams.get("reason") === "expired") {
    setTimeout(() => {
      toast.warning("Sesi anda telah berakhir, silakan login kembali");
    }, 100);
  }
  return null;
}

type FormErrors = {
  username?: string;
  password?: string;
};

function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const clearError = (field: keyof FormErrors) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.username.trim()) newErrors.username = "Nama pengguna wajib diisi";
    if (!form.password.trim()) newErrors.password = "Kata sandi wajib diisi";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();

      if (!json.success) {
        if (res.status === 401) {
          setErrors({
            password: json.message ?? "Nama pengguna atau kata sandi salah",
          });
          return;
        }
        if (res.status === 403) {
          setErrors({ username: json.message });
          return;
        }
        toast.error(json.message ?? "Terjadi kesalahan, silakan coba lagi");
        return;
      }

      toast.success("Login berhasil!");

      const { role } = json.data;
      if (role === "ADMIN") {
        router.push("/admin/poli");
      } else {
        router.push("/petugas/antrian");
      }
    } catch {
      toast.error("Gagal menghubungi server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md flex flex-col items-center gap-8">
      <div className="text-center space-y-1 px-2">
        <h1 className="text-3xl md:text-4xl font-bold text-primary leading-tight tracking-tight">
          SISTEM INFORMASI
          <br />
          MANAJEMEN ANTREAN
        </h1>
      </div>

      <div
        className="w-full border border-border rounded-2xl overflow-hidden"
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(8px)",
          boxShadow: "0 4px 12px rgba(0, 101, 101, 0.08)",
        }}
      >
        <div className="p-7 md:p-9 space-y-6">
          <div className="space-y-1">
            <h2 className="text-center text-xl font-semibold text-foreground">
              Selamat Datang
            </h2>
            <p className="text-sm text-muted-foreground">
              Silahkan masuk dengan menggunakan nama pengguna dan kata sandi.
            </p>
          </div>

          <div className="space-y-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="username" className="text-sm font-medium">
                Nama Pengguna
              </Label>
              <div className="relative">
                <UserCircle
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
                <Input
                  id="username"
                  name="username"
                  placeholder="Masukkan nama pengguna"
                  autoComplete="username"
                  value={form.username}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, username: e.target.value }));
                    clearError("username");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className={`pl-10 ${errors.username ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
              </div>
              {errors.username && (
                <p className="text-xs text-destructive">{errors.username}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password" className="text-sm font-medium">
                Kata Sandi
              </Label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, password: e.target.value }));
                    clearError("password");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className={`pl-10 pr-11 ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={
                    showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer group w-fit">
              <input
                type="checkbox"
                name="remember"
                className="w-4 h-4 rounded border-border text-primary accent-primary focus:ring-primary/50 transition-all"
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors select-none">
                Tetap masuk
              </span>
            </label>

            {/* Submit */}
            <Button
              className="w-full mt-1 gap-2"
              size="lg"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  Masuk
                  <LogIn size={17} />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <Suspense fallback={null}>
        <SessionExpiredNotifier />
      </Suspense>
      <LoginForm />
    </>
  );
}
