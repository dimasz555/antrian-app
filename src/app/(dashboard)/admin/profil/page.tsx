import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/common/PageHeader";
import ProfilClient from "@/app/(dashboard)/_shared/profil/ProfilClient";

export default async function AdminProfilPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) redirect("/login");

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    redirect("/login?reason=expired");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { nama: true, username: true, role: true },
  });

  if (!user) redirect("/login");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Profil Saya"
        description="Kelola informasi akun dan keamanan Anda."
      />
      <ProfilClient user={user} />
    </div>
  );
}
