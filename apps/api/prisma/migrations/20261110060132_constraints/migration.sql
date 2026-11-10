-- Create extension for exclusion constraints with scalar types
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Exclusion constraint preventing overlapping scheduled/attended appointments for the same therapist
ALTER TABLE appointments ADD CONSTRAINT no_therapist_overlap
  EXCLUDE USING gist (therapist_id WITH =, tsrange(starts_at, ends_at) WITH &&)
  WHERE (status IN ('SCHEDULED', 'ATTENDED'));

-- Check constraints for positive amounts on payments and invoices
ALTER TABLE payments ADD CONSTRAINT check_payment_amount_positive CHECK (amount > 0);
ALTER TABLE invoices ADD CONSTRAINT check_invoice_amount_positive CHECK (amount > 0);
