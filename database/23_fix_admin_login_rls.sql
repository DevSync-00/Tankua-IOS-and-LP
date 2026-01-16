-- ============================================
-- FIX ADMIN LOGIN RLS POLICY
-- This fixes "Access denied" even when admin entry exists
-- ============================================
--
-- PROBLEM: The RLS policy checks auth.uid() = admin_users.id,
-- but admin_users.id is NOT the same as auth.users.id!
-- The login code queries by EMAIL, not by ID.
--
-- SOLUTION: Add a policy that allows querying by email
-- ============================================

-- Step 1: Add a policy to allow admins to query by their email
-- This allows the login code to find the admin user by email
CREATE POLICY "Admins can query by email"
  ON admin_users FOR SELECT
  USING (
    -- Allow if email matches authenticated user's email
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    -- OR if user is already a super admin (for viewing others)
    OR is_super_admin(auth.uid()::text)
  );

-- Step 2: Verify the policy was created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'admin_users'
ORDER BY policyname;

-- ============================================
-- ALTERNATIVE: If above doesn't work, temporarily disable RLS for SELECT
-- ============================================
-- Only use this if the policy above doesn't work!

-- Option A: Allow all authenticated users to read admin_users (less secure)
-- DROP POLICY IF EXISTS "Admins can query by email" ON admin_users;
-- CREATE POLICY "Allow authenticated users to read admin_users"
--   ON admin_users FOR SELECT
--   USING (auth.uid() IS NOT NULL);

-- Option B: Completely disable RLS for SELECT (NOT RECOMMENDED for production)
-- ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;
-- -- Then re-enable after fixing:
-- ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
-- -- And recreate proper policies

-- ============================================
-- VERIFICATION
-- ============================================

-- Check if your admin exists (run this as authenticated user)
SELECT 
  id,
  email,
  name,
  role,
  is_active,
  created_at
FROM admin_users
WHERE email = 'your-email@tankua.et';  -- Replace with your email

-- Check what auth.uid() returns
SELECT 
  auth.uid() as auth_user_id,
  auth.users.email as auth_email,
  admin_users.id as admin_id,
  admin_users.email as admin_email
FROM auth.users
LEFT JOIN admin_users ON auth.users.email = admin_users.email
WHERE auth.users.email = 'your-email@tankua.et';  -- Replace with your email

-- ============================================
-- COMPLETE FIX: Update existing policy to include email check
-- ============================================

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Admin users can view themselves" ON admin_users;
DROP POLICY IF EXISTS "Admins can query by email" ON admin_users;

-- Create a new policy that allows querying by email OR by ID
-- This is the KEY FIX - allows login code to query by email
CREATE POLICY "Admin users can view themselves"
  ON admin_users FOR SELECT
  USING (
    -- Allow if email matches authenticated user's email (for login)
    -- This is what the login code needs!
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    -- OR if ID matches (for other queries)
    OR auth.uid()::text = id::text
    -- OR if user is super admin (to view others)
    OR is_super_admin(auth.uid()::text)
  );

-- ============================================
-- FINAL CHECKLIST
-- ============================================
-- 1. ✅ Admin entry exists in admin_users table
-- 2. ✅ Email in admin_users matches email in auth.users EXACTLY
-- 3. ✅ is_active = true in admin_users
-- 4. ✅ RLS policy allows querying by email
-- 5. ✅ User exists in auth.users with confirmed email
--
-- Run these to verify:
--
-- SELECT email, name, role, is_active FROM admin_users WHERE email = 'your-email@tankua.et';
-- SELECT email, email_confirmed_at FROM auth.users WHERE email = 'your-email@tankua.et';

