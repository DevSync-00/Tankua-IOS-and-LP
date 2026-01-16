-- ============================================
-- FIX TRIPS RLS POLICIES FOR PROVIDER ACCESS
-- Allow providers to create and manage their own trips
-- ============================================

-- Drop existing trips policies
DROP POLICY IF EXISTS "Anyone can read trips" ON trips;
DROP POLICY IF EXISTS "Admins can manage trips" ON trips;

-- Everyone can read trips (public access)
CREATE POLICY "Anyone can read trips"
  ON trips FOR SELECT
  USING (true);

-- Providers can insert trips for their own provider_id
CREATE POLICY "Providers can create trips"
  ON trips FOR INSERT
  WITH CHECK (
    provider_id = get_user_provider_id(auth.uid()::text)
    OR is_admin_user(auth.uid()::text)
  );

-- Providers can update their own trips
CREATE POLICY "Providers can update own trips"
  ON trips FOR UPDATE
  USING (
    provider_id = get_user_provider_id(auth.uid()::text)
    OR is_admin_user(auth.uid()::text)
  )
  WITH CHECK (
    provider_id = get_user_provider_id(auth.uid()::text)
    OR is_admin_user(auth.uid()::text)
  );

-- Providers can delete their own trips
CREATE POLICY "Providers can delete own trips"
  ON trips FOR DELETE
  USING (
    provider_id = get_user_provider_id(auth.uid()::text)
    OR is_admin_user(auth.uid()::text)
  );

-- ============================================
-- COMPLETED
-- ============================================
-- Providers can now create, update, and delete trips
-- where provider_id matches their provider
-- Admins can manage all trips
