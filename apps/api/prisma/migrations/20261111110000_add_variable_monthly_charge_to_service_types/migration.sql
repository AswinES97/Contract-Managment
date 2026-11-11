-- AlterTable: add is_variable column to service_types
ALTER TABLE "service_types" ADD COLUMN IF NOT EXISTS "is_variable" BOOLEAN NOT NULL DEFAULT false;
