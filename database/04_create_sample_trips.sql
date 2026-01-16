-- ============================================
-- TANKUA SAMPLE TRIPS
-- Step 4 (Optional): Create sample trips with linked pickup stations
-- ============================================

-- This script creates sample trips for testing the booking flow
-- It links pickup stations to trips with custom pickup times and prices

DO $$
DECLARE
  -- Church IDs
  church_id_addis UUID;
  church_id_lalibela UUID;
  church_id_axum UUID;
  church_id_bahir_dar UUID;
  church_id_gondar UUID;
  
  -- Station IDs
  station_meskel UUID;
  station_bole UUID;
  station_piazza UUID;
  station_mexico UUID;
  station_kality UUID;
  
  -- Trip IDs
  trip_id1 UUID;
  trip_id2 UUID;
  trip_id3 UUID;
  trip_id4 UUID;
  trip_id5 UUID;
  
BEGIN
  -- ============================================
  -- GET CHURCH IDs
  -- ============================================
  SELECT id INTO church_id_addis FROM churches WHERE city = 'Addis Ababa' LIMIT 1;
  SELECT id INTO church_id_lalibela FROM churches WHERE city = 'Lalibela' LIMIT 1;
  SELECT id INTO church_id_axum FROM churches WHERE city = 'Axum' LIMIT 1;
  SELECT id INTO church_id_bahir_dar FROM churches WHERE city = 'Bahir Dar' LIMIT 1;
  SELECT id INTO church_id_gondar FROM churches WHERE city = 'Gondar' LIMIT 1;
  
  -- ============================================
  -- GET STATION IDs
  -- ============================================
  SELECT id INTO station_meskel FROM pickup_stations WHERE name = 'Meskel Square';
  SELECT id INTO station_bole FROM pickup_stations WHERE name = 'Bole International Airport';
  SELECT id INTO station_piazza FROM pickup_stations WHERE name = 'Piazza';
  SELECT id INTO station_mexico FROM pickup_stations WHERE name = 'Mexico Square';
  SELECT id INTO station_kality FROM pickup_stations WHERE name = 'Kality';
  
  -- ============================================
  -- TRIP 1: Addis Ababa Church (Group Trip)
  -- ============================================
  INSERT INTO trips (church_id, trip_type, date, price, available_seats, total_seats, itinerary, status)
  VALUES (
    church_id_addis,
    'group',
    CURRENT_DATE + INTERVAL '7 days',
    500,
    45,
    50,
    'Departure at 6:00 AM from selected pickup station. Guided tour of the historic church, traditional coffee ceremony, lunch included. Return journey at 4:00 PM.',
    'active'
  )
  RETURNING id INTO trip_id1;
  
  -- Link stations to Trip 1
  INSERT INTO trip_pickup_stations (trip_id, station_id, pickup_time, extra_price) VALUES
    (trip_id1, station_meskel, '5:30 AM', 0),
    (trip_id1, station_piazza, '5:45 AM', 0),
    (trip_id1, station_mexico, '6:00 AM', 25);
  
  -- ============================================
  -- TRIP 2: Lalibela (Holiday Trip)
  -- ============================================
  INSERT INTO trips (church_id, trip_type, date, price, available_seats, total_seats, itinerary, status)
  VALUES (
    church_id_lalibela,
    'holiday',
    CURRENT_DATE + INTERVAL '14 days',
    750,
    30,
    35,
    'Special 3-day pilgrimage to Lalibela rock-hewn churches. Includes accommodation, meals, guided tours, and spiritual ceremonies. UNESCO World Heritage Site visit.',
    'active'
  )
  RETURNING id INTO trip_id2;
  
  -- Link stations to Trip 2
  INSERT INTO trip_pickup_stations (trip_id, station_id, pickup_time, extra_price) VALUES
    (trip_id2, station_meskel, '4:30 AM', 0),
    (trip_id2, station_bole, '4:45 AM', 50),
    (trip_id2, station_piazza, '5:00 AM', 25);
  
  -- ============================================
  -- TRIP 3: Axum (Group Trip)
  -- ============================================
  INSERT INTO trips (church_id, trip_type, date, price, available_seats, total_seats, itinerary, status)
  VALUES (
    church_id_axum,
    'group',
    CURRENT_DATE + INTERVAL '21 days',
    900,
    40,
    45,
    '4-day journey to ancient Axum. Visit the Church of St. Mary of Zion, ancient stelae, and archaeological sites. Includes accommodation, meals, and expert guide.',
    'active'
  )
  RETURNING id INTO trip_id3;
  
  -- Link stations to Trip 3
  INSERT INTO trip_pickup_stations (trip_id, station_id, pickup_time, extra_price) VALUES
    (trip_id3, station_meskel, '4:00 AM', 0),
    (trip_id3, station_bole, '4:15 AM', 100),
    (trip_id3, station_mexico, '4:30 AM', 50);
  
  -- ============================================
  -- TRIP 4: Bahir Dar (Private Trip)
  -- ============================================
  INSERT INTO trips (church_id, trip_type, date, price, available_seats, total_seats, itinerary, status)
  VALUES (
    church_id_bahir_dar,
    'private',
    CURRENT_DATE + INTERVAL '10 days',
    1500,
    7,
    7,
    'Private family trip to Lake Tana monasteries and Bahir Dar churches. Customizable itinerary, private vehicle and guide. 2-day journey with lakeside accommodation.',
    'active'
  )
  RETURNING id INTO trip_id4;
  
  -- Link stations to Trip 4
  INSERT INTO trip_pickup_stations (trip_id, station_id, pickup_time, extra_price) VALUES
    (trip_id4, station_meskel, '5:00 AM', 0),
    (trip_id4, station_bole, '5:15 AM', 150),
    (trip_id4, station_kality, '5:30 AM', 200);
  
  -- ============================================
  -- TRIP 5: Gondar (Holiday Trip)
  -- ============================================
  INSERT INTO trips (church_id, trip_type, date, price, available_seats, total_seats, itinerary, status)
  VALUES (
    church_id_gondar,
    'holiday',
    CURRENT_DATE + INTERVAL '28 days',
    850,
    35,
    40,
    'Holiday journey to the royal city of Gondar. Visit Debre Birhan Selassie Church with its famous ceiling frescoes, Fasil Ghebbi royal enclosure. 3-day trip with cultural immersion.',
    'active'
  )
  RETURNING id INTO trip_id5;
  
  -- Link stations to Trip 5
  INSERT INTO trip_pickup_stations (trip_id, station_id, pickup_time, extra_price) VALUES
    (trip_id5, station_meskel, '4:30 AM', 0),
    (trip_id5, station_piazza, '4:45 AM', 25),
    (trip_id5, station_bole, '5:00 AM', 75),
    (trip_id5, station_mexico, '5:15 AM', 50);
  
  RAISE NOTICE 'Successfully created 5 sample trips with linked pickup stations!';
  
END $$;

-- ============================================
-- COMPLETED
-- ============================================
-- Sample trips created successfully!
--
-- Created:
-- - Trip to Addis Ababa church (7 days from now, Group)
-- - Trip to Lalibela (14 days, Holiday, 3-day pilgrimage)
-- - Trip to Axum (21 days, Group, 4-day journey)
-- - Trip to Bahir Dar (10 days, Private, 2-day trip)
-- - Trip to Gondar (28 days, Holiday, 3-day trip)
--
-- Each trip has 3-4 pickup stations linked with custom times and prices
--
-- Your database is now fully seeded and ready to use!
-- Run your app and start testing the booking flow!

