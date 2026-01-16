-- ============================================
-- FIND PROVIDERS MISSING AUTH USERS
-- This script helps identify approved providers
-- that have provider_user entries but no auth users
-- ============================================

-- Find active providers with provider_user entries
-- but check if they might be missing auth users
-- (Note: We can't directly query auth.users from SQL,
-- but we can identify providers that likely need auth users)

SELECT 
  p.id,
  p.name,
  p.email,
  p.status,
  pu.id as provider_user_id,
  pu.email as provider_user_email,
  pu.created_at as provider_user_created_at,
  CASE 
    WHEN p.status = 'active' AND pu.id IS NOT NULL THEN 'Has provider_user, check if auth user exists'
    WHEN p.status = 'active' AND pu.id IS NULL THEN 'Active but missing provider_user (trigger may have failed)'
    WHEN p.status = 'inactive' THEN 'Pending approval'
    ELSE 'Unknown status'
  END as status_note
FROM providers p
LEFT JOIN provider_users pu ON pu.provider_id = p.id OR pu.email = p.email
WHERE p.email IS NOT NULL AND p.email != ''
ORDER BY p.status, p.created_at DESC;

-- ============================================
-- INSTRUCTIONS FOR CREATING MISSING AUTH USERS
-- ============================================
-- If a provider is approved (status = 'active') and has a provider_user entry
-- but cannot log in, they likely need an auth user created.
--
-- To create auth users manually:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add User" or "Invite User"
-- 3. Enter the provider's email address
-- 4. Set a temporary password (provider will need to reset it)
-- 5. Check "Auto Confirm User" if email confirmation is enabled
-- 6. Click "Create User"
--
-- OR use the Supabase Admin API (requires service role key):
-- 
-- POST https://YOUR_PROJECT.supabase.co/auth/v1/admin/users
-- Headers:
--   Authorization: Bearer YOUR_SERVICE_ROLE_KEY
--   apikey: YOUR_SERVICE_ROLE_KEY
-- Body:
-- {
--   "email": "provider@example.com",
--   "password": "temporary_password",
--   "email_confirm": true
-- }
--
-- After creating the auth user, the provider can:
-- - Use "Forgot Password" to set their own password
-- - Or log in with the temporary password and change it
