// Global singleton untuk menyimpan koneksi SSE
// Menggunakan globalThis agar shared antara server actions dan route handlers

type SSEClients = Map<string, Set<ReadableStreamDefaultController>>;

const globalForSSE = globalThis as unknown as {
  __sseClients?: SSEClients;
};

export const sseClients: SSEClients =
  globalForSSE.__sseClients ?? (globalForSSE.__sseClients = new Map());

// Helper: kirim event ke semua client yang subscribe poli tertentu
export function broadcastToPoliId(poliId: string, data: unknown) {
  const message = `data: ${JSON.stringify(data)}\n\n`;

  // 1. Kirim ke client yang subscribe poliId tersebut
  const poliClients = sseClients.get(poliId);
  if (poliClients) {
    for (const controller of poliClients) {
      try {
        controller.enqueue(new TextEncoder().encode(message));
      } catch {
        poliClients.delete(controller);
      }
    }
  }

  // 2. Kirim ke client "all"
  if (poliId !== "all") {
    const allClients = sseClients.get("all");
    if (allClients) {
      for (const controller of allClients) {
        try {
          controller.enqueue(new TextEncoder().encode(message));
        } catch {
          allClients.delete(controller);
        }
      }
    }
  }
}

// Helper: broadcast ke SEMUA poli (untuk kiosk & display)
export function broadcastToAll(data: unknown) {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  for (const [, poliClients] of sseClients) {
    for (const controller of poliClients) {
      try {
        controller.enqueue(new TextEncoder().encode(message));
      } catch {
        poliClients.delete(controller);
      }
    }
  }
}
