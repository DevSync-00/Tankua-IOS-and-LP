-- ============================================
-- FIX ADMIN LOGIN RLS POLICY (V2 - More Reliable)
-- This fixes 403 Forbidden when querying admin_users by email
-- ============================================
--
-- PROBLEM: RLS policy blocks query even when email matches
-- SOLUTION: Use a SECURITY DEFINER function to check email match
-- ============================================

-- Step 1: Create a function to get authenticated user's email
-- This bypasses RLS and is safe to use in policies
CREATE OR REPLACE FUNCTION get_auth_user_email()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT email::text FROM auth.users WHERE id = auth.uid();
$$;

-- Step 2: Drop existing policies
DROP POLICY IF EXISTS "Admin users can view themselves" ON admin_users;
DROP POLICY IF EXISTS "Admins can query by email" ON admin_users;

-- Step 3: Create new policy that uses the function
-- This allows querying by email during login
CREATE POLICY "Admin users can view themselves"
  ON admin_users FOR SELECT
  USING (
    -- Allow if email matches authenticated user's email (for login)
    email = get_auth_user_email()
    -- OR if ID matches (for other queries)
    OR auth.uid()::text = id::text
    -- OR if user is super admin (to view others)
    OR is_super_admin(auth.uid()::text)
  );

-- ============================================
-- ALTERNATIVE: Simpler policy (if above doesn't work)
-- ============================================
-- If the function-based approach doesn't work, try this simpler version:

-- DROP POLICY IF EXISTS "Admin users can view themselves" ON admin_users;
-- 
-- CREATE POLICY "Admin users can view themselves"
--   ON admin_users FOR SELECT
--   USING (
--     -- Allow all authenticated users to read (less secure but works)
--     auth.uid() IS NOT NULL
--   );

-- ============================================
-- VERIFICATION
-- ============================================

-- Test the function
SELECT get_auth_user_email();

-- Check if you can query your admin entry
-- (Run this while logged in to Supabase Dashboard SQL Editor)
SELECT 
  id,
  email,
  name,
  role,
  is_active
FROM admin_users
WHERE email = 'berbir901@tankua.et';

-- Check all policies on admin_users
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'admin_users'
ORDER BY policyname;

-- ============================================
-- NUCLEAR OPTION: Temporarily disable RLS for testing
-- ============================================
-- ONLY use this to test if RLS is the problem!
-- Then re-enable and fix the policy properly.

-- ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;
-- 
-- -- Test your query
-- SELECT * FROM admin_users WHERE email = 'berbir901@tankua.et';
-- 
-- -- Re-enable RLS
-- ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
-- 
-- -- Then run the policy fix above

-- ============================================
-- CHECKLIST
-- ============================================
-- 1. ✅ Run the function creation (Step 1)
-- 2. ✅ Run the policy update (Step 3)
-- 3. ✅ Verify admin entry exists: SELECT * FROM admin_users WHERE email = 'berbir901@tankua.et';
-- 4. ✅ Verify auth user exists: SELECT email FROM auth.users WHERE email = 'berbir901@tankua.et';
-- 5. ✅ Try logging in again

