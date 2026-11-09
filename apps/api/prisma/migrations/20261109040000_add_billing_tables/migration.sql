-- CreateEnum
CREATE TYPE "InvoiceState" AS ENUM ('PENDING', 'RAISED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "BillLineSourceType" AS ENUM ('FIXED_SERVICE', 'CLOUD_USAGE');

-- CreateTable
CREATE TABLE "bills" (
    "id" UUID NOT NULL,
    "contract_id" UUID NOT NULL,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "billing_month" TEXT NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'AED',
    "fixed_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "cloud_usage_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "cloud_discount_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(14,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bill_line_items" (
    "id" UUID NOT NULL,
    "bill_id" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "source_type" "BillLineSourceType" NOT NULL,
    "quantity" DECIMAL(12,4) NOT NULL DEFAULT 1,
    "unit_amount" DECIMAL(14,2) NOT NULL,
    "discount_percentage" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "final_amount" DECIMAL(14,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bill_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_status" (
    "id" UUID NOT NULL,
    "bill_id" UUID NOT NULL,
    "status" "InvoiceState" NOT NULL DEFAULT 'PENDING',
    "invoice_number" TEXT,
    "invoice_date" DATE,
    "checked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_status_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bills_contract_id_idx" ON "bills"("contract_id");

-- CreateIndex
CREATE INDEX "bills_period_start_period_end_idx" ON "bills"("period_start", "period_end");

-- CreateIndex
CREATE UNIQUE INDEX "bills_contract_id_period_start_period_end_key" ON "bills"("contract_id", "period_start", "period_end");

-- CreateIndex
CREATE INDEX "bill_line_items_bill_id_idx" ON "bill_line_items"("bill_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_status_bill_id_key" ON "invoice_status"("bill_id");

-- CreateIndex
CREATE INDEX "invoice_status_status_idx" ON "invoice_status"("status");

-- CreateIndex
CREATE INDEX "invoice_status_checked_at_idx" ON "invoice_status"("checked_at");

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bill_line_items" ADD CONSTRAINT "bill_line_items_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "bills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_status" ADD CONSTRAINT "invoice_status_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "bills"("id") ON DELETE CASCADE ON UPDATE CASCADE;
