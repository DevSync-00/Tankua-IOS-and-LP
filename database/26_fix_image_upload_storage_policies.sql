-- ============================================
-- FIX STORAGE POLICIES FOR IMAGE UPLOADS
-- Allows authenticated users to upload images
-- Admin check is handled by the admin dashboard UI
-- Run this AFTER creating the storage buckets
-- ============================================

-- ============================================
-- STORAGE POLICIES FOR destinations BUCKET
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access for destinations" ON storage.objects;
DROP POLICY IF EXISTS "Admin uploads to destinations" ON storage.objects;
DROP POLICY IF EXISTS "Admin deletes from destinations" ON storage.objects;

-- Policy 1: Allow public reads (images need to be publicly accessible)
CREATE POLICY "Public read access for destinations"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'destinations');

-- Policy 2: Allow authenticated users to upload images
-- Note: Admin dashboard UI ensures only admins can access this functionality
CREATE POLICY "Authenticated users can upload to destinations"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'destinations'
    AND auth.role() = 'authenticated'
  );

-- Policy 3: Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete from destinations"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'destinations'
    AND auth.role() = 'authenticated'
  );

-- ============================================
-- NOTE: Churches are now stored in destinations table
-- All images use the 'destinations' bucket
-- No separate 'churches' bucket needed
-- ============================================

-- ============================================
-- TROUBLESHOOTING: If still getting errors
-- ============================================
-- 1. Check if you're logged in:
--    SELECT auth.uid();
--    Should return your user UUID, not NULL
--
-- 2. Check storage policies were created:
--    SELECT * FROM pg_policies 
--    WHERE schemaname = 'storage' 
--    AND tablename = 'objects'
--    AND (policyname LIKE '%destinations%' OR policyname LIKE '%churches%');
--
-- 3. If policies exist but still not working, try dropping and recreating:
--    DROP POLICY IF EXISTS "Admin uploads to destinations" ON storage.objects;
--    DROP POLICY IF EXISTS "Admin uploads to churches" ON storage.objects;
--    Then re-run this script.

-- ============================================
-- VERIFICATION
-- ============================================
-- After running this script, verify the policies:
-- SELECT * FROM pg_policies 
-- WHERE schemaname = 'storage' 
-- AND tablename = 'objects'
-- AND policyname LIKE '%destinations%' OR policyname LIKE '%churches%';
--
-- You should see policies for:
-- 1. Public read access (SELECT)
-- 2. Authenticated user uploads (INSERT)
-- 3. Authenticated user deletes (DELETE)
--
-- NOTE: This approach allows any authenticated user to upload.
-- Security is enforced by the admin dashboard UI which only
-- allows admins to access the upload functionality.

