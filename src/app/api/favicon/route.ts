import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const config = await prisma.konfigurasi.findUnique({
    where: { key: "LOGO_RS" },
    select: { value: true },
  });

  const logoBase64 = config?.value;

  // Jika tidak ada logo, return 404
  if (!logoBase64) {
    return new NextResponse(null, { status: 404 });
  }

  // Pisahkan header data URI: "data:image/png;base64,xxxx"
  const matches = logoBase64.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) {
    return new NextResponse(null, { status: 400 });
  }

  const mimeType = matches[1]; // contoh: "image/png"
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, "base64");

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": mimeType,
      // Cache selama 1 jam
      "Cache-Control": "public, max-age=3600",
    },
  });
}
