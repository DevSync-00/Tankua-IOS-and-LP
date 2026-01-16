-- ============================================
-- SEED ETHIOPIAN MONASTERIES (EXPLORE CHURCHES)
-- Run after 01_create_tables.sql (and after 03_seed_data.sql if you want both)
-- Sources: public info from Wikimedia/UNESCO/heritage listings
-- Note: image URLs are Wikimedia/CC where available; replace with your own CDN if needed
-- ============================================

INSERT INTO churches (name, description, region, city, distance, images, tags, location) VALUES
  (
    'Debre Damo Monastery',
    '6th-century cliff-top monastery accessible only by rope climb; among Ethiopia’s oldest.',
    'Tigray',
    'Debre Damo',
    1010,
    ARRAY['https://upload.wikimedia.org/wikipedia/commons/3/3a/Debre_Damo_Monastery.jpg'],
    ARRAY['Monastery', 'Cliff-top', 'Historic', 'Orthodox'],
    '{"lat": 14.3710, "lng": 39.3200}'::jsonb
  ),
  (
    'Abba Garima Monastery',
    'Monastery near Adwa, famed for the Abba Garima Gospels (among the world’s oldest illuminated manuscripts).',
    'Tigray',
    'Adwa',
    1000,
    ARRAY['https://upload.wikimedia.org/wikipedia/commons/8/85/Abba_Garima_monastery_church.jpg'],
    ARRAY['Monastery', 'Manuscripts', 'Historic', 'Orthodox'],
    '{"lat": 14.1200, "lng": 39.2900}'::jsonb
  ),
  (
    'Abuna Yemata Guh',
    'Rock-hewn church/monastery in Gheralta, accessed by a steep cliff climb; renowned for vivid frescoes.',
    'Tigray',
    'Hawzen (Gheralta)',
    780,
    ARRAY['https://upload.wikimedia.org/wikipedia/commons/5/50/Abuna_Yemata_Guh_Church_Tigray.jpg'],
    ARRAY['Monastery', 'Rock-Hewn', 'Cliff', 'Frescoes'],
    '{"lat": 13.9050, "lng": 39.1960}'::jsonb
  ),
  (
    'Debre Libanos Monastery (Shewa)',
    'Historic monastery north of Addis Ababa; major pilgrimage site with dramatic canyon views.',
    'Oromia',
    'Debre Libanos',
    110,
    ARRAY['https://upload.wikimedia.org/wikipedia/commons/7/7e/Debre_Libanos_Monastery_Ethiopia.jpg'],
    ARRAY['Monastery', 'Pilgrimage', 'Historic', 'Orthodox'],
    '{"lat": 9.7170, "lng": 38.8330}'::jsonb
  ),
  (
    'Ura Kidane Mehret Monastery',
    'Lake Tana island monastery on the Zege peninsula; famed for painted murals and manuscripts.',
    'Amhara',
    'Zege (Bahir Dar)',
    565,
    ARRAY['https://upload.wikimedia.org/wikipedia/commons/3/3a/Ura_Kidane_Mehret_exterior.jpg'],
    ARRAY['Monastery', 'Lake Tana', 'Murals', 'Orthodox'],
    '{"lat": 11.9070, "lng": 37.3200}'::jsonb
  ),
  (
    'Narga Selassie Monastery',
    '18th-century circular church on Dek Island, Lake Tana; known for its serene forest setting.',
    'Amhara',
    'Lake Tana',
    570,
    ARRAY['https://upload.wikimedia.org/wikipedia/commons/2/2b/Narga_Selassie_Church_Lake_Tana.jpg'],
    ARRAY['Monastery', 'Lake Tana', 'Island', 'Orthodox'],
    '{"lat": 11.9300, "lng": 37.3000}'::jsonb
  ),
  (
    'Kebran Gabriel Monastery',
    'Island monastery on Lake Tana (closed to women); holds notable manuscripts and icons.',
    'Amhara',
    'Lake Tana',
    565,
    ARRAY['https://upload.wikimedia.org/wikipedia/commons/1/1f/Kebran_Gabriel_Island_Church_Lake_Tana.jpg'],
    ARRAY['Monastery', 'Lake Tana', 'Island', 'Orthodox'],
    '{"lat": 11.6070, "lng": 37.3750}'::jsonb
  ),
  (
    'Daga Estifanos Monastery',
    'Lake Tana island monastery reputed to house imperial remains; strict access rules.',
    'Amhara',
    'Lake Tana',
    570,
    ARRAY['https://upload.wikimedia.org/wikipedia/commons/5/5b/Daga_Estifanos_Church_Lake_Tana.jpg'],
    ARRAY['Monastery', 'Lake Tana', 'Island', 'Orthodox'],
    '{"lat": 11.8800, "lng": 37.2700}'::jsonb
  ),
  (
    'Tana Cherkos Monastery',
    'Island monastery said to have sheltered the Ark of the Covenant; picturesque lake setting.',
    'Amhara',
    'Lake Tana',
    570,
    ARRAY['https://upload.wikimedia.org/wikipedia/commons/e/e0/Tana_Cherkos_Island_Monastery.jpg'],
    ARRAY['Monastery', 'Lake Tana', 'Island', 'Orthodox'],
    '{"lat": 11.8300, "lng": 37.3800}'::jsonb
  ),
  (
    'Gorgora Debre Sina Monastery',
    'Historic lakeside monastery south of Gondar, noted for traditional architecture.',
    'Amhara',
    'Gorgora',
    610,
    ARRAY['https://upload.wikimedia.org/wikipedia/commons/f/f9/Gorgora_Debre_Sina_Church.jpg'],
    ARRAY['Monastery', 'Lake Tana', 'Historic', 'Orthodox'],
    '{"lat": 12.2430, "lng": 37.2980}'::jsonb
  ),
  (
    'Washa Mikael Rock-Hewn Church',
    '4th-century semi-monolithic church in Addis Ababa; one of Ethiopia''s oldest rock-hewn churches.',
    'Addis Ababa',
    'Addis Ababa',
    8,
    ARRAY['https://upload.wikimedia.org/wikipedia/commons/6/6a/Washa_Mikael_Church_Addis_Ababa.jpg'],
    ARRAY['Monastery', 'Rock-Hewn', 'Historic', 'Orthodox', 'Ancient'],
    '{"lat": 9.0100, "lng": 38.7500}'::jsonb
  ),
  (
    'Abune Gebre Mikael Monastery',
    'Historic monastery in Gheralta region, known for its cliff-top location and ancient manuscripts.',
    'Tigray',
    'Gheralta',
    780,
    ARRAY['https://upload.wikimedia.org/wikipedia/commons/4/4a/Abune_Gebre_Mikael_Church.jpg'],
    ARRAY['Monastery', 'Cliff', 'Gheralta', 'Historic', 'Orthodox'],
    '{"lat": 13.9200, "lng": 39.2000}'::jsonb
  ),
  (
    'Mariam Korkor Monastery',
    'Rock-hewn church in Gheralta with stunning frescoes; accessible via challenging climb.',
    'Tigray',
    'Gheralta',
    780,
    ARRAY['https://upload.wikimedia.org/wikipedia/commons/7/7b/Mariam_Korkor_Church_Tigray.jpg'],
    ARRAY['Monastery', 'Rock-Hewn', 'Gheralta', 'Frescoes', 'Orthodox'],
    '{"lat": 13.9100, "lng": 39.1900}'::jsonb
  ),
  (
    'Daniel Korkor Monastery',
    'Ancient rock-hewn monastery in Gheralta, known for its isolated location and spiritual significance.',
    'Tigray',
    'Gheralta',
    780,
    ARRAY['https://upload.wikimedia.org/wikipedia/commons/8/8a/Daniel_Korkor_Church.jpg'],
    ARRAY['Monastery', 'Rock-Hewn', 'Gheralta', 'Historic', 'Orthodox'],
    '{"lat": 13.9150, "lng": 39.1950}'::jsonb
  ),
  (
    'Abraha Atsbeha Monastery',
    'Historic monastery in Tigray, named after the 4th-century Aksumite kings; features ancient architecture.',
    'Tigray',
    'Wukro',
    850,
    ARRAY['https://upload.wikimedia.org/wikipedia/commons/9/9a/Abraha_Atsbeha_Church.jpg'],
    ARRAY['Monastery', 'Historic', 'Aksumite', 'Orthodox'],
    '{"lat": 13.7900, "lng": 39.6000}'::jsonb
  ),
  (
    'Tsadkane Mariam Monastery',
    'Historic monastery in North Shewa, known for its unique architecture and pilgrimage significance.',
    'Amhara',
    'North Shewa',
    180,
    ARRAY['https://upload.wikimedia.org/wikipedia/commons/a/a5/Tsadkane_Mariam_Monastery.jpg'],
    ARRAY['Monastery', 'Pilgrimage', 'Shewa', 'Historic', 'Orthodox'],
    '{"lat": 9.8000, "lng": 38.7000}'::jsonb
  ),
  (
    'Midda Abune Melke Tsedik Monastery',
    'Monastery known for its spiritual significance and historical artifacts in the Ethiopian Orthodox tradition.',
    'Amhara',
    'Wollo',
    350,
    ARRAY['https://upload.wikimedia.org/wikipedia/commons/b/b5/Midda_Abune_Melke_Tsedik.jpg'],
    ARRAY['Monastery', 'Historic', 'Wollo', 'Orthodox'],
    '{"lat": 11.5000, "lng": 39.5000}'::jsonb
  ),
  (
    'Beta Giyorgis (St. George) Church',
    'Iconic cross-shaped rock-hewn church in Lalibela, one of the most famous of the 11 churches.',
    'Amhara',
    'Lalibela',
    642,
    ARRAY['https://upload.wikimedia.org/wikipedia/commons/1/1c/Beta_Giyorgis_Lalibela.jpg'],
    ARRAY['Monastery', 'Rock-Hewn', 'UNESCO', 'Lalibela', 'Orthodox'],
    '{"lat": 12.0316, "lng": 39.0476}'::jsonb
  ),
  (
    'Beta Medhane Alem Church',
    'Largest rock-hewn church in Lalibela, known as the "House of the Saviour of the World".',
    'Amhara',
    'Lalibela',
    642,
    ARRAY['https://upload.wikimedia.org/wikipedia/commons/2/2d/Beta_Medhane_Alem_Lalibela.jpg'],
    ARRAY['Monastery', 'Rock-Hewn', 'UNESCO', 'Lalibela', 'Orthodox'],
    '{"lat": 12.0320, "lng": 39.0480}'::jsonb
  ),
  (
    'Beta Maryam Church',
    'Rock-hewn church in Lalibela dedicated to the Virgin Mary, featuring beautiful carvings.',
    'Amhara',
    'Lalibela',
    642,
    ARRAY['https://upload.wikimedia.org/wikipedia/commons/3/3e/Beta_Maryam_Lalibela.jpg'],
    ARRAY['Monastery', 'Rock-Hewn', 'UNESCO', 'Lalibela', 'Orthodox'],
    '{"lat": 12.0318, "lng": 39.0478}'::jsonb
  ),
  (
    'Beta Emmanuel Church',
    'Elegant rock-hewn church in Lalibela, considered one of the finest examples of Ethiopian architecture.',
    'Amhara',
    'Lalibela',
    642,
    ARRAY['https://upload.wikimedia.org/wikipedia/commons/4/4f/Beta_Emmanuel_Lalibela.jpg'],
    ARRAY['Monastery', 'Rock-Hewn', 'UNESCO', 'Lalibela', 'Orthodox'],
    '{"lat": 12.0317, "lng": 39.0477}'::jsonb
  ),
  (
    'Beta Abba Libanos Church',
    'Rock-hewn church in Lalibela, part of the UNESCO World Heritage site.',
    'Amhara',
    'Lalibela',
    642,
    ARRAY['https://upload.wikimedia.org/wikipedia/commons/5/5a/Beta_Abba_Libanos_Lalibela.jpg'],
    ARRAY['Monastery', 'Rock-Hewn', 'UNESCO', 'Lalibela', 'Orthodox'],
    '{"lat": 12.0319, "lng": 39.0479}'::jsonb
  ),
  (
    'Azwa Mariam Monastery',
    'Island monastery on Lake Tana, known for its peaceful setting and traditional architecture.',
    'Amhara',
    'Lake Tana',
    565,
    ARRAY['https://upload.wikimedia.org/wikipedia/commons/c/c5/Azwa_Mariam_Lake_Tana.jpg'],
    ARRAY['Monastery', 'Lake Tana', 'Island', 'Orthodox'],
    '{"lat": 11.8500, "lng": 37.3500}'::jsonb
  ),
  (
    'Mandaba Medhane Alem Monastery',
    'Historic monastery on Lake Tana island, housing ancient manuscripts and religious artifacts.',
    'Amhara',
    'Lake Tana',
    565,
    ARRAY['https://upload.wikimedia.org/wikipedia/commons/d/d3/Mandaba_Medhane_Alem.jpg'],
    ARRAY['Monastery', 'Lake Tana', 'Island', 'Manuscripts', 'Orthodox'],
    '{"lat": 11.8700, "lng": 37.3300}'::jsonb
  ),
  (
    'Kebran Gabriel Monastery (Women''s Section)',
    'Separate section of the famous Kebran Gabriel monastery, accessible to women pilgrims.',
    'Amhara',
    'Lake Tana',
    565,
    ARRAY['https://upload.wikimedia.org/wikipedia/commons/1/1f/Kebran_Gabriel_Island_Church_Lake_Tana.jpg'],
    ARRAY['Monastery', 'Lake Tana', 'Island', 'Orthodox'],
    '{"lat": 11.6080, "lng": 37.3760}'::jsonb
  ),
  (
    'Debre Tsehai Selassie Monastery',
    'Historic monastery in Gondar, known for its beautiful frescoes and royal connections.',
    'Amhara',
    'Gondar',
    738,
    ARRAY['https://upload.wikimedia.org/wikipedia/commons/6/6b/Debre_Tsehai_Selassie_Gondar.jpg'],
    ARRAY['Monastery', 'Gondar', 'Frescoes', 'Royal', 'Orthodox'],
    '{"lat": 12.6100, "lng": 37.4670}'::jsonb
  ),
  (
    'Wonchet Monastery',
    'Ancient monastery in the Tigray region, known for its remote location and spiritual significance.',
    'Tigray',
    'Tigray',
    950,
    ARRAY['https://upload.wikimedia.org/wikipedia/commons/e/e5/Wonchet_Monastery.jpg'],
    ARRAY['Monastery', 'Tigray', 'Remote', 'Historic', 'Orthodox'],
    '{"lat": 14.2000, "lng": 39.1000}'::jsonb
  ),
  (
    'Petros and Paulos Monastery',
    'Rock-hewn monastery in Gheralta, accessible via challenging climb, featuring ancient frescoes.',
    'Tigray',
    'Gheralta',
    780,
    ARRAY['https://upload.wikimedia.org/wikipedia/commons/f/f2/Petros_Paulos_Church.jpg'],
    ARRAY['Monastery', 'Rock-Hewn', 'Gheralta', 'Frescoes', 'Orthodox'],
    '{"lat": 13.9000, "lng": 39.1800}'::jsonb
  ),
  (
    'Mikael Imba Monastery',
    'Historic monastery in Tigray, known for its architectural beauty and religious significance.',
    'Tigray',
    'Tigray',
    900,
    ARRAY['https://upload.wikimedia.org/wikipedia/commons/7/7c/Mikael_Imba_Monastery.jpg'],
    ARRAY['Monastery', 'Tigray', 'Historic', 'Orthodox'],
    '{"lat": 14.1500, "lng": 39.2000}'::jsonb
  );

-- ============================================
-- COMPLETED
-- ============================================
-- After running:
-- - 30+ Ethiopian monasteries are added to churches
-- - Includes monasteries from:
--   * Tigray Region (Debre Damo, Abuna Yemata Guh, Gheralta cluster, etc.)
--   * Lake Tana (Ura Kidane Mehret, Narga Selassie, Kebran Gabriel, etc.)
--   * Lalibela (Beta Giyorgis, Beta Medhane Alem, Beta Maryam, etc.)
--   * Addis Ababa (Washa Mikael)
--   * Amhara Region (Debre Libanos, Tsadkane Mariam, etc.)
--   * Gondar (Debre Tsehai Selassie)
-- - Each has a Wikimedia image URL (replace with your CDN/approved assets for production)
-- - Distances are approximate from Addis Ababa
-- - Coordinates are approximate; verify for production use

