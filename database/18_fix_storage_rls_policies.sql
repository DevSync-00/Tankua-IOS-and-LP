-- ============================================
-- FIX STORAGE BUCKET RLS POLICIES
-- This fixes "new row violates row-level security policy" for storage uploads
-- Run this AFTER creating the provider-docs bucket
-- ============================================

-- ============================================
-- STORAGE POLICIES FOR provider-docs BUCKET
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anyone to upload to provider-docs" ON storage.objects;
DROP POLICY IF EXISTS "Allow admins to read provider-docs" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to provider-docs" ON storage.objects;

-- Policy 1: Allow ANYONE to upload files (for registration)
-- This allows unauthenticated users to upload during registration
CREATE POLICY "Allow anyone to upload to provider-docs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'provider-docs'
    AND (storage.foldername(name))[1] = 'applications'
  );

-- Policy 2: Allow admins to read/download files
CREATE POLICY "Allow admins to read provider-docs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'provider-docs'
    AND EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id::text = auth.uid()::text
    )
  );

-- Policy 3: Allow admins to delete files (for cleanup)
CREATE POLICY "Allow admins to delete provider-docs"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'provider-docs'
    AND EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id::text = auth.uid()::text
    )
  );

-- ============================================
-- VERIFICATION
-- ============================================
-- After running this script, verify the policies:
-- SELECT * FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects';
--
-- You should see 3 policies for the provider-docs bucket:
-- 1. Allow anyone to upload to provider-docs (INSERT)
-- 2. Allow admins to read provider-docs (SELECT)
-- 3. Allow admins to delete provider-docs (DELETE)

-- ============================================
-- COMPLETED
-- ============================================
-- Storage uploads during registration should now work.
-- The policy allows unauthenticated uploads to the applications/ folder,
-- which is exactly what we need for provider registration.

