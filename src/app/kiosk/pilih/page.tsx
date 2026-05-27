import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getKioskData } from "../actions";
import KioskPilihClient from "./KioskPilihClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function KioskPilihPage() {
  // Cek session kiosk
  const cookieStore = await cookies();
  const session = cookieStore.get("kiosk_session")?.value;
  if (session !== "authenticated") redirect("/kiosk");

  const { poliList, config } = await getKioskData();

  return <KioskPilihClient poliList={poliList} config={config} />;
}
