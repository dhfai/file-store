/*
  Warnings:

  - Added the required column `jenisSurat` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nomorSurat` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "File" ADD COLUMN     "jenisSurat" TEXT NOT NULL,
ADD COLUMN     "nomorSurat" TEXT NOT NULL;
