# Setup Provider Applications Feature

## Problem
The admin page for provider applications needs these tables to exist in Supabase:
- `providers` - Stores provider information
- `support_tickets` - Stores provider registration tickets

## Quick Setup

### Option 1: Run Full Database Setup (Recommended)

If you haven't set up the database yet, run these scripts in order:

1. **`database/01_create_tables.sql`** - Creates basic tables (users, churches, trips, bookings, etc.)
2. **`database/09_create_providers_table.sql`** - Creates providers table
3. **`database/10_web_platform_schema.sql`** - Creates support_tickets and other admin tables
4. **`database/11_web_platform_rls.sql`** - Sets up Row Level Security policies
5. **`database/17_fix_provider_registration_rls.sql`** - Fixes RLS for provider registration

### Option 2: Quick Setup (Just Provider Applications Tables)

If you only need the provider applications feature, run this single script:

**`database/25_setup_provider_applications_tables.sql`**

This creates:
- `providers` table (if it doesn't exist)
- `support_tickets` table (if it doesn't exist)
- Required indexes
- Ticket number generator function

## How to Run

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy and paste the SQL from `database/25_setup_provider_applications_tables.sql`
3. Click **Run**
4. Verify tables were created:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('providers', 'support_tickets');
   ```

## Verify Setup

After running the script, check:

```sql
-- Check if providers table exists and has data
SELECT COUNT(*) as provider_count FROM providers;
SELECT COUNT(*) as inactive_providers FROM providers WHERE status = 'inactive';

-- Check if support_tickets table exists
SELECT COUNT(*) as ticket_count FROM support_tickets;
```

## How It Works

1. **Provider Registration**: When a provider registers, a record is created in:
   - `providers` table with `status = 'inactive'`
   - `support_tickets` table with `provider_id` and subject "New provider registration"

2. **Admin View**: The admin page fetches:
   - From `support_tickets`: Tickets with `provider_id` and subject containing "registration"
   - From `providers`: All providers with `status = 'inactive'`

3. **Approval/Rejection**: Admin can:
   - Approve: Sets provider `status = 'active'` and resolves ticket
   - Reject: Sets provider `status = 'suspended'` and adds rejection reason

## Troubleshooting

### "relation does not exist" error
- **Problem**: Tables haven't been created
- **Solution**: Run `database/25_setup_provider_applications_tables.sql`

### "permission denied" or RLS error
- **Problem**: Row Level Security policies not set up
- **Solution**: Run `database/17_fix_provider_registration_rls.sql` and `database/19_fix_admin_users_rls_recursion.sql`

### No applications showing
- **Problem**: No providers registered yet, or tables are empty
- **Solution**: 
  1. Check if providers exist: `SELECT * FROM providers WHERE status = 'inactive';`
  2. Check if tickets exist: `SELECT * FROM support_tickets WHERE provider_id IS NOT NULL;`
  3. Use the "Inactive Providers" view toggle on the admin page

## Next Steps

After setup:
1. Test provider registration at `/register` (provider portal)
2. Check admin applications page at `/dashboard/provider-applications`
3. Approve/reject providers as needed

