-- Contact.role is required by the customer rules (name, role, email, phone).
-- Existing rows are backfilled so the column can be NOT NULL.
ALTER TABLE "contacts" ADD COLUMN "role" TEXT;
UPDATE "contacts" SET "role" = '' WHERE "role" IS NULL;
ALTER TABLE "contacts" ALTER COLUMN "role" SET NOT NULL;

-- New customers are active unless the caller sets a status.
ALTER TABLE "customers" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
