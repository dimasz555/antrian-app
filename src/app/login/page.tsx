"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  const reason = searchParams.get("reason");
  if (reason === "expired") {
    toast.warning("Sesi anda telah berakhir, silakan login kembali");
  }

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();

      if (!json.success) {
        // Toast error jika login gagal
        toast.error(json.message);
        return;
      }

      toast.success("Login berhasil!");

      const { role } = json.data;
      if (role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/antrian");
      }
    } catch {
      toast.error("Gagal menghubungi server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            Sistem Antrian
          </CardTitle>
          <p className="text-muted-foreground text-sm mt-1">
            Masuk ke akun Anda
          </p>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Masukkan username"
              value={form.username}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, username: e.target.value }))
              }
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Masukkan password"
              value={form.password}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, password: e.target.value }))
              }
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>

          <Button
            className="w-full mt-2"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Memproses..." : "Masuk"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
