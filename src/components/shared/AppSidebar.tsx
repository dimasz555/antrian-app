"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Stethoscope,
  Users,
  BarChart2,
  Settings,
  LogOut,
  PlusCircle,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Tipe navigasi ──────────────────────────────────────
type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

// ── Nav per role ───────────────────────────────────────
const ADMIN_NAV: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: <LayoutDashboard size={20} />,
  },
  {
    label: "Kelola Poli",
    href: "/admin/poli",
    icon: <Stethoscope size={20} />,
  },
  { label: "Manajemen Petugas", href: "/admin/petugas", icon: <Users size={20} /> },
  { label: "Laporan", href: "/admin/laporan", icon: <BarChart2 size={20} /> },
];

const PETUGAS_NAV: NavItem[] = [
  {
    label: "Antrian Saya",
    href: "/poli/antrian",
    icon: <ClipboardList size={20} />,
  },
];

type Props = {
  role: "ADMIN" | "PETUGAS_POLI";
  namaUser: string;
};

export default function AppSidebar({ role, namaUser }: Props) {
  const pathname = usePathname();
  const navItems = role === "ADMIN" ? ADMIN_NAV : PETUGAS_NAV;

  return (
    <aside className="hidden md:flex flex-col h-screen w-64 bg-muted/40 border-r border-border fixed left-0 top-0 z-50">
      <div className="px-6 py-6 border-b border-border">
        <h1 className="text-lg font-bold text-primary leading-tight">
          Puskesmas Digital
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Sistem Informasi Antrian
        </p>
      </div>

      {/* Nav items */}
      <nav className="flex-1 flex flex-col gap-1 px-3 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-primary/10 text-primary font-semibold translate-x-0.5"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}

        {/* Tombol aksi utama */}
        {role === "PETUGAS_POLI" && (
          <div className="mt-4 px-1">
            <button className="w-full bg-primary text-primary-foreground py-2.5 px-4 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-sm">
              <PlusCircle size={18} />
              Panggil Antrian
            </button>
          </div>
        )}
      </nav>

      {/* Bottom nav */}
      <div className="border-t border-border px-3 py-3 flex flex-col gap-1">
        {/* Info user */}
        <div className="flex items-center gap-3 px-4 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
            {namaUser.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {namaUser}
            </p>
            <p className="text-xs text-muted-foreground">
              {role === "ADMIN" ? "Administrator" : "Petugas Poli"}
            </p>
          </div>
        </div>

        <Link
          href="/settings"
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all"
        >
          <Settings size={18} />
          Pengaturan
        </Link>
        <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all">
          <LogOut size={18} />
          Keluar
        </button>
      </div>
    </aside>
  );
}
