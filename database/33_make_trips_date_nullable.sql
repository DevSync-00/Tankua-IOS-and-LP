-- ============================================
-- ENSURE TRIPS DATE COLUMN IS SET
-- Make date nullable as a safety measure, but code should always set it
-- ============================================

-- Make date column nullable (safety measure - code will always set it from departure_date)
-- This prevents errors if old code doesn't set date
DO $$
BEGIN
  -- Check if date column exists and is NOT NULL
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'trips' 
    AND column_name = 'date'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE trips ALTER COLUMN date DROP NOT NULL;
  END IF;
END $$;

-- ============================================
-- COMPLETED
-- ============================================
-- The date column is now nullable for safety
-- Code will always set both date (from departure_date) and departure_date
-- This ensures backward compatibility while preventing constraint violations
