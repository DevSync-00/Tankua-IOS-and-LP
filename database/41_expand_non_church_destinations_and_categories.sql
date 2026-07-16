-- Migration 41: Expand Ethiopia destinations and normalize categories
-- Run in Supabase SQL Editor.
--
-- This migration intentionally does NOT add church destinations. It adds
-- broader Ethiopian destinations and normalizes categories so filtering works.

-- 1) Normalize existing categories to the current destination taxonomy.
UPDATE destinations
SET category = CASE
  WHEN category IS NULL OR trim(category) = '' THEN 'other'
  WHEN category IN ('church', 'religious') THEN 'religious'
  WHEN lower(name) ~ '(^|[^a-z])church(es)?([^a-z]|$)' OR lower(name) LIKE '%monastery%' OR lower(description) LIKE '%orthodox%' THEN 'religious'
  WHEN lower(name) LIKE '%museum%' THEN 'museum'
  WHEN lower(name) LIKE '%park%' OR lower(name) LIKE '%national park%' OR lower(name) LIKE '%wildlife%' THEN 'park'
  WHEN lower(name) LIKE '%obelisk%' OR lower(name) LIKE '%stela%' OR lower(name) LIKE '%monument%' THEN 'monument'
  WHEN lower(name) LIKE '%palace%' OR lower(name) LIKE '%castle%' OR lower(name) LIKE '%fort%' OR lower(name) LIKE '%ruin%' THEN 'historical'
  WHEN lower(name) LIKE '%mountain%' OR lower(name) LIKE '%falls%' OR lower(name) LIKE '%lake%' OR lower(name) LIKE '%forest%' OR lower(name) LIKE '%cave%' THEN 'nature'
  WHEN lower(name) LIKE '%trek%' OR lower(name) LIKE '%depression%' OR lower(name) LIKE '%volcano%' THEN 'adventure'
  WHEN category IN ('historical', 'nature', 'adventure', 'cultural', 'sacred', 'monument', 'park', 'museum', 'city', 'other') THEN category
  ELSE 'other'
END;

CREATE INDEX IF NOT EXISTS idx_destinations_category ON destinations(category);
CREATE INDEX IF NOT EXISTS idx_destinations_name_city ON destinations(name, city);

-- 2) Add non-church destinations across Ethiopia.
WITH new_destinations (name, description, region, city, distance, category, images, tags, location) AS (
  VALUES
  ('Simien Mountains National Park', 'UNESCO-listed mountain landscape with escarpments, gelada monkeys, Walia ibex, trekking routes, and highland viewpoints.', 'Amhara', 'Debark', 740, 'park',
   ARRAY['https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80'], ARRAY['UNESCO','Trekking','Wildlife','Highlands'], '{"lat":13.1833,"lng":38.0667,"coordinates":[38.0667,13.1833]}'::jsonb),
  ('Ras Dashen', 'Ethiopia''s highest peak and a major trekking objective inside the Simien Mountains massif.', 'Amhara', 'Debark', 780, 'adventure',
   ARRAY['https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80'], ARRAY['Peak','Trekking','Mountain'], '{"lat":13.2361,"lng":38.3725,"coordinates":[38.3725,13.2361]}'::jsonb),
  ('Bale Mountains National Park', 'Afroalpine wilderness known for the Sanetti Plateau, Harenna Forest, Ethiopian wolves, and dramatic mountain drives.', 'Oromia', 'Dinsho', 400, 'park',
   ARRAY['https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80'], ARRAY['Wildlife','Ethiopian Wolf','Forest','Plateau'], '{"lat":7.0,"lng":39.75,"coordinates":[39.75,7.0]}'::jsonb),
  ('Sanetti Plateau', 'High-altitude plateau in Bale with sweeping moorland, rare wildlife sightings, and cool alpine scenery.', 'Oromia', 'Robe', 430, 'nature',
   ARRAY['https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80'], ARRAY['Plateau','Wildlife','Scenic Drive'], '{"lat":6.85,"lng":39.87,"coordinates":[39.87,6.85]}'::jsonb),
  ('Harenna Forest', 'One of Ethiopia''s largest cloud forests, rich in coffee traditions, birdlife, waterfalls, and forest trails.', 'Oromia', 'Bale Zone', 455, 'nature',
   ARRAY['https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=80'], ARRAY['Forest','Coffee','Birding','Waterfalls'], '{"lat":6.55,"lng":39.72,"coordinates":[39.72,6.55]}'::jsonb),
  ('Danakil Depression', 'Otherworldly desert basin with salt flats, mineral springs, lava fields, and some of the lowest elevations in Africa.', 'Afar', 'Dallol', 610, 'adventure',
   ARRAY['https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1200&q=80'], ARRAY['Desert','Salt Flats','Geology','Expedition'], '{"lat":14.2417,"lng":40.3,"coordinates":[40.3,14.2417]}'::jsonb),
  ('Dallol Hydrothermal Fields', 'Colorful volcanic hot springs and mineral formations in the Danakil, famous for surreal yellow, green, and orange terrain.', 'Afar', 'Dallol', 620, 'nature',
   ARRAY['https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1200&q=80'], ARRAY['Geology','Hot Springs','Photography'], '{"lat":14.242,"lng":40.3007,"coordinates":[40.3007,14.242]}'::jsonb),
  ('Erta Ale Volcano', 'Active shield volcano known for its lava lake expeditions and overnight desert trekking routes.', 'Afar', 'Erta Ale', 690, 'adventure',
   ARRAY['https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80'], ARRAY['Volcano','Lava','Expedition','Camping'], '{"lat":13.6,"lng":40.67,"coordinates":[40.67,13.6]}'::jsonb),
  ('Lake Assale Salt Flats', 'Vast salt plain where Afar salt caravans and camel routes cross the Danakil landscape.', 'Afar', 'Berhale', 615, 'cultural',
   ARRAY['https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1200&q=80'], ARRAY['Salt','Caravans','Afar Culture','Desert'], '{"lat":14.05,"lng":40.2,"coordinates":[40.2,14.05]}'::jsonb),
  ('Awash National Park', 'Savanna and acacia landscape with wildlife, hot springs, waterfalls, and views toward Fantale volcano.', 'Afar', 'Awash', 225, 'park',
   ARRAY['https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200&q=80'], ARRAY['Wildlife','Savanna','Hot Springs','Waterfall'], '{"lat":8.9,"lng":40.0,"coordinates":[40.0,8.9]}'::jsonb),
  ('Awash Falls', 'Waterfall on the Awash River near the national park, often visited with wildlife and hot spring routes.', 'Afar', 'Awash', 220, 'nature',
   ARRAY['https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1200&q=80'], ARRAY['Waterfall','River','Scenic'], '{"lat":8.846,"lng":40.004,"coordinates":[40.004,8.846]}'::jsonb),
  ('Filwoha Hot Springs', 'Warm spring area near Awash National Park surrounded by palms, pools, and dry-country scenery.', 'Afar', 'Awash', 230, 'nature',
   ARRAY['https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80'], ARRAY['Hot Springs','Nature','Relaxation'], '{"lat":9.02,"lng":40.12,"coordinates":[40.12,9.02]}'::jsonb),
  ('Nech Sar National Park', 'Rift Valley park between Lakes Abaya and Chamo, known for savanna, viewpoints, zebra, and boat trips.', 'SNNPR', 'Arba Minch', 505, 'park',
   ARRAY['https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200&q=80'], ARRAY['Wildlife','Rift Valley','Lake Chamo','Savanna'], '{"lat":5.95,"lng":37.55,"coordinates":[37.55,5.95]}'::jsonb),
  ('Lake Chamo Crocodile Market', 'Boat excursion area on Lake Chamo famous for Nile crocodiles, hippos, and birdlife.', 'SNNPR', 'Arba Minch', 510, 'nature',
   ARRAY['https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80'], ARRAY['Lake','Crocodiles','Boat Trip','Birding'], '{"lat":5.83,"lng":37.55,"coordinates":[37.55,5.83]}'::jsonb),
  ('Forty Springs', 'Natural spring area that gives Arba Minch its name, with forest walks and cool water sources.', 'SNNPR', 'Arba Minch', 500, 'nature',
   ARRAY['https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=80'], ARRAY['Springs','Forest','Walking'], '{"lat":6.033,"lng":37.55,"coordinates":[37.55,6.033]}'::jsonb),
  ('Dorze Village', 'Highland community known for bamboo houses, weaving, false banana cuisine, and cultural hospitality.', 'SNNPR', 'Chencha', 520, 'cultural',
   ARRAY['https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200&q=80'], ARRAY['Dorze','Weaving','Village','Culture'], '{"lat":6.25,"lng":37.58,"coordinates":[37.58,6.25]}'::jsonb),
  ('Konso Cultural Landscape', 'UNESCO cultural landscape of terraced hills, fortified settlements, carved memorials, and living traditions.', 'SNNPR', 'Konso', 590, 'cultural',
   ARRAY['https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200&q=80'], ARRAY['UNESCO','Terraces','Culture','Heritage'], '{"lat":5.25,"lng":37.48,"coordinates":[37.48,5.25]}'::jsonb),
  ('Omo Valley', 'Cultural region along the Omo River known for diverse communities, markets, ceremonies, and remote landscapes.', 'SNNPR', 'Jinka', 760, 'cultural',
   ARRAY['https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200&q=80'], ARRAY['Culture','Markets','Omo River','Photography'], '{"lat":5.65,"lng":36.65,"coordinates":[36.65,5.65]}'::jsonb),
  ('Mago National Park', 'Lowland national park near Jinka with wildlife, river scenery, and access routes toward Omo communities.', 'SNNPR', 'Jinka', 790, 'park',
   ARRAY['https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200&q=80'], ARRAY['Wildlife','Omo Valley','Park'], '{"lat":5.6,"lng":36.3,"coordinates":[36.3,5.6]}'::jsonb),
  ('Turmi Market', 'Important market town and cultural stop in South Omo, known for local trade, crafts, and community encounters.', 'SNNPR', 'Turmi', 845, 'cultural',
   ARRAY['https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200&q=80'], ARRAY['Market','Culture','South Omo'], '{"lat":4.97,"lng":36.49,"coordinates":[36.49,4.97]}'::jsonb),
  ('Harar Jugol', 'UNESCO-listed walled city with maze-like alleys, historic gates, shrines, markets, and unique Harari culture.', 'Harari', 'Harar', 525, 'city',
   ARRAY['https://images.unsplash.com/photo-1578922746317-aac19659f663?w=1200&q=80'], ARRAY['UNESCO','Walled City','Markets','Culture'], '{"lat":9.3139,"lng":42.1182,"coordinates":[42.1182,9.3139]}'::jsonb),
  ('Harar Hyena Feeding Site', 'Evening cultural experience outside Harar where traditional hyena feeding is performed for visitors.', 'Harari', 'Harar', 528, 'cultural',
   ARRAY['https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200&q=80'], ARRAY['Harar','Hyenas','Evening Experience'], '{"lat":9.31,"lng":42.13,"coordinates":[42.13,9.31]}'::jsonb),
  ('Dire Dawa Railway Station', 'Historic railway station and urban landmark tied to the Ethio-Djibouti railway era.', 'Dire Dawa', 'Dire Dawa', 515, 'historical',
   ARRAY['https://images.unsplash.com/photo-1578922746317-aac19659f663?w=1200&q=80'], ARRAY['Railway','History','Architecture'], '{"lat":9.6,"lng":41.8667,"coordinates":[41.8667,9.6]}'::jsonb),
  ('Legahar Railway Station', 'Historic Addis Ababa railway landmark connected to Ethiopia''s early modern transport history.', 'Addis Ababa', 'Addis Ababa', 5, 'historical',
   ARRAY['https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=1200&q=80'], ARRAY['Railway','Architecture','City'], '{"lat":9.0108,"lng":38.7539,"coordinates":[38.7539,9.0108]}'::jsonb),
  ('National Museum of Ethiopia', 'Major museum housing archaeological, historical, and cultural collections including early hominin discoveries.', 'Addis Ababa', 'Addis Ababa', 4, 'museum',
   ARRAY['https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=1200&q=80'], ARRAY['Museum','History','Archaeology','Lucy'], '{"lat":9.0389,"lng":38.7619,"coordinates":[38.7619,9.0389]}'::jsonb),
  ('Ethnological Museum', 'Museum set in the former palace of Haile Selassie, presenting Ethiopia''s cultures, arts, and daily life.', 'Addis Ababa', 'Addis Ababa', 6, 'museum',
   ARRAY['https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=1200&q=80'], ARRAY['Museum','Culture','Palace','University'], '{"lat":9.046,"lng":38.757,"coordinates":[38.757,9.046]}'::jsonb),
  ('Unity Park', 'Restored palace compound in Addis Ababa with museums, gardens, heritage buildings, and family-friendly exhibits.', 'Addis Ababa', 'Addis Ababa', 3, 'park',
   ARRAY['https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=1200&q=80'], ARRAY['Park','Museum','Palace','Gardens'], '{"lat":9.024,"lng":38.761,"coordinates":[38.761,9.024]}'::jsonb),
  ('Entoto Park', 'Large recreation park on Entoto Mountain with trails, viewpoints, cafes, rope courses, and city panoramas.', 'Addis Ababa', 'Addis Ababa', 12, 'park',
   ARRAY['https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80'], ARRAY['Park','Viewpoint','Cycling','Walking'], '{"lat":9.084,"lng":38.755,"coordinates":[38.755,9.084]}'::jsonb),
  ('Entoto Mountain Viewpoint', 'Highland viewpoint above Addis Ababa with eucalyptus forest, cool air, and broad city views.', 'Addis Ababa', 'Addis Ababa', 13, 'nature',
   ARRAY['https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80'], ARRAY['Viewpoint','Mountain','City View'], '{"lat":9.09,"lng":38.77,"coordinates":[38.77,9.09]}'::jsonb),
  ('Merkato', 'One of Africa''s largest open-air markets, with textiles, spices, crafts, coffee, household goods, and dense street life.', 'Addis Ababa', 'Addis Ababa', 7, 'cultural',
   ARRAY['https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200&q=80'], ARRAY['Market','Shopping','Culture','City'], '{"lat":9.033,"lng":38.735,"coordinates":[38.735,9.033]}'::jsonb),
  ('Meskel Square', 'Major public square in Addis Ababa used for national gatherings, festivals, races, and city events.', 'Addis Ababa', 'Addis Ababa', 2, 'monument',
   ARRAY['https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=1200&q=80'], ARRAY['Square','Events','City Landmark'], '{"lat":9.0102,"lng":38.7612,"coordinates":[38.7612,9.0102]}'::jsonb),
  ('Friendship Park', 'Landscaped urban park near the Grand Palace with water features, gardens, and walking areas.', 'Addis Ababa', 'Addis Ababa', 3, 'park',
   ARRAY['https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80'], ARRAY['Park','Gardens','City'], '{"lat":9.025,"lng":38.765,"coordinates":[38.765,9.025]}'::jsonb),
  ('Adwa Victory Memorial Museum', 'Museum and memorial complex honoring the Battle of Adwa and Ethiopia''s anti-colonial victory.', 'Addis Ababa', 'Addis Ababa', 4, 'museum',
   ARRAY['https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=1200&q=80'], ARRAY['Museum','Adwa','History','Memorial'], '{"lat":9.033,"lng":38.75,"coordinates":[38.75,9.033]}'::jsonb),
  ('Tiya Stelae Field', 'UNESCO archaeological site with carved standing stones and funerary monuments south of Addis Ababa.', 'SNNPR', 'Tiya', 88, 'monument',
   ARRAY['https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=1200&q=80'], ARRAY['UNESCO','Stelae','Archaeology','Monument'], '{"lat":8.435,"lng":38.612,"coordinates":[38.612,8.435]}'::jsonb),
  ('Melka Kunture Archaeological Site', 'Prehistoric archaeological area with stone tools, fossil evidence, and open-air museum displays.', 'Oromia', 'Melka Kunture', 50, 'museum',
   ARRAY['https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=1200&q=80'], ARRAY['Archaeology','Prehistory','Museum'], '{"lat":8.708,"lng":38.594,"coordinates":[38.594,8.708]}'::jsonb),
  ('Adadi Mariam Rock-Hewn Site', 'Rock-hewn heritage site south of Addis Ababa often paired with Tiya and Melka Kunture day trips.', 'Oromia', 'Adadi', 66, 'historical',
   ARRAY['https://images.unsplash.com/photo-1578922746317-aac19659f663?w=1200&q=80'], ARRAY['Rock-Hewn','History','Day Trip'], '{"lat":8.536,"lng":38.462,"coordinates":[38.462,8.536]}'::jsonb),
  ('Wonchi Crater Lake', 'Scenic crater lake with islands, hot springs, horse routes, hiking, and highland village landscapes.', 'Oromia', 'Wonchi', 155, 'nature',
   ARRAY['https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1200&q=80'], ARRAY['Crater Lake','Hiking','Horse Riding','Highlands'], '{"lat":8.787,"lng":37.89,"coordinates":[37.89,8.787]}'::jsonb),
  ('Wenchi-Dendi Eco Tourism Area', 'Highland eco-tourism area connecting crater lakes, forest routes, villages, and scenic drives.', 'Oromia', 'Dendi', 170, 'adventure',
   ARRAY['https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1200&q=80'], ARRAY['Eco Tourism','Crater Lake','Hiking'], '{"lat":8.82,"lng":37.98,"coordinates":[37.98,8.82]}'::jsonb),
  ('Sof Omar Caves', 'Extensive limestone cave system shaped by the Weyib River, with natural chambers and dramatic openings.', 'Oromia', 'Bale Zone', 520, 'adventure',
   ARRAY['https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80'], ARRAY['Caves','Geology','Adventure'], '{"lat":6.917,"lng":40.767,"coordinates":[40.767,6.917]}'::jsonb),
  ('Sodere Hot Springs', 'Riverside resort area with thermal pools, gardens, monkeys, and weekend getaway facilities.', 'Oromia', 'Sodere', 125, 'nature',
   ARRAY['https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80'], ARRAY['Hot Springs','Resort','Weekend'], '{"lat":8.4,"lng":39.38,"coordinates":[39.38,8.4]}'::jsonb),
  ('Lake Ziway', 'Rift Valley lake known for birdlife, boat rides, fishing communities, and island excursions.', 'Oromia', 'Ziway', 160, 'nature',
   ARRAY['https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1200&q=80'], ARRAY['Lake','Birding','Boat Trip','Rift Valley'], '{"lat":7.92,"lng":38.73,"coordinates":[38.73,7.92]}'::jsonb),
  ('Lake Langano', 'Popular Rift Valley lake destination with beaches, resorts, birdlife, and weekend recreation.', 'Oromia', 'Langano', 200, 'nature',
   ARRAY['https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1200&q=80'], ARRAY['Lake','Beach','Weekend','Birding'], '{"lat":7.62,"lng":38.75,"coordinates":[38.75,7.62]}'::jsonb),
  ('Abijatta-Shalla Lakes National Park', 'Rift Valley park protecting Lakes Abijatta and Shalla, flamingos, hot springs, and volcanic scenery.', 'Oromia', 'Shalla', 215, 'park',
   ARRAY['https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200&q=80'], ARRAY['Lakes','Flamingos','Birding','Hot Springs'], '{"lat":7.5,"lng":38.55,"coordinates":[38.55,7.5]}'::jsonb),
  ('Lake Hawassa', 'Urban Rift Valley lake with fish market, lakeside walks, birdlife, boat trips, and relaxed city atmosphere.', 'Sidama', 'Hawassa', 275, 'city',
   ARRAY['https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1200&q=80'], ARRAY['Lake','City','Fish Market','Birding'], '{"lat":7.05,"lng":38.47,"coordinates":[38.47,7.05]}'::jsonb),
  ('Hawassa Fish Market', 'Lively lakeside market where fishermen land catches and visitors watch birds, boats, and local food culture.', 'Sidama', 'Hawassa', 276, 'cultural',
   ARRAY['https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200&q=80'], ARRAY['Market','Lake','Food','Culture'], '{"lat":7.06,"lng":38.46,"coordinates":[38.46,7.06]}'::jsonb),
  ('Wondo Genet', 'Forested hot spring and resort area near Hawassa with trails, birds, and lush mountain scenery.', 'Sidama', 'Wondo Genet', 265, 'nature',
   ARRAY['https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=80'], ARRAY['Hot Springs','Forest','Resort','Birding'], '{"lat":7.1,"lng":38.62,"coordinates":[38.62,7.1]}'::jsonb),
  ('Yirgalem Coffee Region', 'Green coffee-growing area with forest lodges, Sidama coffee culture, village visits, and scenic drives.', 'Sidama', 'Yirgalem', 320, 'cultural',
   ARRAY['https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200&q=80'], ARRAY['Coffee','Sidama','Culture','Forest'], '{"lat":6.75,"lng":38.42,"coordinates":[38.42,6.75]}'::jsonb),
  ('Jimma Coffee Heritage Area', 'Historic coffee region tied to Ethiopia''s coffee story, local markets, estates, and Oromo cultural routes.', 'Oromia', 'Jimma', 350, 'cultural',
   ARRAY['https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200&q=80'], ARRAY['Coffee','Culture','Markets'], '{"lat":7.6667,"lng":36.8333,"coordinates":[36.8333,7.6667]}'::jsonb),
  ('Bonga Biosphere Reserve', 'Forest region associated with wild coffee, waterfalls, birdlife, and green highland routes.', 'South West Ethiopia', 'Bonga', 460, 'nature',
   ARRAY['https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=80'], ARRAY['Forest','Coffee','Birding','Biosphere'], '{"lat":7.27,"lng":36.24,"coordinates":[36.24,7.27]}'::jsonb),
  ('Chebera Churchura National Park', 'Southwestern park with elephants, buffalo, waterfalls, forest, savanna, and remote wildlife routes.', 'South West Ethiopia', 'Dawro', 510, 'park',
   ARRAY['https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200&q=80'], ARRAY['Wildlife','Elephants','Waterfalls','Forest'], '{"lat":7.0,"lng":36.7,"coordinates":[36.7,7.0]}'::jsonb),
  ('Gambella National Park', 'Large lowland park with wetlands, savanna, Nile basin wildlife, birding, and seasonal migrations.', 'Gambella', 'Gambella', 775, 'park',
   ARRAY['https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200&q=80'], ARRAY['Wildlife','Wetlands','Savanna','Birding'], '{"lat":8.25,"lng":34.58,"coordinates":[34.58,8.25]}'::jsonb),
  ('Alatish National Park', 'Remote northwestern park with dry forest, wildlife corridors, birds, and Sudan borderland landscapes.', 'Amhara', 'Quara', 900, 'park',
   ARRAY['https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200&q=80'], ARRAY['Wildlife','Dry Forest','Remote'], '{"lat":12.35,"lng":35.45,"coordinates":[35.45,12.35]}'::jsonb),
  ('Kafta Sheraro National Park', 'Tigray lowland park known for elephant corridors, dry woodland, birds, and western escarpment scenery.', 'Tigray', 'Humera', 1010, 'park',
   ARRAY['https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200&q=80'], ARRAY['Wildlife','Elephants','Birding','Dry Woodland'], '{"lat":14.07,"lng":37.45,"coordinates":[37.45,14.07]}'::jsonb),
  ('Gheralta Mountains', 'Sandstone massif with cliffs, trails, villages, and dramatic sunrise and sunset viewpoints.', 'Tigray', 'Hawzen', 780, 'adventure',
   ARRAY['https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80'], ARRAY['Mountains','Trekking','Cliffs','Viewpoints'], '{"lat":13.95,"lng":39.35,"coordinates":[39.35,13.95]}'::jsonb),
  ('Axum Stelae Park', 'Ancient royal stelae field and archaeological zone representing the Aksumite kingdom''s monumental heritage.', 'Tigray', 'Axum', 1015, 'monument',
   ARRAY['https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=1200&q=80'], ARRAY['UNESCO','Stelae','Aksumite','Archaeology'], '{"lat":14.1306,"lng":38.719,"coordinates":[38.719,14.1306]}'::jsonb),
  ('Queen of Sheba Palace Ruins', 'Archaeological ruins near Axum associated with Aksumite history and regional legends.', 'Tigray', 'Axum', 1018, 'historical',
   ARRAY['https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=1200&q=80'], ARRAY['Archaeology','Ruins','Aksumite'], '{"lat":14.132,"lng":38.725,"coordinates":[38.725,14.132]}'::jsonb),
  ('Fasil Ghebbi Royal Enclosure', 'UNESCO-listed royal compound of castles, palaces, and walls from Gondar''s imperial period.', 'Amhara', 'Gondar', 740, 'historical',
   ARRAY['https://images.unsplash.com/photo-1578922746317-aac19659f663?w=1200&q=80'], ARRAY['UNESCO','Castle','Royal','History'], '{"lat":12.608,"lng":37.467,"coordinates":[37.467,12.608]}'::jsonb),
  ('Fasilides Bath', 'Historic royal bath compound in Gondar, famous for Timkat celebrations and stone architecture.', 'Amhara', 'Gondar', 742, 'historical',
   ARRAY['https://images.unsplash.com/photo-1578922746317-aac19659f663?w=1200&q=80'], ARRAY['History','Royal','Timkat','Architecture'], '{"lat":12.62,"lng":37.47,"coordinates":[37.47,12.62]}'::jsonb),
  ('Blue Nile Falls', 'Powerful waterfall on the Blue Nile near Bahir Dar, known locally as Tis Abay.', 'Amhara', 'Tis Abay', 565, 'nature',
   ARRAY['https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1200&q=80'], ARRAY['Waterfall','Blue Nile','Hiking'], '{"lat":11.485,"lng":37.59,"coordinates":[37.59,11.485]}'::jsonb),
  ('Lake Tana', 'Ethiopia''s largest lake and source region of the Blue Nile, with islands, boat routes, birds, and lakeside towns.', 'Amhara', 'Bahir Dar', 555, 'nature',
   ARRAY['https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1200&q=80'], ARRAY['Lake','Blue Nile','Boat Trip','Birding'], '{"lat":12.0,"lng":37.25,"coordinates":[37.25,12.0]}'::jsonb),
  ('Zegie Peninsula Coffee Forest', 'Forested peninsula on Lake Tana known for coffee, walking trails, lake views, and local communities.', 'Amhara', 'Zegie', 570, 'nature',
   ARRAY['https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=80'], ARRAY['Forest','Coffee','Lake Tana','Walking'], '{"lat":11.68,"lng":37.33,"coordinates":[37.33,11.68]}'::jsonb),
  ('Menz Guassa Community Conservation Area', 'Community-managed highland conservation area with grasslands, geladas, wolves, and trekking routes.', 'Amhara', 'Mehal Meda', 280, 'nature',
   ARRAY['https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80'], ARRAY['Community Conservation','Gelada','Trekking','Highlands'], '{"lat":10.32,"lng":39.77,"coordinates":[39.77,10.32]}'::jsonb),
  ('Mekele City', 'Northern Ethiopian city used as a gateway to Tigray heritage routes, markets, museums, and mountain landscapes.', 'Tigray', 'Mekele', 780, 'city',
   ARRAY['https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=1200&q=80'], ARRAY['City','Gateway','Markets'], '{"lat":13.4967,"lng":39.4753,"coordinates":[39.4753,13.4967]}'::jsonb),
  ('Adigrat Sandstone Landscapes', 'Scenic highland and sandstone landscape around Adigrat, with cliffs, viewpoints, and northern routes.', 'Tigray', 'Adigrat', 900, 'nature',
   ARRAY['https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80'], ARRAY['Sandstone','Viewpoints','Highlands'], '{"lat":14.277,"lng":39.46,"coordinates":[39.46,14.277]}'::jsonb),
  ('Debre Berhan Highland Route', 'Cool highland town and route north of Addis, known for escarpment views and access to Ankober and Menagesha routes.', 'Amhara', 'Debre Berhan', 130, 'city',
   ARRAY['https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80'], ARRAY['Highlands','City','Scenic Route'], '{"lat":9.68,"lng":39.53,"coordinates":[39.53,9.68]}'::jsonb),
  ('Ankober Escarpment', 'Historic highland route and escarpment viewpoint with dramatic drops toward the Afar lowlands.', 'Amhara', 'Ankober', 175, 'nature',
   ARRAY['https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80'], ARRAY['Escarpment','Viewpoint','Highlands'], '{"lat":9.57,"lng":39.73,"coordinates":[39.73,9.57]}'::jsonb),
  ('Menagesha Suba Forest', 'Historic forest reserve west of Addis Ababa with hiking trails, native trees, and mountain scenery.', 'Oromia', 'Menagesha', 45, 'nature',
   ARRAY['https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=80'], ARRAY['Forest','Hiking','Day Trip'], '{"lat":8.98,"lng":38.52,"coordinates":[38.52,8.98]}'::jsonb),
  ('Debre Zeit Crater Lakes', 'Cluster of volcanic crater lakes near Bishoftu, popular for resorts, birding, boating, and weekend escapes.', 'Oromia', 'Bishoftu', 45, 'nature',
   ARRAY['https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1200&q=80'], ARRAY['Crater Lakes','Weekend','Birding','Boating'], '{"lat":8.75,"lng":38.98,"coordinates":[38.98,8.75]}'::jsonb),
  ('Lake Hora', 'Crater lake in Bishoftu with walking routes, cultural events, and lakeside views.', 'Oromia', 'Bishoftu', 47, 'nature',
   ARRAY['https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1200&q=80'], ARRAY['Crater Lake','Walking','Birding'], '{"lat":8.76,"lng":38.99,"coordinates":[38.99,8.76]}'::jsonb),
  ('Choke Mountains', 'Highland mountain system in East Gojjam with trekking routes, endemic plants, and Blue Nile basin scenery.', 'Amhara', 'East Gojjam', 300, 'adventure',
   ARRAY['https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80'], ARRAY['Mountain','Trekking','Highlands'], '{"lat":10.7,"lng":37.83,"coordinates":[37.83,10.7]}'::jsonb),
  ('Dessie Highland Route', 'Mountain city and scenic route through Wollo highlands, viewpoints, markets, and northern travel connections.', 'Amhara', 'Dessie', 400, 'city',
   ARRAY['https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80'], ARRAY['City','Highlands','Scenic Route'], '{"lat":11.13,"lng":39.63,"coordinates":[39.63,11.13]}'::jsonb),
  ('Hayq Lake', 'Highland lake near Dessie known for birdlife, lakeside views, and Wollo travel routes.', 'Amhara', 'Hayq', 430, 'nature',
   ARRAY['https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1200&q=80'], ARRAY['Lake','Birding','Highlands'], '{"lat":11.32,"lng":39.68,"coordinates":[39.68,11.32]}'::jsonb),
  ('Debre Markos', 'East Gojjam city and gateway to Blue Nile gorge routes, markets, and highland countryside.', 'Amhara', 'Debre Markos', 300, 'city',
   ARRAY['https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=1200&q=80'], ARRAY['City','Gateway','Highlands'], '{"lat":10.34,"lng":37.72,"coordinates":[37.72,10.34]}'::jsonb),
  ('Blue Nile Gorge Viewpoint', 'Dramatic canyon viewpoint on the road between Addis Ababa and Bahir Dar.', 'Amhara', 'Blue Nile Gorge', 220, 'nature',
   ARRAY['https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80'], ARRAY['Gorge','Viewpoint','Road Trip'], '{"lat":10.08,"lng":38.18,"coordinates":[38.18,10.08]}'::jsonb),
  ('Assosa Bamboo and Lowland Route', 'Western Ethiopia route with lowland landscapes, bamboo areas, markets, and cross-cultural travel.', 'Benishangul-Gumuz', 'Assosa', 660, 'cultural',
   ARRAY['https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200&q=80'], ARRAY['Lowlands','Markets','Culture'], '{"lat":10.07,"lng":34.53,"coordinates":[34.53,10.07]}'::jsonb),
  ('Sheikh Hussein Heritage Site', 'Important Islamic heritage and pilgrimage town with historic shrines, caves, and Bale lowland routes.', 'Oromia', 'Sheikh Hussein', 610, 'sacred',
   ARRAY['https://images.unsplash.com/photo-1578922746317-aac19659f663?w=1200&q=80'], ARRAY['Islamic Heritage','Pilgrimage','Historic'], '{"lat":7.75,"lng":40.7,"coordinates":[40.7,7.75]}'::jsonb),
  ('Babille Elephant Sanctuary', 'Protected area east of Harar associated with elephants, dryland landscapes, and wildlife conservation.', 'Oromia', 'Babille', 560, 'park',
   ARRAY['https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200&q=80'], ARRAY['Elephants','Wildlife','Conservation'], '{"lat":9.22,"lng":42.33,"coordinates":[42.33,9.22]}'::jsonb),
  ('Rift Valley Lakes Route', 'Scenic route linking Ziway, Langano, Abijatta, Shalla, Hawassa, and surrounding birding stops.', 'Oromia', 'Rift Valley', 190, 'nature',
   ARRAY['https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1200&q=80'], ARRAY['Road Trip','Lakes','Birding','Weekend'], '{"lat":7.65,"lng":38.72,"coordinates":[38.72,7.65]}'::jsonb)
)
INSERT INTO destinations (name, description, region, city, distance, category, images, tags, location)
SELECT nd.name, nd.description, nd.region, nd.city, nd.distance, nd.category, nd.images, nd.tags, nd.location
FROM new_destinations nd
WHERE NOT EXISTS (
  SELECT 1
  FROM destinations d
  WHERE lower(d.name) = lower(nd.name)
    AND lower(coalesce(d.city, '')) = lower(coalesce(nd.city, ''))
);

-- 3) Safety check query for manual review.
-- SELECT category, count(*) FROM destinations GROUP BY category ORDER BY category;
