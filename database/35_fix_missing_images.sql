-- Migration 35: Fix all remaining destinations with missing or placeholder images
-- Run this in Supabase SQL Editor.
-- Strategy: update every destination row unconditionally, matching by city/region/name keywords.
-- No reliance on Amharic text matching. Safe to run multiple times (idempotent).

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 1: Named destinations – broad ILIKE matching so Amharic vs English
--         name differences don't matter. Most specific first.
-- ─────────────────────────────────────────────────────────────────────────────

-- Lalibela – Beta Giyorgis (cross church, most iconic shot)
UPDATE destinations SET images = ARRAY[
  'https://images.unsplash.com/photo-1578922746317-aac19659f663?w=1200&q=80',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Beta_Giyorgis_Lalibela.jpg/1200px-Beta_Giyorgis_Lalibela.jpg'
] WHERE city ILIKE '%lalibela%' AND name ILIKE '%giyorgis%';

-- Lalibela – all other rock-hewn churches
UPDATE destinations SET images = ARRAY[
  'https://images.unsplash.com/photo-1578922746317-aac19659f663?w=1200&q=80',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Beta_Medhane_Alem_Lalibela.jpg/1200px-Beta_Medhane_Alem_Lalibela.jpg'
] WHERE city ILIKE '%lalibela%'
  AND (images IS NULL OR images = '{}' OR images = ARRAY['https://images.unsplash.com/photo-1578922746317-aac19659f663?w=800']);

-- Axum / Aksum
UPDATE destinations SET images = ARRAY[
  'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=1200&q=80',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/The_North_Stelae_Park%2C_Axum%2C_Ethiopia_%282812686646%29.jpg/1200px-The_North_Stelae_Park%2C_Axum%2C_Ethiopia_%282812686646%29.jpg'
] WHERE city ILIKE '%axum%' OR city ILIKE '%aksum%' OR city ILIKE '%adwa%';

-- Gondar
UPDATE destinations SET images = ARRAY[
  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Church_of_Debra_Berhan_Selassie%2C_Gondar%2C_Ethiopia_%282423914431%29.jpg/1200px-Church_of_Debra_Berhan_Selassie%2C_Gondar%2C_Ethiopia_%282423914431%29.jpg',
  'https://images.unsplash.com/photo-1578922746317-aac19659f663?w=1200&q=80'
] WHERE city ILIKE '%gondar%';

-- Bahir Dar (city itself)
UPDATE destinations SET images = ARRAY[
  'https://images.unsplash.com/photo-1605106901227-991bd663255c?w=1200&q=80',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Ura_Kidane_Mehret_exterior.jpg/1200px-Ura_Kidane_Mehret_exterior.jpg'
] WHERE city ILIKE '%bahir dar%';

-- Lake Tana monasteries (any city containing "tana" or "zege")
UPDATE destinations SET images = ARRAY[
  'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Ura_Kidane_Mehret_exterior.jpg/1200px-Ura_Kidane_Mehret_exterior.jpg',
  'https://images.unsplash.com/photo-1605106901227-991bd663255c?w=1200&q=80'
] WHERE city ILIKE '%lake tana%' OR city ILIKE '%tana%' OR city ILIKE '%zege%';

-- Addis Ababa
UPDATE destinations SET images = ARRAY[
  'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=1200&q=80',
  'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=1200&q=80'
] WHERE city ILIKE '%addis%';

-- Debre Libanos (Shewa / Oromia, ~110km from Addis)
UPDATE destinations SET images = ARRAY[
  'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Debre_Libanos_Monastery_Ethiopia.jpg/1200px-Debre_Libanos_Monastery_Ethiopia.jpg',
  'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=1200&q=80'
] WHERE name ILIKE '%debre libanos%' OR city ILIKE '%debre libanos%';

-- Tigray region (Gheralta cluster, Debre Damo, etc.)
UPDATE destinations SET images = ARRAY[
  'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Abuna_Yemata_Guh_Church_Tigray.jpg/1200px-Abuna_Yemata_Guh_Church_Tigray.jpg',
  'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=1200&q=80'
] WHERE (region ILIKE '%tigray%' OR city ILIKE '%gheralta%' OR city ILIKE '%hawzen%' OR city ILIKE '%wukro%')
  AND (images IS NULL OR images = '{}' OR images[1] NOT LIKE 'https://upload.wikimedia.org%');

-- Debre Damo specifically
UPDATE destinations SET images = ARRAY[
  'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Debre_Damo_Monastery.jpg/1200px-Debre_Damo_Monastery.jpg',
  'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=1200&q=80'
] WHERE name ILIKE '%debre damo%' OR city ILIKE '%debre damo%';

-- Amhara region / North Shewa / Wollo (catch remaining)
UPDATE destinations SET images = ARRAY[
  'https://images.unsplash.com/photo-1578922746317-aac19659f663?w=1200&q=80',
  'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=1200&q=80'
] WHERE region ILIKE '%amhara%'
  AND (city NOT ILIKE '%lalibela%' AND city NOT ILIKE '%gondar%'
       AND city NOT ILIKE '%bahir%' AND city NOT ILIKE '%tana%'
       AND city NOT ILIKE '%zege%' AND city NOT ILIKE '%gorgora%')
  AND (images IS NULL OR images = '{}' OR images[1] = 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Tsadkane_Mariam_Monastery.jpg');

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 2: Category-based sweep for anything still missing
-- ─────────────────────────────────────────────────────────────────────────────

-- Churches / religious
UPDATE destinations SET images = ARRAY[
  'https://images.unsplash.com/photo-1578922746317-aac19659f663?w=1200&q=80'
] WHERE (images IS NULL OR images = '{}' OR array_length(images,1) = 0)
  AND (category IN ('church','religious')
       OR tags && ARRAY['Orthodox','Monastery','Pilgrimage']::text[]);

-- Historical / monuments
UPDATE destinations SET images = ARRAY[
  'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=1200&q=80'
] WHERE (images IS NULL OR images = '{}' OR array_length(images,1) = 0)
  AND category IN ('historical','monument','museum');

-- Nature / adventure
UPDATE destinations SET images = ARRAY[
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80'
] WHERE (images IS NULL OR images = '{}' OR array_length(images,1) = 0)
  AND category IN ('nature','adventure','park');

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 3: Absolute catch-all – any row still without a usable image
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE destinations
SET images = ARRAY['https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=1200&q=80']
WHERE images IS NULL
   OR images = '{}'
   OR array_length(images, 1) IS NULL
   OR array_length(images, 1) = 0
   OR images[1] IS NULL
   OR images[1] = '';

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 4: Replace all old low-res Unsplash ?w=800 URLs with ?w=1200&q=80
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE destinations
SET images = ARRAY(
  SELECT REPLACE(REPLACE(url, '?w=800', '?w=1200&q=80'), 'w=800', 'w=1200&q=80')
  FROM unnest(images) AS url
)
WHERE images::text LIKE '%w=800%';

-- Verify: show any rows still missing images (should return 0 rows)
-- SELECT id, name, city, images FROM destinations WHERE images IS NULL OR array_length(images,1) = 0;
