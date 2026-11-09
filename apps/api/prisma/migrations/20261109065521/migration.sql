/*
  Warnings:

  - You are about to alter the column `amount` on the `cloud_usage_monthly` table. The data in that column could be lost. The data in that column will be cast from `Decimal(14,2)` to `Integer`.
  - You are about to alter the column `monthly_amount` on the `contract_services` table. The data in that column could be lost. The data in that column will be cast from `Decimal(14,2)` to `Integer`.
  - You are about to alter the column `percentage` on the `service_discounts` table. The data in that column could be lost. The data in that column will be cast from `Decimal(5,2)` to `Integer`.

*/
-- AlterTable
ALTER TABLE "cloud_usage_monthly" ALTER COLUMN "amount" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "contract_services" ALTER COLUMN "monthly_amount" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "service_discounts" ALTER COLUMN "percentage" SET DATA TYPE INTEGER;
