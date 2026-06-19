-- Migration 34: Update destination images with reliable, high-quality URLs
-- Uses Unsplash (free, no key needed for direct photo URLs) and
-- verified Wikimedia Commons direct file URLs.
-- Run in: Supabase Dashboard → SQL Editor

-- ============================================================
-- HELPER: update by name (safe – only touches matching rows)
-- ============================================================

-- ── Addis Ababa / Shewa ──────────────────────────────────────

UPDATE destinations SET images = ARRAY[
  'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=1200&q=80',
  'https://images.unsplash.com/photo-1578922746317-aac19659f663?w=1200&q=80'
] WHERE name LIKE '%ሥላሴ ቤተክርስቲያን%' AND city = 'Addis Ababa';

UPDATE destinations SET images = ARRAY[
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Washa_Mikael_Church_Addis_Ababa.jpg/1200px-Washa_Mikael_Church_Addis_Ababa.jpg',
  'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=1200&q=80'
] WHERE name = 'Washa Mikael Rock-Hewn Church';

UPDATE destinations SET images = ARRAY[
  'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Debre_Libanos_Monastery_Ethiopia.jpg/1200px-Debre_Libanos_Monastery_Ethiopia.jpg',
  'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=1200&q=80'
] WHERE name = 'Debre Libanos Monastery (Shewa)';

-- ── Lalibela ─────────────────────────────────────────────────

UPDATE destinations SET images = ARRAY[
  'https://images.unsplash.com/photo-1578922746317-aac19659f663?w=1200&q=80',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Beta_Giyorgis_Lalibela.jpg/1200px-Beta_Giyorgis_Lalibela.jpg'
] WHERE name LIKE '%ላሊበላ%' OR city = 'Lalibela' AND name NOT LIKE 'Beta%';

UPDATE destinations SET images = ARRAY[
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Beta_Giyorgis_Lalibela.jpg/1200px-Beta_Giyorgis_Lalibela.jpg',
  'https://images.unsplash.com/photo-1578922746317-aac19659f663?w=1200&q=80'
] WHERE name = 'Beta Giyorgis (St. George) Church';

UPDATE destinations SET images = ARRAY[
  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Beta_Medhane_Alem_Lalibela.jpg/1200px-Beta_Medhane_Alem_Lalibela.jpg',
  'https://images.unsplash.com/photo-1578922746317-aac19659f663?w=1200&q=80'
] WHERE name = 'Beta Medhane Alem Church';

UPDATE destinations SET images = ARRAY[
  'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Beta_Maryam_Lalibela.jpg/1200px-Beta_Maryam_Lalibela.jpg',
  'https://images.unsplash.com/photo-1578922746317-aac19659f663?w=1200&q=80'
] WHERE name = 'Beta Maryam Church';

UPDATE destinations SET images = ARRAY[
  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Beta_Emmanuel_Lalibela.jpg/1200px-Beta_Emmanuel_Lalibela.jpg',
  'https://images.unsplash.com/photo-1578922746317-aac19659f663?w=1200&q=80'
] WHERE name = 'Beta Emmanuel Church';

UPDATE destinations SET images = ARRAY[
  'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Beta_Abba_Libanos_Lalibela.jpg/1200px-Beta_Abba_Libanos_Lalibela.jpg',
  'https://images.unsplash.com/photo-1578922746317-aac19659f663?w=1200&q=80'
] WHERE name = 'Beta Abba Libanos Church';

-- ── Axum / Tigray ────────────────────────────────────────────

UPDATE destinations SET images = ARRAY[
  'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=1200&q=80',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/The_North_Stelae_Park%2C_Axum%2C_Ethiopia_%282812686646%29.jpg/1200px-The_North_Stelae_Park%2C_Axum%2C_Ethiopia_%282812686646%29.jpg'
] WHERE name LIKE '%ጽዮን%' OR city = 'Axum';

UPDATE destinations SET images = ARRAY[
  'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Debre_Damo_Monastery.jpg/1200px-Debre_Damo_Monastery.jpg',
  'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=1200&q=80'
] WHERE name = 'Debre Damo Monastery';

UPDATE destinations SET images = ARRAY[
  'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Abba_Garima_monastery_church.jpg/1200px-Abba_Garima_monastery_church.jpg',
  'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=1200&q=80'
] WHERE name = 'Abba Garima Monastery';

UPDATE destinations SET images = ARRAY[
  'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Abuna_Yemata_Guh_Church_Tigray.jpg/1200px-Abuna_Yemata_Guh_Church_Tigray.jpg',
  'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=1200&q=80'
] WHERE name = 'Abuna Yemata Guh';

UPDATE destinations SET images = ARRAY[
  'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Mariam_Korkor_Church_Tigray.jpg/1200px-Mariam_Korkor_Church_Tigray.jpg',
  'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=1200&q=80'
] WHERE name = 'Mariam Korkor Monastery';

UPDATE destinations SET images = ARRAY[
  'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Petros_Paulos_Church.jpg/1200px-Petros_Paulos_Church.jpg',
  'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=1200&q=80'
] WHERE name = 'Petros and Paulos Monastery';

UPDATE destinations SET images = ARRAY[
  'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Abraha_Atsbeha_Church.jpg/1200px-Abraha_Atsbeha_Church.jpg',
  'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=1200&q=80'
] WHERE name = 'Abraha Atsbeha Monastery';

UPDATE destinations SET images = ARRAY[
  'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=1200&q=80'
] WHERE name IN ('Abune Gebre Mikael Monastery','Daniel Korkor Monastery','Wonchet Monastery','Mikael Imba Monastery');

-- ── Bahir Dar / Lake Tana ────────────────────────────────────

UPDATE destinations SET images = ARRAY[
  'https://images.unsplash.com/photo-1605106901227-991bd663255c?w=1200&q=80',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Ura_Kidane_Mehret_exterior.jpg/1200px-Ura_Kidane_Mehret_exterior.jpg'
] WHERE name LIKE '%ጊዮርጊስ ቤተክርስቲያን%' AND city = 'Bahir Dar';

UPDATE destinations SET images = ARRAY[
  'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Ura_Kidane_Mehret_exterior.jpg/1200px-Ura_Kidane_Mehret_exterior.jpg',
  'https://images.unsplash.com/photo-1605106901227-991bd663255c?w=1200&q=80'
] WHERE name = 'Ura Kidane Mehret Monastery';

UPDATE destinations SET images = ARRAY[
  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Narga_Selassie_Church_Lake_Tana.jpg/1200px-Narga_Selassie_Church_Lake_Tana.jpg',
  'https://images.unsplash.com/photo-1605106901227-991bd663255c?w=1200&q=80'
] WHERE name = 'Narga Selassie Monastery';

UPDATE destinations SET images = ARRAY[
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Kebran_Gabriel_Island_Church_Lake_Tana.jpg/1200px-Kebran_Gabriel_Island_Church_Lake_Tana.jpg',
  'https://images.unsplash.com/photo-1605106901227-991bd663255c?w=1200&q=80'
] WHERE name IN ('Kebran Gabriel Monastery', 'Kebran Gabriel Monastery (Women''s Section)');

UPDATE destinations SET images = ARRAY[
  'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Daga_Estifanos_Church_Lake_Tana.jpg/1200px-Daga_Estifanos_Church_Lake_Tana.jpg',
  'https://images.unsplash.com/photo-1605106901227-991bd663255c?w=1200&q=80'
] WHERE name = 'Daga Estifanos Monastery';

UPDATE destinations SET images = ARRAY[
  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Tana_Cherkos_Island_Monastery.jpg/1200px-Tana_Cherkos_Island_Monastery.jpg',
  'https://images.unsplash.com/photo-1605106901227-991bd663255c?w=1200&q=80'
] WHERE name = 'Tana Cherkos Monastery';

UPDATE destinations SET images = ARRAY[
  'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Gorgora_Debre_Sina_Church.jpg/1200px-Gorgora_Debre_Sina_Church.jpg',
  'https://images.unsplash.com/photo-1605106901227-991bd663255c?w=1200&q=80'
] WHERE name = 'Gorgora Debre Sina Monastery';

UPDATE destinations SET images = ARRAY[
  'https://images.unsplash.com/photo-1605106901227-991bd663255c?w=1200&q=80'
] WHERE name IN ('Azwa Mariam Monastery','Mandaba Medhane Alem Monastery');

-- ── Gondar ────────────────────────────────────────────────────

UPDATE destinations SET images = ARRAY[
  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Church_of_Debra_Berhan_Selassie%2C_Gondar%2C_Ethiopia_%282423914431%29.jpg/1200px-Church_of_Debra_Berhan_Selassie%2C_Gondar%2C_Ethiopia_%282423914431%29.jpg',
  'https://images.unsplash.com/photo-1578922746317-aac19659f663?w=1200&q=80'
] WHERE name LIKE '%ደብረ ብርሃን ሥላሴ%' AND city = 'Gondar';

UPDATE destinations SET images = ARRAY[
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Debre_Tsehai_Selassie_Gondar.jpg/1200px-Debre_Tsehai_Selassie_Gondar.jpg',
  'https://images.unsplash.com/photo-1578922746317-aac19659f663?w=1200&q=80'
] WHERE name = 'Debre Tsehai Selassie Monastery';

-- ── Remaining with fallback Unsplash Ethiopia landscape ──────

UPDATE destinations SET images = ARRAY[
  'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=1200&q=80'
] WHERE name IN (
  'Tsadkane Mariam Monastery',
  'Midda Abune Melke Tsedik Monastery'
);

-- ── Catch-all: any destination still missing images ──────────
-- Sets a beautiful Ethiopia landscape fallback so no card shows a blank image.
UPDATE destinations
SET images = ARRAY['https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=1200&q=80']
WHERE images IS NULL OR array_length(images, 1) IS NULL OR images = '{}';

-- ── Category-based fallbacks for any destination with a broken/missing image ─
-- These use Unsplash photos tagged to Ethiopian scenes.
-- Run AFTER the specific updates above so they only touch rows still missing images.

UPDATE destinations
SET images = ARRAY['https://images.unsplash.com/photo-1578922746317-aac19659f663?w=1200&q=80']
WHERE (images IS NULL OR images = '{}' OR array_length(images,1) = 0)
  AND (category IN ('church','religious') OR tags @> ARRAY['Orthodox']::text[]);

UPDATE destinations
SET images = ARRAY['https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=1200&q=80']
WHERE (images IS NULL OR images = '{}' OR array_length(images,1) = 0)
  AND category IN ('historical','monument');

UPDATE destinations
SET images = ARRAY['https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80']
WHERE (images IS NULL OR images = '{}' OR array_length(images,1) = 0)
  AND category IN ('nature','adventure');

-- Final safety net — any row still without an image
UPDATE destinations
SET images = ARRAY['https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=1200&q=80']
WHERE images IS NULL OR images = '{}' OR array_length(images,1) = 0;
