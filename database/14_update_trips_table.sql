-- ============================================
-- UPDATE TRIPS TABLE
-- Add departure_date, return_date, provider_id, and update column names
-- ============================================

-- Add provider_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'trips' AND column_name = 'provider_id'
  ) THEN
    ALTER TABLE trips ADD COLUMN provider_id UUID REFERENCES providers(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add departure_date column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'trips' AND column_name = 'departure_date'
  ) THEN
    -- If date column exists, migrate data to departure_date
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'trips' AND column_name = 'date'
    ) THEN
      ALTER TABLE trips ADD COLUMN departure_date TIMESTAMPTZ;
      UPDATE trips SET departure_date = date::TIMESTAMPTZ WHERE departure_date IS NULL;
      ALTER TABLE trips ALTER COLUMN departure_date SET NOT NULL;
    ELSE
      ALTER TABLE trips ADD COLUMN departure_date TIMESTAMPTZ NOT NULL;
    END IF;
  END IF;
END $$;

-- Add return_date column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'trips' AND column_name = 'return_date'
  ) THEN
    ALTER TABLE trips ADD COLUMN return_date TIMESTAMPTZ;
  END IF;
END $$;

-- Rename total_seats to max_seats if needed
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'trips' AND column_name = 'total_seats'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'trips' AND column_name = 'max_seats'
  ) THEN
    ALTER TABLE trips RENAME COLUMN total_seats TO max_seats;
  END IF;
END $$;

-- Drop old check constraint first
DO $$
BEGIN
  -- Drop the old check constraint if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'trips_status_check' 
    AND conrelid = 'trips'::regclass
  ) THEN
    ALTER TABLE trips DROP CONSTRAINT trips_status_check;
  END IF;
END $$;

-- Update status values (change 'active' to 'upcoming') before adding new constraint
UPDATE trips SET status = 'upcoming' WHERE status = 'active';

-- Add new check constraint with updated status values
ALTER TABLE trips ADD CONSTRAINT trips_status_check 
  CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled'));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_trips_provider_id ON trips(provider_id);
CREATE INDEX IF NOT EXISTS idx_trips_departure_date ON trips(departure_date);
CREATE INDEX IF NOT EXISTS idx_trips_church_provider ON trips(church_id, provider_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);

