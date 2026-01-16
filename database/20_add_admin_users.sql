-- ============================================
-- ADD ADMIN USERS
-- Use this script to add admin accounts to the system
-- ============================================

-- ============================================
-- IMPORTANT: SETUP STEPS
-- ============================================
-- Before adding an admin user, you need to:
-- 1. Create the user in Supabase Auth (Authentication → Users → Add User)
-- 2. Use the same email address in both Auth and admin_users table
-- 3. The user will login with their Auth credentials
-- 4. The admin_users table entry grants them admin dashboard access
--
-- ============================================
-- ADMIN ROLES
-- ============================================
-- super_admin: Full access to everything (can manage other admins)
-- admin: Full access except managing other admins
-- support: Access to support tickets and user management
-- finance: Access to payments, payouts, and financial reports
--
-- ============================================
-- ADD ADMIN USERS
-- ============================================

-- Example 1: Add a super admin
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

-- Example 2: Add a regular admin
INSERT INTO admin_users (email, name, role, phone, is_active)
VALUES (
  'manager@tankua.et',
  'Admin Manager',
  'admin',
  '+251911111111',
  true
)
ON CONFLICT (email) DO UPDATE
SET 
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  phone = EXCLUDED.phone,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Example 3: Add a support staff
INSERT INTO admin_users (email, name, role, phone, is_active)
VALUES (
  'support@tankua.et',
  'Support Staff',
  'support',
  '+251922222222',
  true
)
ON CONFLICT (email) DO UPDATE
SET 
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  phone = EXCLUDED.phone,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Example 4: Add a finance admin
INSERT INTO admin_users (email, name, role, phone, is_active)
VALUES (
  'finance@tankua.et',
  'Finance Manager',
  'finance',
  '+251933333333',
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
-- QUERY TO LIST ALL ADMINS
-- ============================================
-- SELECT id, email, name, role, phone, is_active, created_at 
-- FROM admin_users 
-- ORDER BY created_at DESC;

-- ============================================
-- DEACTIVATE AN ADMIN (instead of deleting)
-- ============================================
-- UPDATE admin_users 
-- SET is_active = false, updated_at = NOW()
-- WHERE email = 'old-admin@tankua.et';

-- ============================================
-- CHANGE ADMIN ROLE
-- ============================================
-- UPDATE admin_users 
-- SET role = 'admin', updated_at = NOW()
-- WHERE email = 'user@tankua.et';

-- ============================================
-- COMPLETED
-- ============================================
-- After adding admin users:
-- 1. Make sure they have accounts in Supabase Auth with matching emails
-- 2. They can login at the admin dashboard
-- 3. Their access level depends on their role

