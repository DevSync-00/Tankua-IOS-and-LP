-- ============================================
-- FIX MISSING ADMIN ENTRY
-- Use this script if you get "Access denied. Admin account required."
-- ============================================
-- 
-- This error means:
-- ✅ Your user exists in Supabase Auth (you can login)
-- ❌ But your email is missing from admin_users table
--
-- ⚠️ IMPORTANT: If you get "new row violates row-level security policy",
-- use database/22_fix_first_admin_insert.sql instead!
-- ============================================

-- Step 1: Check if your email exists in admin_users
-- Replace 'your-email@tankua.et' with YOUR actual email
SELECT email, name, role, is_active 
FROM admin_users 
WHERE email = 'your-email@tankua.et';

-- Step 2: If the query above returns nothing, add yourself as admin
-- Replace the values below with YOUR information:
INSERT INTO admin_users (email, name, role, phone, is_active)
VALUES (
  'your-email@tankua.et',  -- ⚠️ REPLACE: Your email (must match Auth email exactly)
  'Your Full Name',          -- ⚠️ REPLACE: Your name
  'super_admin',             -- Start with super_admin for full access
  '+251900000000',           -- ⚠️ REPLACE: Your phone (optional, can be NULL)
  true                        -- Must be true to login
)
ON CONFLICT (email) DO UPDATE
SET 
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  phone = EXCLUDED.phone,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Step 3: Verify it was added
SELECT email, name, role, is_active, created_at 
FROM admin_users 
WHERE email = 'your-email@tankua.et';

-- ============================================
-- QUICK FIX FOR COMMON EMAIL
-- ============================================
-- If you're using admin@tankua.et, run this:

INSERT INTO admin_users (email, name, role, phone, is_active)
VALUES (
  'admin@tankua.et',
  'Tankua Admin',
  'super_admin',
  '+251900000000',
  true
)
ON CONFLICT (email) DO UPDATE
SET 
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  phone = EXCLUDED.phone,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- ============================================
-- TROUBLESHOOTING
-- ============================================

-- Check all admin users
SELECT id, email, name, role, is_active, created_at 
FROM admin_users 
ORDER BY created_at DESC;

-- If your user is deactivated, activate it:
UPDATE admin_users 
SET is_active = true, updated_at = NOW()
WHERE email = 'your-email@tankua.et';

-- Check if email matches exactly (case-sensitive)
-- Make sure the email in admin_users matches EXACTLY with Auth email
SELECT 
  email,
  LOWER(email) as lower_email,
  name,
  role,
  is_active
FROM admin_users
WHERE LOWER(email) = LOWER('your-email@tankua.et');

