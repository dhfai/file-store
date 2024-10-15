/*
  Warnings:

  - Added the required column `tanggalDibuat` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "File" ADD COLUMN     "tanggalDibuat" TIMESTAMP(3) NOT NULL;
