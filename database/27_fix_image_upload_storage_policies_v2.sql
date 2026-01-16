-- ============================================
-- FIX STORAGE POLICIES FOR IMAGE UPLOADS (V2)
-- Alternative approach: Allow authenticated users to upload
-- Then restrict via application logic
-- ============================================

-- ============================================
-- DROP OLD POLICIES
-- ============================================
DROP POLICY IF EXISTS "Public read access for destinations" ON storage.objects;
DROP POLICY IF EXISTS "Admin uploads to destinations" ON storage.objects;
DROP POLICY IF EXISTS "Admin deletes from destinations" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for churches" ON storage.objects;
DROP POLICY IF EXISTS "Admin uploads to churches" ON storage.objects;
DROP POLICY IF EXISTS "Admin deletes from churches" ON storage.objects;

-- ============================================
-- SIMPLER APPROACH: Allow authenticated users
-- The admin dashboard will handle authorization
-- ============================================

-- Policy 1: Allow public reads (images need to be publicly accessible)
CREATE POLICY "Public read access for destinations"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'destinations');

-- Policy 2: Allow authenticated users to upload (admin check done in app)
CREATE POLICY "Authenticated users can upload to destinations"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'destinations'
    AND auth.role() = 'authenticated'
  );

-- Policy 3: Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete from destinations"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'destinations'
    AND auth.role() = 'authenticated'
  );

-- ============================================
-- CHURCHES BUCKET POLICIES
-- ============================================

-- Policy 1: Allow public reads
CREATE POLICY "Public read access for churches"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'churches');

-- Policy 2: Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload to churches"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'churches'
    AND auth.role() = 'authenticated'
  );

-- Policy 3: Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete from churches"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'churches'
    AND auth.role() = 'authenticated'
  );

-- ============================================
-- NOTE: This approach relies on the admin dashboard
-- to ensure only admins can access the upload functionality.
-- The RLS policies allow any authenticated user, but the
-- admin dashboard UI is only accessible to admins.
-- ============================================



