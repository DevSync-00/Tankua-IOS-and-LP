-- ============================================
-- CREATE AUTH USER FOR bereket@tankua.et
-- This is a manual step that must be done in Supabase Dashboard
-- since we cannot create auth users via SQL (requires Admin API)
-- ============================================

-- This SQL file is for reference only.
-- Auth users must be created via Supabase Dashboard or Admin API.

-- ============================================
-- MANUAL STEPS TO CREATE AUTH USER:
-- ============================================

-- Option 1: Via Supabase Dashboard (Easiest)
-- 1. Go to: https://supabase.com/dashboard/project/dotjlikaurcjwabarqcy/auth/users
-- 2. Click "Add User" or "Invite User"
-- 3. Enter:
--    - Email: bereket@tankua.et
--    - Password: (set a temporary password, e.g., "TempPass123!")
--    - Auto Confirm User: ✓ (check this box)
-- 4. Click "Create User"
-- 5. Tell the provider to use "Forgot Password" to set their own password

-- Option 2: Via Supabase Admin API (if you have service role key)
-- POST https://dotjlikaurcjwabarqcy.supabase.co/auth/v1/admin/users
-- Headers:
--   Authorization: Bearer YOUR_SERVICE_ROLE_KEY
--   apikey: YOUR_SERVICE_ROLE_KEY
--   Content-Type: application/json
-- Body:
-- {
--   "email": "bereket@tankua.et",
--   "password": "TempPass123!",
--   "email_confirm": true
-- }

-- ============================================
-- VERIFY PROVIDER SETUP
-- ============================================
-- Run this to verify the provider is set up correctly:
SELECT 
  p.id as provider_id,
  p.name as provider_name,
  p.email as provider_email,
  p.status as provider_status,
  pu.id as provider_user_id,
  pu.email as provider_user_email,
  pu.role as provider_user_role,
  pu.is_active as provider_user_active
FROM providers p
LEFT JOIN provider_users pu ON pu.provider_id = p.id
WHERE p.email = 'bereket@tankua.et';

-- Expected result:
-- - provider_status should be 'active'
-- - provider_user_id should exist
-- - provider_user_email should be 'bereket@tankua.et'
-- - provider_user_role should be 'owner'
-- - provider_user_active should be true

-- ============================================
-- AFTER CREATING AUTH USER:
-- ============================================
-- 1. Provider should use "Forgot Password" to set their own password
-- 2. Or you can send them the temporary password
-- 3. They should then be able to log in successfully
