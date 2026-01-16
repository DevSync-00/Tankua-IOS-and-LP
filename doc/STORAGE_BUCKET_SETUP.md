# Storage Bucket Setup for Provider Registration

## Quick Setup

The provider registration feature requires a storage bucket named `provider-docs` to upload license documents.

### Option 1: Create via Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the sidebar
3. Click **"Create a new bucket"**
4. Configure the bucket:
   - **Name**: `provider-docs`
   - **Public**: No (Private)
   - **File size limit**: 5 MB
   - **Allowed MIME types**: `application/pdf, image/png, image/jpeg`
5. Click **"Create bucket"**

### Option 2: Create via Supabase CLI

```bash
supabase storage create provider-docs --public false
```

### Set Up Storage Policies

**Option 1: Run SQL Script (Recommended - Permanent Fix)**

Run the SQL script in Supabase SQL Editor:
```sql
-- File: database/18_fix_storage_rls_policies.sql
```

This automatically creates all necessary policies and fixes RLS errors permanently.

**Option 2: Manual Setup via Dashboard**

1. Click on the **provider-docs** bucket
2. Go to **Policies** tab
3. Create policies:

#### Policy 1: Allow Uploads (INSERT) - FOR REGISTRATION
- **Policy name**: "Allow anyone to upload to provider-docs"
- **Policy definition**:
  ```sql
  bucket_id = 'provider-docs'
  AND (storage.foldername(name))[1] = 'applications'
  ```
- **Allowed operations**: INSERT
- **Note**: This allows unauthenticated uploads for registration

#### Policy 2: Allow Admin Reads (SELECT)
- **Policy name**: "Allow admins to read provider-docs"
- **Policy definition**:
  ```sql
  bucket_id = 'provider-docs'
  AND EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id::text = auth.uid()::text
  )
  ```
- **Allowed operations**: SELECT

### Verify Setup

After creating the bucket and policies, test by:
1. Going to the provider registration page
2. Uploading a test document
3. If you see "Bucket not found" error, double-check:
   - Bucket name is exactly `provider-docs` (case-sensitive)
   - Policies are correctly configured
   - You're using the correct Supabase project

### Troubleshooting

**Error: "Bucket not found"**
- Verify the bucket exists in your Supabase Storage
- Check the bucket name is exactly `provider-docs`
- Ensure you're connected to the correct Supabase project

**Error: "new row violates row-level security policy"**
- **PERMANENT FIX**: Run `database/18_fix_storage_rls_policies.sql` in Supabase SQL Editor
- This creates policies that allow unauthenticated uploads for registration
- Verify policies exist: `SELECT * FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects';`
- Make sure the policy allows uploads to `applications/` folder

**Error: "File size exceeds limit"**
- Check the file is under 5MB
- Verify bucket file size limit is set to 5MB or higher

