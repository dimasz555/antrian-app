"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Delete } from "lucide-react";
import { verifyKioskPin } from "./actions";

export default function KioskPinPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePress = (digit: string) => {
    if (pin.length >= 6) return;
    setError("");
    setPin((prev) => prev + digit);
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError("");
  };

  const handleSubmit = async () => {
    if (pin.length < 4) {
      setError("PIN minimal 4 digit");
      return;
    }

    setLoading(true);
    try {
      const result = await verifyKioskPin(pin);
      if (!result.success) {
        setError(result.message);
        setPin("");
        return;
      }
      router.push("/kiosk/pilih");
    } finally {
      setLoading(false);
    }
  };

  const DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary">Sistem Antrian</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Masukkan PIN untuk mengakses kiosk
          </p>
        </div>

        {/* PIN dots */}
        <div className="flex gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                i < pin.length
                  ? "bg-primary border-primary"
                  : "border-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="text-destructive text-sm font-medium">{error}</p>
        )}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {DIGITS.map((digit, i) => {
            if (digit === "") return <div key={i} />;

            if (digit === "del") {
              return (
                <button
                  key={i}
                  onClick={handleDelete}
                  className="h-16 rounded-2xl bg-muted flex items-center justify-center text-foreground hover:bg-muted/70 active:scale-95 transition-all"
                >
                  <Delete size={20} />
                </button>
              );
            }

            return (
              <button
                key={i}
                onClick={() => handlePress(digit)}
                className="h-16 rounded-2xl bg-card border border-border text-xl font-bold text-foreground hover:bg-accent active:scale-95 transition-all shadow-sm"
              >
                {digit}
              </button>
            );
          })}
        </div>

        {/* Tombol masuk */}
        <button
          onClick={handleSubmit}
          disabled={loading || pin.length < 4}
          className="w-full h-14 rounded-2xl bg-primary text-primary-foreground text-lg font-bold disabled:opacity-50 hover:opacity-90 active:scale-95 transition-all"
        >
          {loading ? "Memverifikasi..." : "Masuk"}
        </button>
      </div>
    </div>
  );
}
