import type { Metadata } from "next";
import AppFooter from "@/components/shared/AppFooter";

export const metadata: Metadata = {
  title: "Masuk — Sistem Informasi Manajemen Antrean",
  description: "Login petugas dan admin sistem antrian",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-background">
      {/* ── Layer 1: Orbs ── */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-20 w-150 h-150 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 -right-20 w-125 h-125 rounded-full bg-secondary/10 blur-[100px]" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-accent/10 blur-[100px]" />
      </div>
      {/* ── Layer 2: Wave SVG ── */}
      <div className="fixed inset-x-0 bottom-0 z-0 pointer-events-none">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 560"
          preserveAspectRatio="none"
          className="w-full h-140"
        >

          <path
            fill="#006565"
            fillOpacity="1"
            d="M0,280L60,265C120,250,240,220,360,215C480,210,600,230,720,245C840,260,960,270,1080,260C1200,250,1320,220,1380,205L1440,190L1440,560L1380,560C1320,560,1200,560,1080,560C960,560,840,560,720,560C600,560,480,560,360,560C240,560,120,560,60,560L0,560Z"
          />
        </svg>
      </div>
      {/* ── Main Content ── */}
      <main className="relative z-20 flex-1 flex items-center justify-center px-5 py-10 pb-24">
        {children}
      </main>

      <div className="relative z-20">
        <AppFooter />
      </div>
    </div>
  );
}
