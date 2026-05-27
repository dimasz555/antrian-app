"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Stethoscope,
  Users,
  Settings,
  LogOut,
  ClipboardList,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AppLogo from "../common/AppLogo";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const ADMIN_NAV: NavItem[] = [
  // {
  //   label: "Dashboard",
  //   href: "/admin/dashboard",
  //   icon: <LayoutDashboard size={20} />,
  // },
  {
    label: "Kelola Poli",
    href: "/admin/poli",
    icon: <Stethoscope size={20} />,
  },
  {
    label: "Manajemen Petugas",
    href: "/admin/petugas",
    icon: <Users size={20} />,
  },

  {
    label: "Profil Saya",
    href: "/admin/profil",
    icon: <UserCircle size={20} />,
  },
  {
    label: "Pengaturan",
    href: "/admin/pengaturan",
    icon: <Settings size={20} />,
  },
];

const PETUGAS_NAV: NavItem[] = [
  {
    label: "Antrean Poli",
    href: "/petugas/antrian",
    icon: <ClipboardList size={20} />,
  },
  {
    label: "Profil Saya",
    href: "/petugas/profil",
    icon: <UserCircle size={20} />,
  },
];

type Props = {
  role: "ADMIN" | "PETUGAS_POLI";
  namaUser: string;
  namaRS: string;
  logoRS?: string;
};

export default function AppSidebar({ role, namaUser, namaRS, logoRS }: Props) {
  const pathname = usePathname();
  const navItems = role === "ADMIN" ? ADMIN_NAV : PETUGAS_NAV;

  const router = useRouter();
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
    router.push("/login");
  };

  return (
    <aside className="hidden md:flex flex-col h-screen w-64 bg-muted/40 border-r border-border fixed left-0 top-0 z-50">
      <div className="px-6 py-6 border-b border-border flex items-center gap-2">
        <AppLogo logoBase64={logoRS} size={36} />
        <div>
          <h1 className="text-sm font-bold text-primary leading-tight">
            {namaRS}
          </h1>
        </div>
      </div>

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
      </nav>

      <div className="border-t border-border px-3 py-3">
        <button
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 hover:text-destructive transition-all"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          Keluar
        </button>
      </div>
    </aside>
  );
}
