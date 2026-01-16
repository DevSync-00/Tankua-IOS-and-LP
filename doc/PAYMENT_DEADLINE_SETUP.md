# Payment Deadline System Setup

This document explains the 2-hour payment deadline system for bookings.

## Overview

When a user creates a booking, they have **2 hours** to complete payment. If payment is not completed within this time:
- The booking is automatically cancelled
- The seat is released and made available again
- The user loses their reservation

## Database Setup

### 1. Run the Migration

Execute the SQL script to add the payment deadline column:

```sql
-- Run this in Supabase SQL Editor
\i database/05_add_payment_deadline.sql
```

This will:
- Add `payment_deadline` column to `bookings` table
- Create a trigger to automatically set deadline (2 hours from creation)
- Create a function to cancel expired bookings
- Add an index for efficient querying

### 2. Set Up Automatic Cancellation

Choose one of these methods:

#### Option A: Supabase Edge Function (Recommended)

1. Create an Edge Function in Supabase:
   ```bash
   supabase functions new cancel-expired-bookings
   ```

2. Implement the function to call `cancel_expired_bookings()`

3. Schedule it using:
   - External cron service (cron-job.org, EasyCron)
   - Supabase scheduled functions (if available)
   - Run every 5-10 minutes

#### Option B: pg_cron Extension

If your Supabase instance supports pg_cron:

```sql
SELECT cron.schedule(
  'cancel-expired-bookings',
  '*/5 * * * *',  -- Every 5 minutes
  $$SELECT cancel_expired_bookings()$$
);
```

#### Option C: Manual/Testing

For development, you can manually run:

```sql
SELECT cancel_expired_bookings();
```

## How It Works

### Booking Creation

1. User completes booking flow
2. Booking is created with:
   - `payment_status: 'pending'`
   - `payment_deadline: NOW() + 2 hours` (set automatically by trigger)
   - `status: 'confirmed'`

### Payment Screen

1. **Countdown Timer**: Shows time remaining (HH:MM:SS)
2. **Urgent Warning**: Turns red when less than 10 minutes remaining
3. **Expiration Check**: Validates booking before processing payment
4. **Auto-Update**: Timer updates every second

### Automatic Cancellation

The `cancel_expired_bookings()` function:
- Finds all bookings where `payment_deadline < NOW()` and `payment_status = 'pending'`
- Updates them to:
  - `status: 'cancelled'`
  - `payment_status: 'refunded'`
- Releases the seats (if seat tracking is implemented)

## User Experience

### During Payment

- **Timer Display**: Shows countdown at top of payment screen
- **Visual Warning**: Card turns red when < 10 minutes remaining
- **Urgent Message**: "Payment Due Soon!" when < 10 minutes
- **Expiration Alert**: Clear message if booking expires

### After Expiration

- **Automatic Cancellation**: Booking is cancelled automatically
- **User Notification**: Alert shown explaining cancellation
- **Seat Release**: Seat becomes available for other users
- **Navigation**: User redirected to home screen

## Monitoring

### Check Expiring Bookings

```sql
SELECT 
  id,
  user_id,
  church_name,
  payment_deadline,
  payment_deadline - NOW() as time_remaining
FROM bookings
WHERE 
  payment_status = 'pending'
  AND payment_deadline > NOW()
  AND payment_deadline < NOW() + INTERVAL '10 minutes'
ORDER BY payment_deadline ASC;
```

### Check Overdue Bookings

```sql
SELECT 
  id,
  user_id,
  church_name,
  payment_deadline,
  NOW() - payment_deadline as time_overdue
FROM bookings
WHERE 
  payment_status = 'pending'
  AND payment_deadline < NOW()
  AND status != 'cancelled'
ORDER BY payment_deadline ASC;
```

## Testing

### Test Scenarios

1. **Normal Payment**: Complete payment within 2 hours ✅
2. **Late Payment**: Try to pay after 2 hours ❌
3. **Timer Display**: Verify countdown updates correctly ✅
4. **Urgent Warning**: Check red warning at < 10 minutes ✅
5. **Auto-Cancellation**: Verify booking cancels after deadline ✅

### Manual Testing

1. Create a booking
2. Note the `payment_deadline` in database
3. Wait or manually set deadline to past time
4. Run `SELECT cancel_expired_bookings();`
5. Verify booking status changed to 'cancelled'

## Configuration

### Change Deadline Duration

To change from 2 hours to a different duration:

1. Update the trigger function:
```sql
CREATE OR REPLACE FUNCTION set_payment_deadline()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.payment_deadline IS NULL AND NEW.payment_status = 'pending' THEN
    -- Change '2 hours' to your desired duration
    NEW.payment_deadline := NEW.created_at + INTERVAL '2 hours';
  END IF;
  RETURN NEW;
END;
$$;
```

2. Update BookingContext.js:
```javascript
paymentDeadline.setHours(paymentDeadline.getHours() + 2); // Change 2 to your hours
```

## Troubleshooting

### Bookings Not Cancelling

1. Check if cron job/function is running
2. Verify `cancel_expired_bookings()` function exists
3. Check database logs for errors
4. Manually run the function to test

### Timer Not Updating

1. Check if `payment_deadline` is set in booking
2. Verify `useEffect` cleanup is working
3. Check for JavaScript errors in console

### Payment Still Processing After Expiration

1. Verify `verifyBookingBeforePayment()` is called
2. Check booking validation logic
3. Ensure payment gateway handles expired bookings

## Security Considerations

- **Server-Side Validation**: Always validate booking status on backend
- **Race Conditions**: Handle concurrent payment attempts
- **Seat Locking**: Implement proper seat reservation system
- **Refund Policy**: Document refund policy for cancelled bookings

## Next Steps

1. ✅ Run database migration
2. ✅ Set up automatic cancellation
3. ✅ Test payment deadline flow
4. ✅ Monitor expired bookings
5. ✅ Set up alerts for failed cancellations

