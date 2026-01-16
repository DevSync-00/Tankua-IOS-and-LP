-- ============================================
-- ADD PASSENGER DETAILS COLUMN TO BOOKINGS
-- Store passenger names and ages for multi-passenger bookings
-- ============================================

-- Add passenger_details column to bookings table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' 
    AND column_name = 'passenger_details'
  ) THEN
    ALTER TABLE bookings ADD COLUMN passenger_details JSONB;
    
    -- Add comment
    COMMENT ON COLUMN bookings.passenger_details IS 'Array of passenger objects with name and age: [{"name": "John Doe", "age": 25}, ...]';
  END IF;
END $$;

-- ============================================
-- COMPLETED
-- ============================================
-- passenger_details column added to bookings table
-- Can store array of { name, age } objects for each passenger
