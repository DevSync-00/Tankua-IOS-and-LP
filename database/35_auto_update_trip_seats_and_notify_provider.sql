-- ============================================
-- AUTO-UPDATE TRIP SEATS AND NOTIFY PROVIDER
-- When a booking is created or paid, update trip seats and notify provider
-- ============================================

-- Function to update trip available_seats when booking is created
CREATE OR REPLACE FUNCTION update_trip_seats_on_booking()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update seats if booking has a trip_id and is confirmed
  IF NEW.trip_id IS NOT NULL AND NEW.status = 'confirmed' THEN
    -- Decrement available_seats
    UPDATE trips
    SET available_seats = GREATEST(0, available_seats - NEW.seats)
    WHERE id = NEW.trip_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to notify provider when booking is created or paid
CREATE OR REPLACE FUNCTION notify_provider_on_booking()
RETURNS TRIGGER AS $$
DECLARE
  provider_owner_id UUID;
  notification_title TEXT;
  notification_message TEXT;
BEGIN
  -- Only notify if booking has a provider_id
  IF NEW.provider_id IS NOT NULL THEN
    -- Get the provider owner's user ID
    SELECT id INTO provider_owner_id
    FROM provider_users
    WHERE provider_id = NEW.provider_id
      AND role = 'owner'
      AND is_active = TRUE
    LIMIT 1;
    
    -- Only create notification if we found a provider owner
    IF provider_owner_id IS NOT NULL THEN
      -- Determine notification content based on payment status
      IF NEW.payment_status = 'paid' THEN
        notification_title := 'New Paid Booking';
        notification_message := format('A customer booked %s seat(s) for %s. Payment received: %s ETB', 
          NEW.seats, 
          COALESCE(NEW.destination_name, 'your trip'),
          NEW.total_price
        );
      ELSE
        notification_title := 'New Booking (Pending Payment)';
        notification_message := format('A customer booked %s seat(s) for %s. Total: %s ETB (payment pending)', 
          NEW.seats, 
          COALESCE(NEW.destination_name, 'your trip'),
          NEW.total_price
        );
      END IF;
      
      -- Create notification for provider owner
      INSERT INTO notifications (
        recipient_type,
        recipient_id,
        title,
        message,
        type,
        data,
        action_url
      ) VALUES (
        'provider',
        provider_owner_id,
        notification_title,
        notification_message,
        'booking',
        jsonb_build_object(
          'booking_id', NEW.id,
          'provider_id', NEW.provider_id,
          'seats', NEW.seats,
          'total_price', NEW.total_price,
          'payment_status', NEW.payment_status,
          'destination_name', NEW.destination_name
        ),
        format('/dashboard/bookings?booking=%s', NEW.id)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update seats when payment status changes to 'paid'
CREATE OR REPLACE FUNCTION update_trip_seats_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- If payment status changed to 'paid' and booking is confirmed
  IF NEW.payment_status = 'paid' 
     AND OLD.payment_status != 'paid' 
     AND NEW.status = 'confirmed'
     AND NEW.trip_id IS NOT NULL THEN
    -- Ensure seats are decremented (in case booking was created before this trigger existed)
    UPDATE trips
    SET available_seats = GREATEST(0, available_seats - NEW.seats)
    WHERE id = NEW.trip_id
      AND available_seats >= NEW.seats; -- Only update if enough seats available
  END IF;
  
  -- If payment status changed from 'paid' to something else (refund/cancellation)
  -- This is handled by the cancellation function, but we'll add it here for safety
  IF OLD.payment_status = 'paid' 
     AND NEW.payment_status != 'paid'
     AND NEW.trip_id IS NOT NULL THEN
    -- Release seats back (only if booking is cancelled)
    IF NEW.status = 'cancelled' THEN
      UPDATE trips
      SET available_seats = LEAST(max_seats, available_seats + NEW.seats)
      WHERE id = NEW.trip_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_trip_seats_on_booking ON bookings;
CREATE TRIGGER trigger_update_trip_seats_on_booking
  AFTER INSERT ON bookings
  FOR EACH ROW
  WHEN (NEW.status = 'confirmed' AND NEW.trip_id IS NOT NULL)
  EXECUTE FUNCTION update_trip_seats_on_booking();

DROP TRIGGER IF EXISTS trigger_notify_provider_on_booking ON bookings;
CREATE TRIGGER trigger_notify_provider_on_booking
  AFTER INSERT ON bookings
  FOR EACH ROW
  WHEN (NEW.provider_id IS NOT NULL)
  EXECUTE FUNCTION notify_provider_on_booking();

DROP TRIGGER IF EXISTS trigger_update_trip_seats_on_payment ON bookings;
CREATE TRIGGER trigger_update_trip_seats_on_payment
  AFTER UPDATE OF payment_status ON bookings
  FOR EACH ROW
  WHEN (NEW.trip_id IS NOT NULL)
  EXECUTE FUNCTION update_trip_seats_on_payment();

-- Also notify provider when payment status changes to 'paid'
CREATE OR REPLACE FUNCTION notify_provider_on_payment()
RETURNS TRIGGER AS $$
DECLARE
  provider_owner_id UUID;
BEGIN
  -- Notify when payment status changes to 'paid'
  IF NEW.payment_status = 'paid' 
     AND OLD.payment_status != 'paid'
     AND NEW.provider_id IS NOT NULL THEN
    -- Get the provider owner's user ID
    SELECT id INTO provider_owner_id
    FROM provider_users
    WHERE provider_id = NEW.provider_id
      AND role = 'owner'
      AND is_active = TRUE
    LIMIT 1;
    
    IF provider_owner_id IS NOT NULL THEN
      INSERT INTO notifications (
        recipient_type,
        recipient_id,
        title,
        message,
        type,
        data,
        action_url
      ) VALUES (
        'provider',
        provider_owner_id,
        'Payment Received',
        format('Payment of %s ETB received for booking %s (%s seat(s))', 
          NEW.total_price,
          LEFT(NEW.id::text, 8),
          NEW.seats
        ),
        'payment',
        jsonb_build_object(
          'booking_id', NEW.id,
          'provider_id', NEW.provider_id,
          'amount', NEW.total_price,
          'seats', NEW.seats
        ),
        format('/dashboard/bookings?booking=%s', NEW.id)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_provider_on_payment ON bookings;
CREATE TRIGGER trigger_notify_provider_on_payment
  AFTER UPDATE OF payment_status ON bookings
  FOR EACH ROW
  WHEN (NEW.provider_id IS NOT NULL AND NEW.payment_status = 'paid' AND OLD.payment_status != 'paid')
  EXECUTE FUNCTION notify_provider_on_payment();

-- ============================================
-- BACKFILL: Update seats for existing bookings
-- ============================================
-- This ensures existing paid/confirmed bookings are reflected in trip seat counts
DO $$
DECLARE
  trip_record RECORD;
BEGIN
  FOR trip_record IN
    SELECT 
      t.id as trip_id,
      t.max_seats,
      COALESCE(SUM(CASE WHEN b.status = 'confirmed' THEN b.seats ELSE 0 END), 0) as booked_seats
    FROM trips t
    LEFT JOIN bookings b ON b.trip_id = t.id
    GROUP BY t.id, t.max_seats
  LOOP
    UPDATE trips
    SET available_seats = GREATEST(0, trip_record.max_seats - trip_record.booked_seats)
    WHERE id = trip_record.trip_id;
  END LOOP;
END $$;

-- ============================================
-- COMPLETED
-- ============================================
-- Triggers created:
-- 1. update_trip_seats_on_booking: Decrements available_seats when booking is created
-- 2. notify_provider_on_booking: Sends notification to provider owner when booking is created
-- 3. update_trip_seats_on_payment: Ensures seats are decremented when payment is confirmed
-- 4. notify_provider_on_payment: Sends notification when payment is received
--
-- Existing bookings have been backfilled to update trip seat counts
