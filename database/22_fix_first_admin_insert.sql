-- ============================================
-- FIX FIRST ADMIN INSERT (RLS Bypass)
-- Use this to add your FIRST admin when RLS blocks you
-- ============================================
--
-- PROBLEM: RLS policy requires super_admin to insert into admin_users,
-- but you can't be super_admin if you don't exist in the table!
-- This is a chicken-and-egg problem.
--
-- SOLUTION: Temporarily allow unauthenticated inserts OR use service role
-- ============================================

-- OPTION 1: Temporarily disable RLS (RECOMMENDED FOR FIRST ADMIN)
-- Run this in Supabase SQL Editor (which has elevated privileges)

-- Step 1: Temporarily disable RLS
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Step 2: Insert your first admin (REPLACE WITH YOUR EMAIL!)
INSERT INTO admin_users (email, name, role, phone, is_active)
VALUES (
  'your-email@tankua.et',  -- ⚠️ REPLACE: Your email (must match Auth email)
  'Your Full Name',          -- ⚠️ REPLACE: Your name
  'super_admin',             -- Start with super_admin
  '+251900000000',           -- ⚠️ REPLACE: Your phone (optional, can be NULL)
  true
)
ON CONFLICT (email) DO UPDATE
SET 
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  phone = EXCLUDED.phone,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Step 3: Re-enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Step 4: Verify it worked
SELECT email, name, role, is_active, created_at 
FROM admin_users 
WHERE email = 'your-email@tankua.et';

-- ============================================
-- OPTION 2: Add policy to allow first admin insert
-- ============================================
-- If Option 1 doesn't work, use this:

-- Allow insert if table is empty (for first admin only)
CREATE POLICY "Allow first admin insert"
  ON admin_users FOR INSERT
  WITH CHECK (
    (SELECT COUNT(*) FROM admin_users) = 0
  );

-- Then insert your admin
INSERT INTO admin_users (email, name, role, phone, is_active)
VALUES (
  'your-email@tankua.et',  -- ⚠️ REPLACE: Your email
  'Your Full Name',          -- ⚠️ REPLACE: Your name
  'super_admin',
  '+251900000000',           -- Optional
  true
)
ON CONFLICT (email) DO UPDATE
SET 
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Remove the temporary policy after first admin is created
DROP POLICY IF EXISTS "Allow first admin insert" ON admin_users;

-- ============================================
-- OPTION 3: Use Supabase Dashboard Table Editor
-- ============================================
-- The Table Editor in Supabase Dashboard runs with elevated privileges
-- and can bypass RLS. This is the EASIEST method:
--
-- 1. Go to Supabase Dashboard → Table Editor
-- 2. Click on `admin_users` table
-- 3. Click "Insert" → "Insert Row"
-- 4. Fill in the fields manually
-- 5. Click "Save"
--
-- This bypasses RLS automatically!

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if your admin exists
SELECT 
  id,
  email,
  name,
  role,
  is_active,
  created_at
FROM admin_users
WHERE email = 'your-email@tankua.et';  -- Replace with your email

-- List all admins
SELECT 
  email,
  name,
  role,
  is_active,
  created_at
FROM admin_users
ORDER BY created_at DESC;

-- Check RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'admin_users';

-- ============================================
-- TROUBLESHOOTING
-- ============================================

-- If you get "new row violates row-level security policy":
-- 1. Use Option 1 (disable RLS temporarily)
-- 2. OR use Supabase Dashboard Table Editor (Option 3)
-- 3. OR make sure you're running SQL as service role

-- If admin exists but still can't login:
-- 1. Check is_active = true
-- 2. Verify email matches Auth email EXACTLY (case-sensitive)
-- 3. Check if user exists in auth.users:
SELECT email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'your-email@tankua.et';

