-- ============================================
-- AUTO-CREATE PROVIDER USER ON APPROVAL
-- When a provider is approved (status = 'active'),
-- automatically create a provider_user entry so they can login
-- ============================================

-- Function to create provider_user when provider is approved
CREATE OR REPLACE FUNCTION auto_create_provider_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if status changed to 'active' and email exists
  IF NEW.status = 'active' AND OLD.status != 'active' AND NEW.email IS NOT NULL AND NEW.email != '' THEN
    -- Check if provider_user already exists for this provider
    IF NOT EXISTS (
      SELECT 1 FROM provider_users 
      WHERE provider_id = NEW.id 
      OR email = NEW.email
    ) THEN
      -- Create provider_user entry
      INSERT INTO provider_users (
        provider_id,
        email,
        name,
        role,
        phone,
        is_active,
        created_at,
        updated_at
      ) VALUES (
        NEW.id,
        NEW.email,
        NEW.name,
        'owner',  -- Main provider account is owner
        NEW.phone,
        TRUE,
        NOW(),
        NOW()
      )
      ON CONFLICT (email) DO UPDATE
      SET
        provider_id = EXCLUDED.provider_id,
        name = EXCLUDED.name,
        role = 'owner',
        phone = EXCLUDED.phone,
        is_active = TRUE,
        updated_at = NOW();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on providers table
DROP TRIGGER IF EXISTS trigger_auto_create_provider_user ON providers;
CREATE TRIGGER trigger_auto_create_provider_user
  AFTER UPDATE OF status ON providers
  FOR EACH ROW
  WHEN (NEW.status = 'active' AND (OLD.status IS NULL OR OLD.status != 'active'))
  EXECUTE FUNCTION auto_create_provider_user();

-- ============================================
-- BACKFILL: Create provider_users for existing active providers
-- ============================================
-- Use a DO block to insert one at a time to avoid conflicts
DO $$
DECLARE
  provider_record RECORD;
BEGIN
  FOR provider_record IN
    SELECT DISTINCT ON (email)
      id,
      email,
      name,
      phone,
      created_at
    FROM providers
    WHERE status = 'active' 
      AND email IS NOT NULL 
      AND email != ''
      AND NOT EXISTS (
        SELECT 1 FROM provider_users 
        WHERE provider_id = providers.id 
        OR email = providers.email
      )
    ORDER BY email, created_at DESC
  LOOP
    INSERT INTO provider_users (
      provider_id,
      email,
      name,
      role,
      phone,
      is_active,
      created_at,
      updated_at
    ) VALUES (
      provider_record.id,
      provider_record.email,
      provider_record.name,
      'owner',
      provider_record.phone,
      TRUE,
      provider_record.created_at,
      NOW()
    )
    ON CONFLICT (email) DO UPDATE
    SET
      provider_id = EXCLUDED.provider_id,
      name = EXCLUDED.name,
      role = 'owner',
      phone = EXCLUDED.phone,
      is_active = TRUE,
      updated_at = NOW();
  END LOOP;
END $$;

-- ============================================
-- COMPLETED
-- ============================================
-- Trigger created: When a provider's status changes to 'active',
-- a provider_user entry is automatically created with:
--   - provider_id: linked to the provider
--   - email: from provider.email
--   - name: from provider.name
--   - role: 'owner' (main provider account)
--   - phone: from provider.phone
--   - is_active: TRUE
--
-- Existing active providers have been backfilled with provider_user entries.
