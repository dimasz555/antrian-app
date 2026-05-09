-- CreateEnum
CREATE TYPE "StatusAntrian" AS ENUM ('MENUNGGU', 'DIPANGGIL', 'SELESAI', 'TERLEWAT');

-- CreateEnum
CREATE TYPE "RoleUser" AS ENUM ('ADMIN', 'PETUGAS_POLI');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "RoleUser" NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "poliId" INTEGER,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "poli" (
    "id" SERIAL NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "urutan" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "poli_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "antrian" (
    "id" SERIAL NOT NULL,
    "kodeAntrian" TEXT NOT NULL,
    "nomorUrut" INTEGER NOT NULL,
    "status" "StatusAntrian" NOT NULL DEFAULT 'MENUNGGU',
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jumlahPanggil" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dipanggilAt" TIMESTAMP(3),
    "selesaiAt" TIMESTAMP(3),
    "poliId" INTEGER NOT NULL,
    "dipanggilOlehId" TEXT,

    CONSTRAINT "antrian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "konfigurasi" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "konfigurasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log_aktivitas" (
    "id" SERIAL NOT NULL,
    "aksi" TEXT NOT NULL,
    "keterangan" TEXT,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "log_aktivitas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "poli_kode_key" ON "poli"("kode");

-- CreateIndex
CREATE INDEX "antrian_poliId_idx" ON "antrian"("poliId");

-- CreateIndex
CREATE INDEX "antrian_status_idx" ON "antrian"("status");

-- CreateIndex
CREATE INDEX "antrian_tanggal_idx" ON "antrian"("tanggal");

-- CreateIndex
CREATE UNIQUE INDEX "konfigurasi_key_key" ON "konfigurasi"("key");

-- CreateIndex
CREATE INDEX "log_aktivitas_userId_idx" ON "log_aktivitas"("userId");

-- CreateIndex
CREATE INDEX "log_aktivitas_createdAt_idx" ON "log_aktivitas"("createdAt");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_poliId_fkey" FOREIGN KEY ("poliId") REFERENCES "poli"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "antrian" ADD CONSTRAINT "antrian_poliId_fkey" FOREIGN KEY ("poliId") REFERENCES "poli"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "antrian" ADD CONSTRAINT "antrian_dipanggilOlehId_fkey" FOREIGN KEY ("dipanggilOlehId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
