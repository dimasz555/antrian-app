import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/jwt";
import AppSidebar from "@/components/shared/AppSidebar";
import AppHeader from "@/components/shared/AppHeader";
import AppFooter from "@/components/shared/AppFooter";

type Props = {
  children: React.ReactNode;
  params?: { title?: string };
};

export default async function DashboardLayout({ children }: Props) {
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

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <AppSidebar
        role={payload.role as "ADMIN" | "PETUGAS_POLI"}
        namaUser={payload.username}
      />

      {/* Main area */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <AppHeader title="Dashboard" namaUser={payload.username} />

        <main className="flex-1 p-5 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>

        <AppFooter />
      </div>
    </div>
  );
}
