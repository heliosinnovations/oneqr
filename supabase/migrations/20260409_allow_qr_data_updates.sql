-- Migration: Allow users to update qr_data for their own QR codes (regardless of is_editable)
-- The API route /api/qr/[id] uses admin client to bypass RLS, but this policy
-- documents the intended behavior.

-- Note: This migration is optional if using the API route approach.
-- If you want to allow direct client-side updates to qr_data, run this migration.

-- Drop the restrictive policy that requires is_editable = TRUE
DROP POLICY IF EXISTS "Users can update their own editable QR codes" ON public.qr_codes;

-- Create new policy that allows users to update their own QR codes
-- Application-level check enforces that only is_editable QR codes can change destination_url
CREATE POLICY "Users can update their own QR codes"
  ON public.qr_codes FOR UPDATE
  USING (auth.uid() = user_id);

-- Note: The application code in /api/qr/[id]/route.ts enforces:
-- - qr_data updates are always allowed for owned QR codes
-- - destination_url updates only allowed if is_editable = true
