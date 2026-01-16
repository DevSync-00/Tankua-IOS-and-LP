-- ============================================
-- UPDATE TRIPS TRIP_TYPE CONSTRAINT
-- Allow round_trip and one_way values in addition to existing values
-- ============================================

-- Drop the old constraint
DO $$
BEGIN
  -- Drop the old check constraint if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'trips_trip_type_check' 
    AND conrelid = 'trips'::regclass
  ) THEN
    ALTER TABLE trips DROP CONSTRAINT trips_trip_type_check;
  END IF;
END $$;

-- Add new constraint that allows: group, private, holiday, round_trip, one_way
ALTER TABLE trips ADD CONSTRAINT trips_trip_type_check 
  CHECK (trip_type = ANY (ARRAY['group'::text, 'private'::text, 'holiday'::text, 'round_trip'::text, 'one_way'::text]));

-- ============================================
-- COMPLETED
-- ============================================
-- trip_type now accepts: group, private, holiday, round_trip, one_way
