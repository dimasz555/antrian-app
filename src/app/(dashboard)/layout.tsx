import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/jwt";
import AppSidebar from "@/components/shared/AppSidebar";
import AppHeader from "@/components/shared/AppHeader";
import AppFooter from "@/components/shared/AppFooter";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ambil token dari cookie
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) redirect("/login");

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    redirect("/login?reason=expired");
  }

  // Fetch Data
  const [user, logoConfig, namaConfig] = await Promise.all([
    prisma.user.findUnique({
      where: { id: payload.id },
      select: { nama: true },
    }),
    prisma.konfigurasi.findUnique({
      where: { key: "LOGO_RS" },
      select: { value: true },
    }),
    prisma.konfigurasi.findUnique({
      where: { key: "NAMA_RS" },
      select: { value: true },
    }),
  ]);

  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar
        role={payload.role as "ADMIN" | "PETUGAS_POLI"}
        namaUser={user.nama}
        namaRS={namaConfig?.value ?? "Sistem Informasi Manajemen Antrean"}
        logoRS={logoConfig?.value ?? ""}
      />

      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <AppHeader title="Dashboard" namaUser={user.nama} />

        <main className="flex-1 p-5 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>

        <AppFooter />
      </div>
    </div>
  );
}
