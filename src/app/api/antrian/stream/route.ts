import { NextRequest } from "next/server";
import { sseClients } from "@/lib/sse-clients";

// Re-export broadcast helpers agar import lama tetap bisa digunakan
export { broadcastToPoliId, broadcastToAll } from "@/lib/sse-clients";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  // poliId = "all" untuk kiosk dan display, angka untuk petugas poli tertentu
  const poliId = searchParams.get("poliId") ?? "all";

  const stream = new ReadableStream({
    start(controller) {
      // Daftarkan client
      if (!sseClients.has(poliId)) {
        sseClients.set(poliId, new Set());
      }
      sseClients.get(poliId)!.add(controller);

      // Kirim ping pertama agar koneksi terbuka
      controller.enqueue(
        new TextEncoder().encode(
          `data: ${JSON.stringify({ type: "connected" })}\n\n`,
        ),
      );

      // Hapus client saat disconnect
      request.signal.addEventListener("abort", () => {
        sseClients.get(poliId)?.delete(controller);
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
