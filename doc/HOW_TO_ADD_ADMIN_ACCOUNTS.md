# How to Add Admin Accounts

This guide explains how to add admin users to the Tankua platform.

## Overview

Admin accounts require **two steps**:
1. Create user in **Supabase Authentication** (for login credentials)
2. Add entry in **admin_users** table (for admin dashboard access)

## Method 1: Via Supabase Dashboard (Recommended)

### Step 1: Create User in Supabase Auth

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click **"Add User"** or **"Invite User"**
3. Fill in:
   - **Email**: The admin's email address
   - **Password**: Set a temporary password (user can change later)
   - **Auto Confirm User**: ✅ Check this (so they can login immediately)
4. Click **"Create User"**

### Step 2: Add Admin Entry in Database

1. Go to **Supabase Dashboard** → **Table Editor**
2. Select **admin_users** table
3. Click **"Insert"** → **"Insert Row"**
4. Fill in:
   - **email**: Same email as in Step 1
   - **name**: Admin's full name
   - **role**: Choose one:
     - `super_admin` - Full access (can manage other admins)
     - `admin` - Full access except managing admins
     - `support` - Support tickets and user management
     - `finance` - Payments, payouts, financial reports
   - **phone**: Optional phone number
   - **is_active**: `true`
5. Click **"Save"**

### Step 3: Test Login

1. Go to admin login page: `https://admin.tankua.et/login` (or your admin URL)
2. Login with the email and password from Step 1
3. You should see the admin dashboard!

## Method 2: Via SQL Script

### Step 1: Create User in Supabase Auth

Same as Method 1, Step 1.

### Step 2: Run SQL Script

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run this SQL (replace with your admin details):

```sql
INSERT INTO admin_users (email, name, role, phone, is_active)
VALUES (
  'your-admin@tankua.et',  -- Same email as in Auth
  'Admin Name',
  'super_admin',            -- or 'admin', 'support', 'finance'
  '+251900000000',          -- Optional
  true
)
ON CONFLICT (email) DO UPDATE
SET 
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  phone = EXCLUDED.phone,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();
```

3. Click **"Run"**

### Step 3: Test Login

Same as Method 1, Step 3.

## Admin Roles Explained

| Role | Permissions |
|------|-------------|
| **super_admin** | Full access including managing other admins, all settings, all data |
| **admin** | Full access to dashboard, users, providers, bookings, trips (cannot manage admins) |
| **support** | Access to support tickets, user management, basic reports |
| **finance** | Access to payments, payouts, financial reports, transactions |

## Quick Reference SQL

### Add a Super Admin
```sql
INSERT INTO admin_users (email, name, role, phone, is_active)
VALUES ('admin@tankua.et', 'Admin Name', 'super_admin', '+251900000000', true)
ON CONFLICT (email) DO UPDATE SET role = 'super_admin', updated_at = NOW();
```

### List All Admins
```sql
SELECT id, email, name, role, phone, is_active, created_at 
FROM admin_users 
ORDER BY created_at DESC;
```

### Deactivate an Admin
```sql
UPDATE admin_users 
SET is_active = false, updated_at = NOW()
WHERE email = 'admin@tankua.et';
```

### Change Admin Role
```sql
UPDATE admin_users 
SET role = 'admin', updated_at = NOW()
WHERE email = 'admin@tankua.et';
```

### Delete an Admin (Use Deactivate Instead)
```sql
-- Better to deactivate instead of delete to preserve audit trail
UPDATE admin_users SET is_active = false WHERE email = 'admin@tankua.et';
```

## Troubleshooting

### "Access denied. Admin account required."
- **Problem**: User exists in Auth but not in admin_users table
- **Solution**: Add entry to admin_users table with matching email

### "Invalid credentials"
- **Problem**: User doesn't exist in Supabase Auth
- **Solution**: Create user in Authentication → Users first

### "Email already exists"
- **Problem**: Admin user already exists
- **Solution**: Use `ON CONFLICT` clause or update existing record

### Can't See Admin Dashboard
- **Problem**: User is deactivated or role is incorrect
- **Solution**: Check `is_active = true` and verify role in admin_users table

## Security Best Practices

1. ✅ **Use strong passwords** for admin accounts
2. ✅ **Enable 2FA** in Supabase Auth (if available)
3. ✅ **Use super_admin sparingly** - only for trusted staff
4. ✅ **Deactivate instead of delete** - preserves audit trail
5. ✅ **Regularly review admin access** - remove inactive admins
6. ✅ **Use role-based access** - give minimum required permissions

## First Admin Setup

If this is your first admin account:

1. **Create in Supabase Auth** (as described above)
2. **Add to admin_users** with role `super_admin`
3. **Login to admin dashboard**
4. **Create additional admins** through the dashboard (if UI exists) or via SQL

The initial seed admin from `database/10_web_platform_schema.sql` is:
- Email: `admin@tankua.et`
- Role: `super_admin`

You can use this as your first admin or create a new one.

## Need Help?

- Check `database/20_add_admin_users.sql` for SQL examples
- Review Supabase Auth documentation for user management
- Check admin login code in `web/apps/admin/src/app/login/page.tsx`

