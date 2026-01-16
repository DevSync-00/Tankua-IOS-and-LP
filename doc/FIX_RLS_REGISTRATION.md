# Fix RLS Policy Error for Provider Registration

## Problem
When submitting provider registration, you get: **"new row violates row-level security policy"**

This happens because the `providers` table and related tables have RLS enabled but don't have policies that allow unauthenticated registration.

## Quick Fix

Run the migration script in your Supabase SQL Editor:

```sql
-- File: database/17_fix_provider_registration_rls.sql
```

Or run these SQL commands directly:

### 1. Fix Providers Table Policies

```sql
-- Enable RLS (if not already)
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read providers" ON providers;
DROP POLICY IF EXISTS "Anyone can register provider" ON providers;
DROP POLICY IF EXISTS "Admins can manage providers" ON providers;

-- Public can read all providers
CREATE POLICY "Anyone can read providers"
  ON providers FOR SELECT
  USING (true);

-- Anyone can insert a provider (for registration)
CREATE POLICY "Anyone can register provider"
  ON providers FOR INSERT
  WITH CHECK (true);

-- Admins can manage all providers
CREATE POLICY "Admins can manage providers"
  ON providers FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin_users
    WHERE id::text = auth.uid()::text
  ));
```

### 2. Fix Support Tickets Policies

```sql
-- Drop existing insert policy
DROP POLICY IF EXISTS "Users can create tickets" ON support_tickets;

-- Allow anyone to create tickets with provider_id (for registration)
CREATE POLICY "Anyone can create provider tickets"
  ON support_tickets FOR INSERT
  WITH CHECK (
    (user_id IS NOT NULL AND user_id::text = auth.uid()::text)
    OR (provider_id IS NOT NULL)
    OR (
      provider_id IN (
        SELECT provider_id FROM provider_users
        WHERE id::text = auth.uid()::text
      )
    )
  );
```

## What This Fixes

1. **Providers Table**: Allows anyone to insert a new provider record during registration
2. **Support Tickets**: Allows creating tickets with `provider_id` even without authentication
3. **Notifications**: Made optional in code - registration won't fail if notification creation fails

## Verification

After running the migration:

1. Try registering a new provider
2. The registration should complete successfully
3. Check that:
   - Provider record is created with `status = 'inactive'`
   - Support ticket is created
   - You can see the new provider in admin dashboard

## Security Notes

- The policies allow unauthenticated inserts for registration, which is intentional
- Once registered, providers need admin approval to become active
- Admins can manage all providers through the admin dashboard
- Support tickets created during registration are visible to admins

## Troubleshooting

**Still getting RLS errors?**
- Check that you ran the migration script completely
- Verify policies exist: `SELECT * FROM pg_policies WHERE tablename = 'providers';`
- Check Supabase logs for specific policy violations

**Notification creation fails?**
- This is expected and handled gracefully - registration will still succeed
- Notifications require admin authentication, so they're optional during registration
- The support ticket serves as the main notification mechanism

