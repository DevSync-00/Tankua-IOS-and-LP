-- ============================================
-- RESET TO ONE PROVIDER AND ONE ADMIN
-- Deletes existing providers/admins and seeds one active record for each.
-- Run after the web platform/provider migrations.
-- ============================================

BEGIN;

-- Clear provider references that are not protected by cascading foreign keys.
UPDATE bookings
SET provider_id = NULL,
    provider_name = NULL
WHERE provider_id IS NOT NULL
   OR provider_name IS NOT NULL;

UPDATE trips
SET provider_id = NULL
WHERE provider_id IS NOT NULL;

-- Clear admin references before deleting admin_users rows.
DO $$
BEGIN
  IF to_regclass('public.refunds') IS NOT NULL THEN
    UPDATE refunds SET processed_by = NULL WHERE processed_by IS NOT NULL;
  END IF;

  IF to_regclass('public.payouts') IS NOT NULL THEN
    UPDATE payouts SET processed_by = NULL WHERE processed_by IS NOT NULL;
  END IF;

  IF to_regclass('public.support_tickets') IS NOT NULL THEN
    UPDATE support_tickets SET assigned_to = NULL WHERE assigned_to IS NOT NULL;
  END IF;

  IF to_regclass('public.promotions') IS NOT NULL THEN
    UPDATE promotions SET created_by = NULL WHERE created_by IS NOT NULL;
  END IF;

  IF to_regclass('public.settings') IS NOT NULL THEN
    UPDATE settings SET updated_by = NULL WHERE updated_by IS NOT NULL;
  END IF;
END $$;

-- Remove existing portal admins and providers.
DELETE FROM admin_users;
DELETE FROM providers;

-- Keep the mobile app's admin flag aligned with the single seeded admin.
UPDATE users
SET is_admin = FALSE
WHERE is_admin = TRUE;

INSERT INTO users (phone_number, name, email, is_admin)
VALUES (
  '+251900000000',
  'Tankua Admin',
  'admin@tankua.et',
  TRUE
)
ON CONFLICT (phone_number) DO UPDATE
SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  is_admin = TRUE;

-- Seed the single admin used by the web admin portal.
INSERT INTO admin_users (email, name, role, phone, is_active)
VALUES (
  'admin@tankua.et',
  'Tankua Admin',
  'super_admin',
  '+251900000000',
  TRUE
);

-- Seed the single provider used by the provider portal.
WITH seeded_provider AS (
  INSERT INTO providers (
    name,
    description,
    phone,
    email,
    logo_url,
    rating,
    total_trips,
    status
  )
  VALUES (
    'Tankua Travel Partners',
    'Official Tankua travel provider for verified trips and guided travel services.',
    '+251944567890',
    'provider@tankua.et',
    'https://via.placeholder.com/200x200?text=Tankua+Provider',
    4.8,
    0,
    'active'
  )
  RETURNING id, name, email, phone, created_at
)
INSERT INTO provider_users (
  provider_id,
  email,
  name,
  role,
  phone,
  is_active,
  created_at,
  updated_at
)
SELECT
  id,
  email,
  name,
  'owner',
  phone,
  TRUE,
  created_at,
  NOW()
FROM seeded_provider;

COMMIT;

-- ============================================
-- VERIFY
-- ============================================
-- SELECT COUNT(*) AS providers FROM providers;
-- SELECT COUNT(*) AS admins FROM admin_users;
-- SELECT p.name, p.email, pu.role
-- FROM providers p
-- JOIN provider_users pu ON pu.provider_id = p.id;
