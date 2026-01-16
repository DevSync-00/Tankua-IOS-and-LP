-- ============================================
-- ADD PAYMENT DEADLINE AND MISSING COLUMNS TO BOOKINGS
-- Run this after 01_create_tables.sql
-- ============================================

-- Add missing columns to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS payment_deadline TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS base_price NUMERIC,
ADD COLUMN IF NOT EXISTS service_fee NUMERIC,
ADD COLUMN IF NOT EXISTS provider_fee NUMERIC,
ADD COLUMN IF NOT EXISTS provider_id UUID,
ADD COLUMN IF NOT EXISTS provider_name TEXT;

-- Update existing rows to have base_price = total_price if base_price is null
-- This ensures backward compatibility
UPDATE bookings 
SET base_price = total_price 
WHERE base_price IS NULL AND total_price IS NOT NULL;

-- Set service_fee and provider_fee to 0 for existing bookings if null
UPDATE bookings 
SET service_fee = 0 
WHERE service_fee IS NULL;

UPDATE bookings 
SET provider_fee = 0 
WHERE provider_fee IS NULL;

-- Add index for efficient querying of expired bookings
CREATE INDEX IF NOT EXISTS idx_bookings_payment_deadline 
ON bookings(payment_deadline) 
WHERE payment_status = 'pending';

-- Add comment for documentation
COMMENT ON COLUMN bookings.payment_deadline IS 'Deadline for payment completion. Booking is cancelled if payment not completed by this time. Default: 2 hours from created_at';

-- ============================================
-- FUNCTION: Auto-cancel expired bookings
-- ============================================

-- Function to cancel bookings that have passed their payment deadline
CREATE OR REPLACE FUNCTION cancel_expired_bookings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Cancel bookings where payment deadline has passed and payment is still pending
  UPDATE bookings
  SET 
    status = 'cancelled',
    payment_status = 'refunded'
  WHERE 
    payment_status = 'pending'
    AND payment_deadline IS NOT NULL
    AND payment_deadline < NOW()
    AND status != 'cancelled';
    
  -- Log the number of cancelled bookings (optional)
  -- You can add logging here if needed
END;
$$;

-- ============================================
-- TRIGGER: Set payment deadline on booking creation
-- ============================================

-- Function to automatically set payment deadline when booking is created
CREATE OR REPLACE FUNCTION set_payment_deadline()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Set payment deadline to 2 hours from creation if not already set
  IF NEW.payment_deadline IS NULL AND NEW.payment_status = 'pending' THEN
    NEW.payment_deadline := NEW.created_at + INTERVAL '2 hours';
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to automatically set payment deadline
DROP TRIGGER IF EXISTS trigger_set_payment_deadline ON bookings;
CREATE TRIGGER trigger_set_payment_deadline
  BEFORE INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION set_payment_deadline();

-- ============================================
-- COMPLETED
-- ============================================
-- Payment deadline system is now set up!
-- 
-- Next steps:
-- 1. Set up a cron job or scheduled function to run cancel_expired_bookings()
-- 2. In Supabase, you can use pg_cron extension or Edge Functions
-- 3. Recommended: Run cancel_expired_bookings() every 5-10 minutes

