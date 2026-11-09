-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('PENDING', 'COMPLETED');

-- DropIndex
DROP INDEX "onboarding_steps_customer_id_step_key";

-- AlterTable
ALTER TABLE "onboarding_steps" ADD COLUMN     "contract_id" UUID,
ADD COLUMN     "status" "OnboardingStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "onboarding_steps_contract_id_idx" ON "onboarding_steps"("contract_id");

-- CreateIndex
CREATE INDEX "onboarding_steps_status_idx" ON "onboarding_steps"("status");

-- CreateIndex
CREATE INDEX "onboarding_steps_customer_id_status_idx" ON "onboarding_steps"("customer_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "onboarding_steps_customer_id_contract_id_step_key" ON "onboarding_steps"("customer_id", "contract_id", "step");
