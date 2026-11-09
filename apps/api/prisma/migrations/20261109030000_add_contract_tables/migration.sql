-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('DRAFT', 'ACTIVE', 'EXPIRED', 'TERMINATED');

-- CreateTable
CREATE TABLE "contracts" (
    "id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "scope_description" TEXT,
    "start_date" DATE,
    "end_date" DATE,
    "status" "ContractStatus" NOT NULL DEFAULT 'DRAFT',
    "billing_frequency" TEXT,
    "billing_timing" TEXT,
    "onboarding_completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_services" (
    "id" UUID NOT NULL,
    "contract_id" UUID NOT NULL,
    "service_type_id" UUID NOT NULL,
    "monthly_amount" DECIMAL(14,2),
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contract_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_discounts" (
    "id" UUID NOT NULL,
    "contract_service_id" UUID NOT NULL,
    "percentage" DECIMAL(5,2) NOT NULL,
    "effective_from" DATE NOT NULL,
    "effective_to" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_discounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contracts_customer_id_idx" ON "contracts"("customer_id");

-- CreateIndex
CREATE INDEX "contracts_status_idx" ON "contracts"("status");

-- CreateIndex
CREATE INDEX "contracts_start_date_end_date_idx" ON "contracts"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "contracts_customer_id_status_idx" ON "contracts"("customer_id", "status");

-- CreateIndex
CREATE INDEX "contract_services_contract_id_idx" ON "contract_services"("contract_id");

-- CreateIndex
CREATE INDEX "contract_services_service_type_id_idx" ON "contract_services"("service_type_id");

-- CreateIndex
CREATE INDEX "contract_services_contract_id_start_date_end_date_idx" ON "contract_services"("contract_id", "start_date", "end_date");

-- CreateIndex
CREATE INDEX "service_discounts_contract_service_id_idx" ON "service_discounts"("contract_service_id");

-- CreateIndex
CREATE INDEX "service_discounts_contract_service_id_effective_from_effect_idx" ON "service_discounts"("contract_service_id", "effective_from", "effective_to");

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_services" ADD CONSTRAINT "contract_services_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_services" ADD CONSTRAINT "contract_services_service_type_id_fkey" FOREIGN KEY ("service_type_id") REFERENCES "service_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_discounts" ADD CONSTRAINT "service_discounts_contract_service_id_fkey" FOREIGN KEY ("contract_service_id") REFERENCES "contract_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboarding_steps" ADD CONSTRAINT "onboarding_steps_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
