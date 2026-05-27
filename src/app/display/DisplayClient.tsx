"use client";

import { useRouter } from "next/navigation";
import { useSSE } from "@/hooks/useSSE";
import { useCallback, useEffect, useRef, useState } from "react";
import LiveClock from "@/components/common/LiveClock";
import { Volume2 } from "lucide-react";
import AppLogo from "@/components/common/AppLogo";

type PoliDisplay = {
  id: number;
  kode: string;
  nama: string;
  sedangDipanggil: string | null;
  berikutnya: string | null;
  totalMenunggu: number;
};

type Props = {
  poliData: PoliDisplay[];
  config: Record<string, string>;
};

type PanggilanAktif = {
  kodeAntrian: string;
  namaPoli: string;
};

// Menyimpan referensi aktif secara global agar tidak terhapus oleh Garbage Collector browser
let activeUtterances: SpeechSynthesisUtterance[] = [];

function speakAntrian(kodeAntrian: string, namaPoli: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve();
      return;
    }

    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.error("Failed to cancel speech synthesis:", e);
    }
    activeUtterances = [];

    const kode = kodeAntrian.replace("-", " ");
    const utterance = new SpeechSynthesisUtterance(
      `Nomor antrean ${kode}, silakan menuju ruangan ${namaPoli}`,
    );

    // Simpan referensi ke array global untuk mencegah Garbage Collection
    activeUtterances.push(utterance);

    utterance.lang = "id-ID";
    utterance.rate = 0.85;
    utterance.volume = 1;

    let isResolved = false;
    const finish = () => {
      if (isResolved) return;
      isResolved = true;
      activeUtterances = activeUtterances.filter((u) => u !== utterance);
      resolve();
    };

    utterance.onend = finish;
    utterance.onerror = (e) => {
      console.warn("SpeechSynthesisUtterance error:", e);
      finish();
    };

    // Safety timeout: jika tidak ada respon, paksa selesaikan antrian agar tidak macet
    setTimeout(finish, 10000);

    window.speechSynthesis.speak(utterance);
  });
}

// Komponen 1 Card Poli
function PoliCard({
  poli,
  size = "normal",
}: {
  poli: PoliDisplay;
  size?: "normal" | "large";
}) {
  const isActive = poli.sedangDipanggil !== null;
  const isLarge = size === "large";

  return (
    <div
      style={{
        background: isActive ? "#f0fafa" : "white",
        border: isActive ? "2px solid #006565" : "1.5px solid #bdc9c8",
        borderLeft: isActive ? "5px solid #006565" : "1.5px solid #bdc9c8",
        borderRadius: "14px",
        padding: isLarge ? "14px 16px" : "10px 14px",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        height: "100%",
        boxSizing: "border-box",
        transition: "all 0.3s",
        boxShadow: isActive ? "0 4px 16px rgba(0,101,101,0.12)" : "none",
      }}
    >
      {/* Nama poli */}
      <p
        style={{
          fontSize: isLarge ? "12px" : "12px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          color: isActive ? "#006565" : "#3e4949",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {poli.nama}
      </p>

      {/* Nomor antrian */}
      <p
        style={{
          fontWeight: 900,
          fontSize: isLarge
            ? "clamp(40px, 4.5vw, 58px)"
            : "clamp(28px, 3vw, 42px)",
          lineHeight: 1,
          color: isActive ? "#006565" : "#bdc9c8",
          letterSpacing: "-1px",
          flex: 1,
          display: "flex",
          alignItems: "center",
        }}
      >
        {poli.sedangDipanggil ?? "–"}
      </p>

      {/* Info bawah */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <p style={{ fontSize: "9px", color: "#8a9999" }}>
          Antrian Menunggu: {poli.totalMenunggu}
        </p>
      </div>
    </div>
  );
}

export default function DisplayClient({
  poliData: initialPoliData,
  config,
}: Props) {
  const router = useRouter();
  const [poliData, setPoliData] = useState(initialPoliData);

  // Audio unlock
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const audioUnlockedRef = useRef(false);

  const unlockAudio = () => {
    // Set status aktif secara sinkron
    setAudioUnlocked(true);
    audioUnlockedRef.current = true;

    if (typeof window !== "undefined" && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance("");
        window.speechSynthesis.speak(u);
      } catch (e) {
        console.warn("SpeechSynthesis unlock error:", e);
      }
    }

    // Inisialisasi AudioContext untuk unlock browser audio policy
    try {
      const AudioContextClass =
        window.AudioContext ||
        (
          window as unknown as {
            webkitAudioContext?: typeof AudioContext;
          }
        ).webkitAudioContext;

      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        ctx.resume();
      }
    } catch (e) {
      console.warn("Failed to initialize AudioContext:", e);
    }

    // Jalankan antrian jika ada panggilan yang sempat tertunda sebelum tombol diklik
    setTimeout(() => {
      if (processQueueRef.current) {
        processQueueRef.current();
      }
    }, 100);
  };

  // Queue
  const queueRef = useRef<PanggilanAktif[]>([]);
  const isPlayingRef = useRef(false);
  const processQueueRef = useRef<() => void>(null!);

  useEffect(() => {
    processQueueRef.current = async () => {
      if (isPlayingRef.current || queueRef.current.length === 0) return;
      if (!audioUnlockedRef.current) return;

      isPlayingRef.current = true;
      const item = queueRef.current.shift()!;

      await speakAntrian(item.kodeAntrian, item.namaPoli);
      await new Promise((r) => setTimeout(r, 3000));

      isPlayingRef.current = false;

      if (queueRef.current.length > 0) {
        processQueueRef.current();
      }
    };
  });

  const enqueueAntrian = useCallback(
    (kodeAntrian: string, namaPoli: string) => {
      queueRef.current.push({ kodeAntrian, namaPoli });
      if (audioUnlockedRef.current) {
        processQueueRef.current();
      }
    },
    [],
  );

  // Fetch data
  const fetchPoliData = useCallback(async () => {
    try {
      const res = await fetch("/display/api", { cache: "no-store" });
      if (!res.ok) return;
      const data: PoliDisplay[] = await res.json();
      setPoliData(data);
    } catch {}
  }, []);

  // SSE
  useSSE({
    poliId: "all",
    onMessage: (event) => {
      if (event.type === "antrian_dipanggil") {
        fetchPoliData().then(() => {
          const poliNama = event.namaPoli as string | undefined;
          if (event.kodeAntrian) {
            const poli = poliData.find((p) => p.id === event.poliId);
            const namaPoli = poliNama || poli?.nama || "poli";
            enqueueAntrian(event.kodeAntrian as string, namaPoli);
          }
        });
        return;
      }

      if (
        event.type === "antrian_baru" ||
        event.type === "antrian_update" ||
        event.type === "antrian_selesai" ||
        event.type === "antrian_terlewat"
      ) {
        fetchPoliData();
      }
    },
  });

  const logoRS = config.LOGO_RS ?? "";
  const namaRS = config.NAMA_RS ?? "Sistem Antrian";
  const tickerText =
    config.TICKER_TEXT ?? "Harap menjaga ketenangan di area tunggu.";
  const videoUrl = config.VIDEO_URL_1 ?? "";

  const POLI_KIRI = 3;
  const poliKiri = poliData.slice(0, POLI_KIRI);
  const poliBawah = poliData.slice(POLI_KIRI);

  const tickerContent = `${tickerText}     •     ${tickerText}     •     ${tickerText}`;

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: "#eef6f6",
        fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
      }}
    >
      {/* ── HEADER ── */}
      <header
        style={{
          background: "#006565",
          padding: "0 24px",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <AppLogo logoBase64={logoRS} size={32} />
          <div>
            <p style={{ color: "white", fontWeight: 700, fontSize: "15px" }}>
              {namaRS}
            </p>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "10px" }}>
              Layar Antrean Utama
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {/* Tombol aktifkan suara */}
          {!audioUnlocked && (
            <button
              onClick={unlockAudio}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "999px",
                padding: "5px 14px",
                color: "white",
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
                animation: "blink 1.5s infinite",
              }}
            >
              <Volume2 size={14} />
              Aktifkan Suara
            </button>
          )}
          {audioUnlocked && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "999px",
                padding: "5px 14px",
              }}
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "#7ef5f5",
                  animation: "blink 1.5s infinite",
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  color: "rgba(255,255,255,0.8)",
                  fontSize: "11px",
                  fontWeight: 600,
                }}
              >
                Suara Aktif
              </span>
            </div>
          )}
          <LiveClock variant="kiosk" />
        </div>
      </header>

      <main
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "420px 1fr",
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        <div
          style={{
            background: "#e2f0f0",
            display: "flex",
            flexDirection: "column",
            padding: "10px",
            gap: "8px",
            borderRight: "1px solid #bdc9c8",
            overflow: "hidden",
            minHeight: 0,
          }}
        >
          {poliKiri.map((poli) => (
            <div key={poli.id} style={{ flex: 1, minHeight: 0 }}>
              <PoliCard poli={poli} size="large" />
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            background: "#111",
            overflow: "hidden",
            minHeight: 0,
          }}
        >
          <div style={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
            {videoUrl ? (
              <iframe
                src={videoUrl}
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  display: "block",
                }}
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(255,255,255,0.3)",
                  gap: "10px",
                }}
              >
                <svg
                  width="40"
                  height="40"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
                <p style={{ fontSize: "12px" }}>
                  Belum ada video dikonfigurasi
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── BARIS BAWAH — Sisa poli ── */}
      {poliBawah.length > 0 && (
        <div
          style={{
            background: "#e2f0f0",
            borderTop: "1px solid #bdc9c8",
            display: "grid",
            gridTemplateColumns: `repeat(${poliBawah.length}, 1fr)`,
            gap: "8px",
            padding: "8px 10px",
            flexShrink: 0,
            height: `${Math.max(100, Math.min(130, 600 / poliBawah.length))}px`,
          }}
        >
          {poliBawah.map((poli) => (
            <PoliCard key={poli.id} poli={poli} size="normal" />
          ))}
        </div>
      )}

      {/* ── TICKER ── */}
      <div
        style={{
          background: "#f5a623",
          height: "38px",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            background: "#e6951a",
            height: "100%",
            padding: "0 14px",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            flexShrink: 0,
            borderRight: "2px solid rgba(0,0,0,0.1)",
          }}
        >
          <svg
            width="12"
            height="12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="black"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
            />
          </svg>
          <span
            style={{
              color: "#000",
              fontSize: "10px",
              fontWeight: 800,
              letterSpacing: "1px",
              whiteSpace: "nowrap",
            }}
          >
            INFO LAYANAN
          </span>
        </div>
        <div style={{ flex: 1, overflow: "hidden", padding: "0 10px" }}>
          <span
            style={{
              color: "#000",
              fontSize: "13px",
              fontWeight: 700,
              whiteSpace: "nowrap",
              display: "inline-block",
              animation: "marquee 30s linear infinite",
            }}
          >
            {tickerContent}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes marquee {
          0%   { transform: translateX(60vw); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}
