-- ============================================
-- ADD PROVIDER BOOKINGS RLS POLICY
-- Allow providers to read bookings for their provider
-- ============================================

-- Add policy for providers to read bookings where provider_id matches
CREATE POLICY "Providers can read own provider bookings"
  ON bookings FOR SELECT
  USING (
    provider_id = get_user_provider_id(auth.uid()::text)
    OR is_admin_user(auth.uid()::text)
  );

-- ============================================
-- COMPLETED
-- ============================================
-- Providers can now read bookings where provider_id matches their provider
-- This allows the bookings page to display bookings for the provider
