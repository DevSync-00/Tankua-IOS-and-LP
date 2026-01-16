# First Admin Login Setup Guide

This guide will help you create your first admin account and login to the admin dashboard.

## Quick Setup (5 minutes)

You need to complete **2 steps** in the Supabase Dashboard:

### Step 1: Create User in Supabase Authentication

1. Go to your **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Authentication** → **Users** (in the left sidebar)
4. Click **"Add User"** button (or **"Invite User"**)
5. Fill in the form:
   - **Email**: Enter your admin email (e.g., `admin@tankua.et` or your email)
   - **Password**: Set a strong password (you'll use this to login)
   - **Auto Confirm User**: ✅ **Check this box** (important - allows immediate login)
   - **Send Invite Email**: You can leave this unchecked if you already know the password
6. Click **"Create User"**

**Important**: Remember the email and password you set here - you'll use them to login!

### Step 2: Add Admin Entry to Database

1. In the same Supabase Dashboard, go to **Table Editor** (in the left sidebar)
2. Find and click on the **`admin_users`** table
3. Click **"Insert"** → **"Insert Row"** button
4. Fill in the fields:
   - **email**: Same email you used in Step 1 (e.g., `admin@tankua.et`)
   - **name**: Your full name (e.g., `Admin Name`)
   - **role**: Select `super_admin` (this gives you full access)
   - **phone**: Optional - your phone number (e.g., `+251900000000`)
   - **is_active**: Make sure this is set to `true`
5. Click **"Save"** (or press Enter)

### Step 3: Login to Admin Dashboard

1. Go to your admin login page (usually `http://localhost:3000/login` for local dev, or your deployed admin URL)
2. Enter:
   - **Email**: The email from Step 1
   - **Password**: The password from Step 1
3. Click **"Sign In to Admin"**
4. You should now see the admin dashboard! 🎉

---

## Alternative: Using SQL Editor

If you prefer using SQL, you can do both steps via SQL:

### Step 1: Create Auth User (via Supabase Dashboard)

You still need to create the Auth user manually in the Supabase Dashboard (Authentication → Users → Add User) as described above.

### Step 2: Add Admin Entry via SQL

1. Go to **SQL Editor** in Supabase Dashboard
2. Run this SQL (replace with your details):

```sql
INSERT INTO admin_users (email, name, role, phone, is_active)
VALUES (
  'your-email@tankua.et',  -- Use the SAME email as in Step 1
  'Your Full Name',
  'super_admin',            -- Start with super_admin for full access
  '+251900000000',          -- Optional phone number
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

3. Click **"Run"** to execute

---

## Troubleshooting

### "Invalid credentials" Error

**Problem**: The user doesn't exist in Supabase Auth or password is wrong.

**Solution**:
- Go to Authentication → Users in Supabase Dashboard
- Check if your email exists
- If not, create it (Step 1 above)
- If it exists, you can reset the password by clicking on the user and selecting "Reset Password"

### "Access denied. Admin account required." Error

**Problem**: User exists in Auth but not in `admin_users` table.

**Solution**:
1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run this SQL (replace with YOUR email):

```sql
INSERT INTO admin_users (email, name, role, phone, is_active)
VALUES (
  'your-email@tankua.et',  -- ⚠️ REPLACE with YOUR email (must match Auth email exactly)
  'Your Full Name',          -- ⚠️ REPLACE with your name
  'super_admin',             -- Start with super_admin
  '+251900000000',           -- Optional phone
  true
)
ON CONFLICT (email) DO UPDATE
SET 
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();
```

3. Click **"Run"**
4. Try logging in again

**Quick Check**: Verify your email exists:
```sql
SELECT email, name, role, is_active FROM admin_users WHERE email = 'your-email@tankua.et';
```

**Important**: The email must match EXACTLY (case-sensitive) with your Auth email!

### "User already exists" Error

**Problem**: Admin entry already exists in `admin_users` table.

**Solution**:
- Check the `admin_users` table in Table Editor
- If the user exists but `is_active` is `false`, update it to `true`
- Or use the SQL with `ON CONFLICT` clause to update the existing record

### Can't See Admin Dashboard After Login

**Problem**: User might be deactivated or role is incorrect.

**Solution**:
- Check `admin_users` table
- Ensure `is_active = true`
- Ensure `role` is set (preferably `super_admin` for first admin)

---

## What's Next?

After logging in for the first time:

1. **Change your password** (recommended):
   - Go to Settings → Security
   - Use the "Change Password" form
   - Enter your current password and set a new one

2. **Create additional admins** (if needed):
   - Go to Admins page (visible only to super_admin)
   - Click "Add Admin" button
   - Fill in the form to create new admin accounts

3. **Explore the dashboard**:
   - View users, providers, bookings
   - Manage destinations and churches
   - Handle support tickets
   - Review payments and payouts

---

## Security Tips

1. ✅ **Use a strong password** (at least 8 characters, mix of letters, numbers, symbols)
2. ✅ **Change default password** after first login
3. ✅ **Don't share admin credentials** - create separate accounts for each admin
4. ✅ **Use role-based access** - only give `super_admin` to trusted staff
5. ✅ **Regularly review admin accounts** - deactivate unused accounts

---

## Quick Reference

**Default Admin (if using seed data)**:
- Email: `admin@tankua.et`
- You still need to create this in Supabase Auth with your own password

**Admin Roles**:
- `super_admin` - Full access (can manage other admins)
- `admin` - Full access except managing admins
- `support` - Support tickets and user management
- `finance` - Payments, payouts, financial reports

**Need Help?**
- Check `doc/HOW_TO_ADD_ADMIN_ACCOUNTS.md` for detailed admin management
- Review `database/20_add_admin_users.sql` for SQL examples
- Check Supabase documentation for Auth user management

