-- Migration: Add dynamic QR code support
-- Issue: #139
-- Created: 2026-04-16
--
-- Adds columns to support static vs dynamic QR codes and payment tracking.
-- Static QRs: qr_type='static', short_code=NULL (QR points directly to original_url)
-- Dynamic QRs: qr_type='dynamic', short_code='abc123' (QR points to theqrspot.com/:short_code)

-- 1. Add qr_type column to distinguish static vs dynamic QR codes
-- Default to 'static' for existing QR codes (backwards compatible)
ALTER TABLE public.qr_codes
ADD COLUMN IF NOT EXISTS qr_type TEXT NOT NULL DEFAULT 'static';

-- Add check constraint for qr_type values
-- Use DO block to handle case where constraint already exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'qr_codes_qr_type_check'
  ) THEN
    ALTER TABLE public.qr_codes
    ADD CONSTRAINT qr_codes_qr_type_check CHECK (qr_type IN ('static', 'dynamic'));
  END IF;
END $$;

-- 2. Allow short_code to be NULL for static QRs
-- Note: short_code already exists with UNIQUE constraint
-- We need to allow NULL values while keeping unique constraint on non-NULL values
ALTER TABLE public.qr_codes
ALTER COLUMN short_code DROP NOT NULL;

-- 3. Add payment tracking columns
-- is_paid: Whether user has paid for dynamic QR editing capability
ALTER TABLE public.qr_codes
ADD COLUMN IF NOT EXISTS is_paid BOOLEAN NOT NULL DEFAULT false;

-- stripe_payment_id: Reference to Stripe payment for audit trail
ALTER TABLE public.qr_codes
ADD COLUMN IF NOT EXISTS stripe_payment_id TEXT;

-- 4. Add edit tracking columns
-- edit_count: Track how many times destination_url has been changed
ALTER TABLE public.qr_codes
ADD COLUMN IF NOT EXISTS edit_count INTEGER NOT NULL DEFAULT 0;

-- Note: last_edited_at already exists in the schema from SUPABASE_SETUP.md
-- If it doesn't exist, uncomment the following:
-- ALTER TABLE public.qr_codes
-- ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMPTZ;

-- 5. Create index for fast short_code lookups (if not already exists)
-- The redirect endpoint needs to look up QR codes by short_code quickly
CREATE INDEX IF NOT EXISTS idx_qr_codes_short_code ON public.qr_codes(short_code);

-- 6. Add index for payment lookups (useful for admin queries)
CREATE INDEX IF NOT EXISTS idx_qr_codes_stripe_payment_id ON public.qr_codes(stripe_payment_id);

-- 7. Add index for qr_type queries (filtering by type)
CREATE INDEX IF NOT EXISTS idx_qr_codes_qr_type ON public.qr_codes(qr_type);

-- COMMENT: Update RLS policies if needed
-- The existing policy "Users can update their own QR codes" should still work
-- since we're just adding new columns. Application logic will enforce:
-- - Dynamic QRs can only be edited if is_paid = true
-- - Static QRs cannot have their destination changed (they don't have short_code)
