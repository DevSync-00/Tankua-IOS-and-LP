-- ============================================
-- GENERALIZE SYSTEM FOR ALL TOURS
-- Rename churches to destinations and add category filtering
-- ============================================

-- Step 1: Add category column to churches table (before renaming)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'churches' AND column_name = 'category'
  ) THEN
    ALTER TABLE churches ADD COLUMN category TEXT DEFAULT 'church' 
      CHECK (category IN ('church', 'historical', 'nature', 'adventure', 'cultural', 'religious', 'monument', 'park', 'museum', 'other'));
    -- Create index for filtering
    CREATE INDEX IF NOT EXISTS idx_churches_category ON churches(category);
  END IF;
END $$;

-- Step 2: Rename churches table to destinations
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'churches')
    AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'destinations')
  THEN
    ALTER TABLE churches RENAME TO destinations;
    
    -- Rename the index
    ALTER INDEX IF EXISTS idx_churches_category RENAME TO idx_destinations_category;
  END IF;
END $$;

-- Step 3: Update trips table - rename church_id to destination_id
DO $$ 
BEGIN
  -- Drop foreign key constraint first
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'trips_church_id_fkey'
  ) THEN
    ALTER TABLE trips DROP CONSTRAINT trips_church_id_fkey;
  END IF;
  
  -- Rename column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'trips' AND column_name = 'church_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'trips' AND column_name = 'destination_id'
  ) THEN
    ALTER TABLE trips RENAME COLUMN church_id TO destination_id;
    
    -- Recreate foreign key with new name
    ALTER TABLE trips ADD CONSTRAINT trips_destination_id_fkey 
      FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE;
    
    -- Rename index
    DROP INDEX IF EXISTS idx_trips_church_id;
    CREATE INDEX IF NOT EXISTS idx_trips_destination_id ON trips(destination_id);
  END IF;
END $$;

-- Step 4: Update bookings table
DO $$ 
BEGIN
  -- Rename church_id to destination_id
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'church_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'destination_id'
  ) THEN
    -- Drop foreign key first
    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'bookings_church_id_fkey'
    ) THEN
      ALTER TABLE bookings DROP CONSTRAINT bookings_church_id_fkey;
    END IF;
    
    ALTER TABLE bookings RENAME COLUMN church_id TO destination_id;
    
    -- Recreate foreign key
    ALTER TABLE bookings ADD CONSTRAINT bookings_destination_id_fkey 
      FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE SET NULL;
  END IF;
  
  -- Rename church_name to destination_name
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'church_name'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'destination_name'
  ) THEN
    ALTER TABLE bookings RENAME COLUMN church_name TO destination_name;
  END IF;
END $$;

-- Step 5: Update users table - rename saved_churches to saved_destinations
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'saved_churches'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'saved_destinations'
  ) THEN
    ALTER TABLE users RENAME COLUMN saved_churches TO saved_destinations;
  END IF;
END $$;

-- Step 6: Add tour_category to trips table for additional filtering
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'trips' AND column_name = 'tour_category'
  ) THEN
    ALTER TABLE trips ADD COLUMN tour_category TEXT 
      CHECK (tour_category IN ('day_trip', 'multi_day', 'weekend', 'holiday', 'custom', NULL));
    CREATE INDEX IF NOT EXISTS idx_trips_tour_category ON trips(tour_category);
  END IF;
END $$;

-- Step 7: Update index names that reference church
DO $$ 
BEGIN
  -- Update trips index if it still references church
  IF EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_trips_church_provider'
  ) THEN
    DROP INDEX IF EXISTS idx_trips_church_provider;
    CREATE INDEX IF NOT EXISTS idx_trips_destination_provider ON trips(destination_id, provider_id);
  END IF;
END $$;

-- Step 8: Add additional indexes for filtering
CREATE INDEX IF NOT EXISTS idx_destinations_region ON destinations(region);
CREATE INDEX IF NOT EXISTS idx_destinations_city ON destinations(city);
CREATE INDEX IF NOT EXISTS idx_trips_price ON trips(price);
CREATE INDEX IF NOT EXISTS idx_trips_departure_date_category ON trips(departure_date, tour_category);

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- The system is now generalized for all tour types
-- Categories: church, historical, nature, adventure, cultural, religious, monument, park, museum, other
-- Tour categories: day_trip, multi_day, weekend, holiday, custom
