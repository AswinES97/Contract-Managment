/*
  Warnings:

  - You are about to alter the column `monthly_price` on the `service_types` table. The data in that column could be lost. The data in that column will be cast from `Decimal(14,2)` to `Integer`.

*/
-- AlterTable
ALTER TABLE "service_types" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "monthly_price" SET DEFAULT 0,
ALTER COLUMN "monthly_price" SET DATA TYPE INTEGER;
