-- DropIndex
DROP INDEX "cloud_accounts_customer_id_idx";

-- DropIndex
DROP INDEX "cloud_usage_monthly_cloud_account_id_billing_month_idx";

-- AlterTable
ALTER TABLE "cloud_accounts" ADD COLUMN     "aws_credentials_secret_arn" TEXT,
ADD COLUMN     "aws_secrets_region" TEXT;

-- AlterTable
ALTER TABLE "contacts" ALTER COLUMN "role" DROP NOT NULL;

-- AlterTable
ALTER TABLE "customers" ALTER COLUMN "status" SET DEFAULT 'INACTIVE';
