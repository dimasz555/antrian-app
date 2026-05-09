/**
 * Type definitions untuk model Poli.
 *
 * Dipisahkan dari Prisma generated types supaya:
 * 1. Kita bisa kontrol field apa saja yang diterima dari request body
 * 2. Tidak expose semua field internal (createdAt, updatedAt, dll)
 * 3. Mudah di-reuse di frontend maupun backend
 */

// Body untuk membuat poli baru (POST)
export type CreatePoliInput = {
  kode: string; // Kode unik poli, contoh: "A", "B", "C"
  nama: string; // Nama poli, contoh: "Kluster 1 - Umum"
  urutan: number; // Urutan tampil di display
  aktif?: boolean; // Default: true
};

// Body untuk update poli (PUT) — semua field opsional
export type UpdatePoliInput = Partial<CreatePoliInput>;
