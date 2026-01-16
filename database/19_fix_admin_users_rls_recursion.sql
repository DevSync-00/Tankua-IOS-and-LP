-- ============================================
-- FIX INFINITE RECURSION IN RLS POLICIES
-- This fixes "infinite recursion detected in policy" errors for:
-- - admin_users table
-- - provider_users table
-- - All policies that query these tables
-- ============================================

-- Create a SECURITY DEFINER function to check admin status
-- This bypasses RLS and prevents recursion
CREATE OR REPLACE FUNCTION is_admin_user(user_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id::text = user_id
  );
$$;

-- Create function to check if user is super_admin
CREATE OR REPLACE FUNCTION is_super_admin(user_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id::text = user_id
    AND admin_users.role = 'super_admin'
  );
$$;

-- Drop existing admin_users policies
DROP POLICY IF EXISTS "Admin users can view themselves" ON admin_users;
DROP POLICY IF EXISTS "Super admin can manage admin users" ON admin_users;

-- Recreate admin_users policies using the function (no recursion)
CREATE POLICY "Admin users can view themselves"
  ON admin_users FOR SELECT
  USING (
    auth.uid()::text = id::text 
    OR is_super_admin(auth.uid()::text)
  );

CREATE POLICY "Super admin can manage admin users"
  ON admin_users FOR ALL
  USING (is_super_admin(auth.uid()::text));

-- ============================================
-- UPDATE PROVIDERS POLICY TO USE FUNCTION
-- ============================================

-- Drop existing policy
DROP POLICY IF EXISTS "Admins can manage providers" ON providers;
DROP POLICY IF EXISTS "Admins can update providers" ON providers;
DROP POLICY IF EXISTS "Admins can delete providers" ON providers;

-- Create separate policies for update/delete using the function
CREATE POLICY "Admins can update providers"
  ON providers FOR UPDATE
  USING (is_admin_user(auth.uid()::text));

CREATE POLICY "Admins can delete providers"
  ON providers FOR DELETE
  USING (is_admin_user(auth.uid()::text));

-- ============================================
-- UPDATE OTHER POLICIES THAT CHECK admin_users
-- ============================================

-- Update support_tickets policy
DROP POLICY IF EXISTS "Admins can manage tickets" ON support_tickets;
CREATE POLICY "Admins can manage tickets"
  ON support_tickets FOR ALL
  USING (is_admin_user(auth.uid()::text));

-- Update notifications policy
DROP POLICY IF EXISTS "Admins can create notifications" ON notifications;
CREATE POLICY "Admins can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (is_admin_user(auth.uid()::text));

-- Update payouts policy
DROP POLICY IF EXISTS "Admins can manage payouts" ON payouts;
CREATE POLICY "Admins can manage payouts"
  ON payouts FOR ALL
  USING (is_admin_user(auth.uid()::text));

-- ============================================
-- FIX provider_users POLICIES (PREVENT RECURSION)
-- ============================================

-- Create function to get provider_id for a user
CREATE OR REPLACE FUNCTION get_user_provider_id(user_id TEXT)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT provider_id FROM provider_users
  WHERE provider_users.id::text = user_id
  LIMIT 1;
$$;

-- Create function to check if user is provider owner
CREATE OR REPLACE FUNCTION is_provider_owner(user_id TEXT, check_provider_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM provider_users
    WHERE provider_users.id::text = user_id
    AND provider_users.provider_id = check_provider_id
    AND provider_users.role = 'owner'
  );
$$;

-- Create function to check if user is provider manager or owner
CREATE OR REPLACE FUNCTION is_provider_manager(user_id TEXT, check_provider_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM provider_users
    WHERE provider_users.id::text = user_id
    AND provider_users.provider_id = check_provider_id
    AND provider_users.role IN ('owner', 'manager')
  );
$$;

-- Drop existing provider_users policies
DROP POLICY IF EXISTS "Provider users can view own provider staff" ON provider_users;
DROP POLICY IF EXISTS "Provider owners can manage staff" ON provider_users;

-- Recreate policies using functions (no recursion)
CREATE POLICY "Provider users can view own provider staff"
  ON provider_users FOR SELECT
  USING (
    provider_id = get_user_provider_id(auth.uid()::text)
    OR is_admin_user(auth.uid()::text)
  );

CREATE POLICY "Provider owners can manage staff"
  ON provider_users FOR ALL
  USING (
    is_provider_owner(auth.uid()::text, provider_id)
    OR is_admin_user(auth.uid()::text)
  );

-- ============================================
-- FIX OTHER POLICIES THAT QUERY provider_users
-- ============================================

-- Fix vehicles policies
DROP POLICY IF EXISTS "Provider staff can view own vehicles" ON vehicles;
DROP POLICY IF EXISTS "Provider managers can manage vehicles" ON vehicles;

CREATE POLICY "Provider staff can view own vehicles"
  ON vehicles FOR SELECT
  USING (
    provider_id = get_user_provider_id(auth.uid()::text)
    OR is_admin_user(auth.uid()::text)
  );

CREATE POLICY "Provider managers can manage vehicles"
  ON vehicles FOR ALL
  USING (
    is_provider_manager(auth.uid()::text, provider_id)
    OR is_admin_user(auth.uid()::text)
  );

-- Fix payouts policies (already updated above, but ensure consistency)
DROP POLICY IF EXISTS "Provider owners can view payouts" ON payouts;

CREATE POLICY "Provider owners can view payouts"
  ON payouts FOR SELECT
  USING (
    is_provider_owner(auth.uid()::text, provider_id)
    OR is_admin_user(auth.uid()::text)
  );

-- Fix support_tickets policies (update the SELECT policy)
DROP POLICY IF EXISTS "Users can view own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users can create tickets" ON support_tickets;

CREATE POLICY "Users can view own tickets"
  ON support_tickets FOR SELECT
  USING (
    user_id::text = auth.uid()::text
    OR provider_id = get_user_provider_id(auth.uid()::text)
    OR is_admin_user(auth.uid()::text)
  );

CREATE POLICY "Users can create tickets"
  ON support_tickets FOR INSERT
  WITH CHECK (
    user_id::text = auth.uid()::text
    OR provider_id = get_user_provider_id(auth.uid()::text)
  );

-- Fix ticket_messages policies
DROP POLICY IF EXISTS "Ticket messages visible to participants" ON ticket_messages;
DROP POLICY IF EXISTS "Participants can add messages" ON ticket_messages;

CREATE POLICY "Ticket messages visible to participants"
  ON ticket_messages FOR SELECT
  USING (
    ticket_id IN (
      SELECT id FROM support_tickets
      WHERE user_id::text = auth.uid()::text
        OR provider_id = get_user_provider_id(auth.uid()::text)
        OR is_admin_user(auth.uid()::text)
    )
    AND (NOT is_internal OR is_admin_user(auth.uid()::text))
  );

CREATE POLICY "Participants can add messages"
  ON ticket_messages FOR INSERT
  WITH CHECK (
    ticket_id IN (
      SELECT id FROM support_tickets
      WHERE user_id::text = auth.uid()::text
        OR provider_id = get_user_provider_id(auth.uid()::text)
        OR is_admin_user(auth.uid()::text)
    )
  );

-- Fix reviews policies
DROP POLICY IF EXISTS "Providers can respond to reviews" ON reviews;

CREATE POLICY "Providers can respond to reviews"
  ON reviews FOR UPDATE
  USING (
    provider_id = get_user_provider_id(auth.uid()::text)
    OR is_admin_user(auth.uid()::text)
  );

-- ============================================
-- COMPLETED
-- ============================================
-- All policies now use SECURITY DEFINER functions
-- This prevents infinite recursion when checking:
-- - Admin status (admin_users)
-- - Provider user status (provider_users)
-- The functions bypass RLS, so they can query tables without triggering policies.

