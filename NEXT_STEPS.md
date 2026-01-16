# Next Steps - Trip-Based Booking System

## ✅ Completed
- [x] Created migration script to update trips table schema
- [x] Updated database queries to support new schema
- [x] Created SelectTripScreen for mobile app
- [x] Updated booking flow to show trips with dates/times
- [x] Updated BookingContext to store trip_id
- [x] Fixed check constraint for trip status

## 🔧 Immediate Actions Required

### 1. Run Database Migration
**Priority: HIGH - Required before testing**

Run the migration script in Supabase:
1. Open Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `database/14_update_trips_table.sql`
3. Execute the script
4. Verify the migration succeeded (check for errors)

**What it does:**
- Adds `provider_id`, `departure_date`, `return_date` columns
- Renames `total_seats` to `max_seats`
- Updates status constraint to allow `'upcoming'`, `'ongoing'`, `'completed'`, `'cancelled'`
- Migrates existing `'active'` status to `'upcoming'`

### 2. Test Provider Dashboard Trip Creation
**Priority: HIGH**

1. Log into provider dashboard
2. Navigate to "My Trips" → "New Trip"
3. Create a test trip with:
   - Select a church
   - Choose trip type (group/private/holiday)
   - Set departure date and time
   - Set return date (if round trip)
   - Set price and max seats
4. Verify trip is created successfully
5. Check that trip appears in trips list

**Expected behavior:**
- Trip should save with `status: 'upcoming'`
- Trip should be visible in provider's trip list
- Trip should show correct dates and times

### 3. Test Mobile App Trip Selection
**Priority: HIGH**

1. Open mobile app
2. Navigate to a church detail page
3. Click "Book Trip"
4. Verify you see the new "Select Trip" screen (not SelectProvider)
5. Check that trips show:
   - Departure date and time
   - Return date and time (if applicable)
   - Provider information
   - Available seats
   - Price
6. Select a trip and continue booking

**Expected behavior:**
- Should see all available trips for the selected church
- Each trip should display provider info, dates, times, and pricing
- Should be able to select a trip and proceed to pickup station selection

### 4. Test Complete Booking Flow
**Priority: MEDIUM**

1. Complete a full booking from mobile app:
   - Select church → Select trip → Select pickup station → Select seats → Payment
2. Verify booking is created with:
   - `trip_id` is set correctly
   - `provider_id` is set from trip
   - All booking details are correct
3. Check booking appears in:
   - User's booking history
   - Provider's booking list
   - Admin dashboard

## 🐛 Potential Issues to Watch For

### Database Issues
- [ ] Check if `departure_date` column exists after migration
- [ ] Verify `provider_id` foreign key constraint works
- [ ] Ensure status constraint allows all required values
- [ ] Check that existing trips were migrated correctly

### Mobile App Issues
- [ ] Verify trips load correctly for selected church
- [ ] Check date/time formatting displays properly
- [ ] Ensure provider info shows correctly
- [ ] Verify trip selection updates booking context
- [ ] Test with churches that have no trips (empty state)

### Provider Dashboard Issues
- [ ] Verify trip creation form works
- [ ] Check that trips list shows new columns
- [ ] Ensure date/time inputs work correctly
- [ ] Verify round trip vs one-way trip handling

### Booking Issues
- [ ] Verify `trip_id` is saved in bookings table
- [ ] Check that booking price matches trip price
- [ ] Ensure available seats decrease when booking is made
- [ ] Verify booking cancellation updates trip seats

## 🔄 Future Enhancements (Optional)

### Short-term
- [ ] Add trip filtering by date range in mobile app
- [ ] Add trip search functionality
- [ ] Show trip capacity/availability more prominently
- [ ] Add trip cancellation for providers
- [ ] Add trip editing functionality

### Medium-term
- [ ] Implement trip recurring schedules
- [ ] Add bulk trip creation
- [ ] Add trip templates
- [ ] Implement trip notifications
- [ ] Add trip reviews/ratings

### Long-term
- [ ] Add trip waitlist functionality
- [ ] Implement dynamic pricing
- [ ] Add trip packages/bundles
- [ ] Add trip sharing features

## 📝 Testing Checklist

### Provider Dashboard
- [ ] Can create new trip
- [ ] Can view trips list
- [ ] Can see trip details (dates, times, seats)
- [ ] Can see bookings for each trip
- [ ] Trip status updates correctly

### Mobile App
- [ ] Can see trips for selected church
- [ ] Trip cards display all information correctly
- [ ] Can select a trip
- [ ] Booking flow continues correctly after trip selection
- [ ] Booking includes correct trip_id

### Database
- [ ] Migration script runs without errors
- [ ] All columns exist and have correct types
- [ ] Constraints work correctly
- [ ] Foreign keys are properly set up
- [ ] Indexes are created for performance

## 🚨 If Something Goes Wrong

### Migration Fails
1. Check Supabase logs for specific error
2. Verify you have proper permissions
3. Check if any existing data conflicts
4. Try running migration steps individually

### Trips Don't Show in Mobile App
1. Verify trips exist in database
2. Check `church_id` matches
3. Verify trip `status` is `'upcoming'` or `'active'`
4. Check `available_seats > 0`
5. Check console for errors in `getTrips()` function

### Booking Creation Fails
1. Verify `trip_id` is valid UUID
2. Check trip exists and has available seats
3. Verify user profile is complete
4. Check booking context has all required data
5. Review Supabase error logs

## 📞 Support Resources

- Supabase Dashboard: Check logs and database structure
- React Native Debugger: For mobile app debugging
- Next.js Dev Tools: For provider dashboard debugging
- Database Schema: `database/14_update_trips_table.sql`

---

**Last Updated:** After migration script fix
**Status:** Ready for testing















