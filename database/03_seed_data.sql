-- ============================================
-- TANKUA SAMPLE DATA
-- Step 3: Seed database with Ethiopian churches, pickup stations, and drivers
-- ============================================

-- ============================================
-- SEED ETHIOPIAN CHURCHES
-- ============================================
INSERT INTO churches (name, description, region, city, distance, images, tags, location) VALUES
  (
    'የዳብረ ብርሃን ቅዱስ ሥላሴ ቤተክርስቲያን',
    'Historic Ethiopian Orthodox church in the heart of Addis Ababa, known for its beautiful architecture and spiritual significance.',
    'Addis Ababa',
    'Addis Ababa',
    5.2,
    ARRAY['https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800'],
    ARRAY['Historic', 'Orthodox', 'City Center'],
    '{"lat": 9.0320, "lng": 38.7469}'::jsonb
  ),
  (
    'ላሊበላ የመስቀል ቤተክርስቲያን',
    'UNESCO World Heritage Site featuring rock-hewn churches dating back to the 12th century. A pilgrimage destination for Ethiopian Orthodox Christians.',
    'Amhara',
    'Lalibela',
    642.3,
    ARRAY['https://images.unsplash.com/photo-1578922746317-aac19659f663?w=800'],
    ARRAY['UNESCO', 'Historic', 'Pilgrimage', 'Rock-Hewn'],
    '{"lat": 12.0316, "lng": 39.0476}'::jsonb
  ),
  (
    'የአክሱም ጽዮን ቅድስተ ቅዱሳን ቤተክርስቲያን',
    'Ancient church in Axum believed to house the Ark of the Covenant. One of the most sacred sites in Ethiopian Orthodox Christianity.',
    'Tigray',
    'Axum',
    1024.8,
    ARRAY['https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800'],
    ARRAY['Ancient', 'Sacred', 'Ark of Covenant', 'Orthodox'],
    '{"lat": 14.1311, "lng": 38.7169}'::jsonb
  ),
  (
    'የባሕር ዳር ጊዮርጊስ ቤተክርስቲያን',
    'Beautiful church overlooking Lake Tana, surrounded by ancient monasteries and natural beauty.',
    'Amhara',
    'Bahir Dar',
    564.5,
    ARRAY['https://images.unsplash.com/photo-1605106901227-991bd663255c?w=800'],
    ARRAY['Lake Tana', 'Scenic', 'Orthodox', 'Monasteries'],
    '{"lat": 11.5931, "lng": 37.3896}'::jsonb
  ),
  (
    'የጎንደር ደብረ ብርሃን ሥላሴ ቤተክርስቲያን',
    'Historic church in the royal city of Gondar, featuring stunning frescoes and traditional Ethiopian architecture.',
    'Amhara',
    'Gondar',
    738.2,
    ARRAY['https://images.unsplash.com/photo-1578922746317-aac19659f663?w=800'],
    ARRAY['Royal City', 'Historic', 'Frescoes', 'Orthodox'],
    '{"lat": 12.6092, "lng": 37.4661}'::jsonb
  );

-- ============================================
-- SEED PICKUP STATIONS (Addis Ababa)
-- ============================================
INSERT INTO pickup_stations (name, city, address, lat, lng) VALUES
  ('Meskel Square', 'Addis Ababa', 'Meskel Square, Addis Ababa', 9.0092, 38.7635),
  ('Bole International Airport', 'Addis Ababa', 'Bole Road, Addis Ababa', 8.9806, 38.7991),
  ('Piazza', 'Addis Ababa', 'Piazza, Addis Ababa', 9.0339, 38.7507),
  ('Mexico Square', 'Addis Ababa', 'Mexico Square, Addis Ababa', 9.0158, 38.7573),
  ('Kality', 'Addis Ababa', 'Kality, Addis Ababa', 8.9183, 38.7317),
  ('Merkato', 'Addis Ababa', 'Merkato, Addis Ababa', 9.0145, 38.7245),
  ('CMC', 'Addis Ababa', 'CMC, Addis Ababa', 9.0436, 38.7635);

-- ============================================
-- SEED SAMPLE DRIVERS
-- ============================================
INSERT INTO drivers (name, phone, vehicle_type, plate_number, license_number, status) VALUES
  ('Abebe Kebede', '+251911234567', 'bus', '3-12345', 'ETH-DL-123456', 'active'),
  ('Tigist Alemu', '+251922345678', 'van', '3-23456', 'ETH-DL-234567', 'active'),
  ('Dawit Tesfaye', '+251933456789', 'suv', '3-34567', 'ETH-DL-345678', 'active'),
  ('Mekdes Hailu', '+251944567890', 'bus', '3-45678', 'ETH-DL-456789', 'active'),
  ('Yohannes Assefa', '+251955678901', 'van', '3-56789', 'ETH-DL-567890', 'active');

-- ============================================
-- COMPLETED
-- ============================================
-- Sample data added successfully!
-- You now have:
-- - 5 Ethiopian churches (Addis Ababa, Lalibela, Axum, Bahir Dar, Gondar)
-- - 7 pickup stations in Addis Ababa
-- - 5 sample drivers
--
-- Next (Optional): Run 04_create_sample_trips.sql to create trips with linked stations

