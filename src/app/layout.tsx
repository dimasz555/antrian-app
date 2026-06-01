import type { Metadata } from "next";
import { Poppins } from "next/font/google";

import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { prisma } from "@/lib/prisma";

const Font = Poppins({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const config = await prisma.konfigurasi.findMany({
    where: { key: { in: ["NAMA_RS", "LOGO_RS"] } },
  });

  const namaRS =
    config.find((c) => c.key === "NAMA_RS")?.value ?? "Sistem Informasi Manajemen Antrean";
  const hasLogo = config.some((c) => c.key === "LOGO_RS" && c.value);

  return {
    title: namaRS,
    description: `Sistem Informasi Manajemen Antrean — ${namaRS}`,
    icons: hasLogo
      ? { icon: "/api/favicon" }
      : undefined,
  };
}
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${Font.variable} antialiased`}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
