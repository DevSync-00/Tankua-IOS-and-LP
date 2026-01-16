-- ============================================
-- SETUP AUTOMATIC BOOKING CANCELLATION
-- This sets up a cron job to automatically cancel expired bookings
-- ============================================

-- Note: This requires the pg_cron extension
-- Enable pg_cron extension (if not already enabled)
-- You may need to enable this in Supabase dashboard or contact support

-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============================================
-- OPTION 1: Using pg_cron (if available)
-- ============================================

-- Schedule job to run every 5 minutes
-- This will automatically cancel bookings that have passed their payment deadline

-- SELECT cron.schedule(
--   'cancel-expired-bookings',           -- Job name
--   '*/5 * * * *',                       -- Every 5 minutes
--   $$SELECT cancel_expired_bookings()$$ -- Function to run
-- );

-- ============================================
-- OPTION 2: Using Supabase Edge Functions (Recommended)
-- ============================================

-- Instead of using pg_cron, you can create a Supabase Edge Function
-- and schedule it using external cron services (like cron-job.org, EasyCron, etc.)
-- or use Supabase's scheduled functions (if available)

-- Edge Function example code is in: supabase/functions/cancel-expired-bookings/index.ts

-- ============================================
-- OPTION 3: Manual Check (For Development)
-- ============================================

-- You can manually run this function to cancel expired bookings:
-- SELECT cancel_expired_bookings();

-- ============================================
-- MONITORING
-- ============================================

-- Check how many bookings are about to expire (within next 10 minutes)
-- SELECT 
--   id,
--   user_id,
--   church_name,
--   payment_deadline,
--   NOW() as current_time,
--   payment_deadline - NOW() as time_remaining
-- FROM bookings
-- WHERE 
--   payment_status = 'pending'
--   AND payment_deadline IS NOT NULL
--   AND payment_deadline > NOW()
--   AND payment_deadline < NOW() + INTERVAL '10 minutes'
-- ORDER BY payment_deadline ASC;

-- Check expired bookings that haven't been cancelled yet
-- SELECT 
--   id,
--   user_id,
--   church_name,
--   payment_deadline,
--   payment_status,
--   status,
--   NOW() - payment_deadline as time_overdue
-- FROM bookings
-- WHERE 
--   payment_status = 'pending'
--   AND payment_deadline IS NOT NULL
--   AND payment_deadline < NOW()
--   AND status != 'cancelled'
-- ORDER BY payment_deadline ASC;

-- ============================================
-- COMPLETED
-- ============================================
-- 
-- Next Steps:
-- 1. Choose one of the cancellation methods above
-- 2. Set up the automatic cancellation system
-- 3. Monitor expired bookings regularly
-- 4. Test the cancellation flow

