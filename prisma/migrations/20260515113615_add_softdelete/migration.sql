/*
  Warnings:

  - A unique constraint covering the columns `[kode,deletedAt]` on the table `poli` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username,deletedAt]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "poli_kode_key";

-- DropIndex
DROP INDEX "user_username_key";

-- AlterTable
ALTER TABLE "poli" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "poli_kode_deletedAt_key" ON "poli"("kode", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_deletedAt_key" ON "user"("username", "deletedAt");
