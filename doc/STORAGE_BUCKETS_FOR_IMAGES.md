# Storage Buckets for Destination and Church Images

## Overview

The admin dashboard now supports file uploads for destination and church images instead of URL inputs. This requires storage buckets to be set up in Supabase.

## Required Storage Buckets

### 1. `destinations` Bucket
- **Purpose**: Store images for destinations/tour places
- **Public**: Yes (images need to be publicly accessible)
- **File size limit**: 5 MB per file
- **Allowed MIME types**: `image/png, image/jpeg, image/jpg, image/webp`

### 2. `churches` Bucket
- **Purpose**: Store images for churches
- **Public**: Yes (images need to be publicly accessible)
- **File size limit**: 5 MB per file
- **Allowed MIME types**: `image/png, image/jpeg, image/jpg, image/webp`

## Setup Instructions

### Option 1: Via Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard** → **Storage**
2. **Create `destinations` bucket**:
   - Click **"Create a new bucket"**
   - Name: `destinations`
   - Public: ✓ **Yes** (check this box)
   - File size limit: 5 MB
   - Allowed MIME types: `image/png, image/jpeg, image/jpg, image/webp`
   - Click **"Create bucket"**

3. **Create `churches` bucket**:
   - Click **"Create a new bucket"**
   - Name: `churches`
   - Public: ✓ **Yes** (check this box)
   - File size limit: 5 MB
   - Allowed MIME types: `image/png, image/jpeg, image/jpg, image/webp`
   - Click **"Create bucket"**

4. **Set Storage Policies** (if needed):
   - Click on each bucket → **Policies** tab
   - For public buckets, you may need policies to allow:
     - **SELECT** (read) - Allow public access
     - **INSERT** (upload) - Allow authenticated admins

### Option 2: Via SQL (Storage Policies - REQUIRED)

**IMPORTANT**: You MUST run this SQL script to allow admin users to upload images. Run this in Supabase SQL Editor:

**File: `database/26_fix_image_upload_storage_policies.sql`**

This script creates the necessary RLS policies to allow:
- Public read access (so images can be displayed)
- Admin upload access (so admins can upload images)
- Admin delete access (so admins can remove images)

**If you get "new row violates row-level security policy" error**, this means the policies haven't been set up yet. Run the SQL script above.

### Option 3: Manual Policy Setup (Alternative)

If you prefer to set up policies manually via Dashboard:

```sql
-- ============================================
-- STORAGE POLICIES FOR destinations BUCKET
-- ============================================

-- Allow public reads
CREATE POLICY "Public read access for destinations"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'destinations');

-- Allow admin uploads
CREATE POLICY "Admin uploads to destinations"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'destinations'
    AND EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id::text = auth.uid()::text
    )
  );

-- ============================================
-- STORAGE POLICIES FOR churches BUCKET
-- ============================================

-- Allow public reads
CREATE POLICY "Public read access for churches"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'churches');

-- Allow admin uploads
CREATE POLICY "Admin uploads to churches"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'churches'
    AND EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id::text = auth.uid()::text
    )
  );
```

## Features

### Image Upload
- **Multiple file selection**: Admins can upload multiple images at once
- **File validation**: Only image files (PNG, JPG, WebP) up to 5MB each
- **Preview**: Images are previewed before upload
- **Remove**: Admins can remove images before saving
- **Auto-upload**: Images are uploaded to Supabase Storage automatically
- **Public URLs**: Uploaded images get public URLs stored in the database

### User Experience
- Drag and drop interface
- Click to upload
- Image preview grid
- Remove button on hover
- Upload progress indicator
- Error handling for oversized files

## Troubleshooting

### "Bucket not found" Error
- **Problem**: Storage bucket doesn't exist
- **Solution**: Create the bucket via Supabase Dashboard (see Option 1 above)

### "Permission denied" Error
- **Problem**: Storage policies not set up
- **Solution**: Run the SQL policies (see Option 2 above) or set up policies via Dashboard

### Images Not Displaying
- **Problem**: Bucket is private or policies don't allow public reads
- **Solution**: Make sure the bucket is set to **Public: Yes** in Supabase Dashboard

### Upload Fails
- **Problem**: File too large or wrong type
- **Solution**: Check file size (max 5MB) and type (images only)

## Migration from URLs

If you have existing destinations/churches with image URLs:
- The system will preserve existing URLs
- New uploads will be added alongside existing URLs
- You can remove old URLs and replace with uploaded images

