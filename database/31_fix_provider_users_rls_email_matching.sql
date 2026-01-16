-- ============================================
-- FIX PROVIDER_USERS RLS POLICIES
-- The current policies match by ID, but provider_users.id != auth.users.id
-- We need to match by email instead
-- ============================================

-- Create function to get user's email from auth
CREATE OR REPLACE FUNCTION get_auth_user_email(user_id TEXT)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT email FROM auth.users
  WHERE id::text = user_id
  LIMIT 1;
$$;

-- Update function to get provider_id by matching email
CREATE OR REPLACE FUNCTION get_user_provider_id(user_id TEXT)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT provider_id FROM provider_users
  WHERE provider_users.email = get_auth_user_email(user_id)
  LIMIT 1;
$$;

-- Update function to check if user is provider owner (by email)
CREATE OR REPLACE FUNCTION is_provider_owner(user_id TEXT, check_provider_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM provider_users
    WHERE provider_users.email = get_auth_user_email(user_id)
    AND provider_users.provider_id = check_provider_id
    AND provider_users.role = 'owner'
  );
$$;

-- Update function to check if user is provider manager or owner (by email)
CREATE OR REPLACE FUNCTION is_provider_manager(user_id TEXT, check_provider_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM provider_users
    WHERE provider_users.email = get_auth_user_email(user_id)
    AND provider_users.provider_id = check_provider_id
    AND provider_users.role IN ('owner', 'manager')
  );
$$;

-- Also allow provider users to view their own record by email
-- This is needed for the login check
DROP POLICY IF EXISTS "Provider users can view themselves" ON provider_users;
CREATE POLICY "Provider users can view themselves"
  ON provider_users FOR SELECT
  USING (
    email = get_auth_user_email(auth.uid()::text)
    OR provider_id = get_user_provider_id(auth.uid()::text)
    OR is_admin_user(auth.uid()::text)
  );

-- Update the existing policy to also allow viewing own record
DROP POLICY IF EXISTS "Provider users can view own provider staff" ON provider_users;
CREATE POLICY "Provider users can view own provider staff"
  ON provider_users FOR SELECT
  USING (
    -- Allow viewing own record
    email = get_auth_user_email(auth.uid()::text)
    -- Allow viewing other staff from same provider
    OR provider_id = get_user_provider_id(auth.uid()::text)
    -- Allow admins to view all
    OR is_admin_user(auth.uid()::text)
  );

-- ============================================
-- COMPLETED
-- ============================================
-- RLS policies now match provider_users by email instead of ID
-- This allows providers to view their own provider_user record
-- and other staff from their provider
