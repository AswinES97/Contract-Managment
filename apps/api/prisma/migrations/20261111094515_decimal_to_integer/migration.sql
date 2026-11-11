/*
  Warnings:

  - You are about to alter the column `quantity` on the `bill_line_items` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,4)` to `Integer`.
  - You are about to alter the column `unit_amount` on the `bill_line_items` table. The data in that column could be lost. The data in that column will be cast from `Decimal(14,2)` to `Integer`.
  - You are about to alter the column `discount_percentage` on the `bill_line_items` table. The data in that column could be lost. The data in that column will be cast from `Decimal(5,2)` to `Integer`.
  - You are about to alter the column `final_amount` on the `bill_line_items` table. The data in that column could be lost. The data in that column will be cast from `Decimal(14,2)` to `Integer`.
  - You are about to alter the column `fixed_amount` on the `bills` table. The data in that column could be lost. The data in that column will be cast from `Decimal(14,2)` to `Integer`.
  - You are about to alter the column `cloud_usage_amount` on the `bills` table. The data in that column could be lost. The data in that column will be cast from `Decimal(14,2)` to `Integer`.
  - You are about to alter the column `cloud_discount_amount` on the `bills` table. The data in that column could be lost. The data in that column will be cast from `Decimal(14,2)` to `Integer`.
  - You are about to alter the column `total_amount` on the `bills` table. The data in that column could be lost. The data in that column will be cast from `Decimal(14,2)` to `Integer`.

*/
-- AlterTable
ALTER TABLE "bill_line_items" ALTER COLUMN "quantity" SET DEFAULT 1,
ALTER COLUMN "quantity" SET DATA TYPE INTEGER,
ALTER COLUMN "unit_amount" SET DATA TYPE INTEGER,
ALTER COLUMN "discount_percentage" SET DEFAULT 0,
ALTER COLUMN "discount_percentage" SET DATA TYPE INTEGER,
ALTER COLUMN "final_amount" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "bills" ALTER COLUMN "fixed_amount" SET DEFAULT 0,
ALTER COLUMN "fixed_amount" SET DATA TYPE INTEGER,
ALTER COLUMN "cloud_usage_amount" SET DEFAULT 0,
ALTER COLUMN "cloud_usage_amount" SET DATA TYPE INTEGER,
ALTER COLUMN "cloud_discount_amount" SET DEFAULT 0,
ALTER COLUMN "cloud_discount_amount" SET DATA TYPE INTEGER,
ALTER COLUMN "total_amount" SET DATA TYPE INTEGER;
