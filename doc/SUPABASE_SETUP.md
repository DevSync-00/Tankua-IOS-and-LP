# Supabase Setup Guide for Tankua

Complete guide to set up Supabase as the backend for your Tankua church trip booking app.

## Why Supabase?

- ✅ Open source (self-hostable)
- ✅ PostgreSQL database (powerful and scalable)
- ✅ Built-in authentication (including Phone/SMS)
- ✅ Real-time subscriptions
- ✅ Storage for images
- ✅ Row Level Security (RLS)
- ✅ Auto-generated REST API
- ✅ Free tier available

## Step 1: Create Supabase Project (5 minutes)

1. **Sign Up/Login**
   - Go to https://supabase.com/
   - Click "Start your project"
   - Sign in with GitHub (recommended) or Email

2. **Create New Project**
   - Click "New Project"
   - Organization: Select or create one
   - Project Name: **Tankua**
   - Database Password: Create a strong password (save it securely!)
   - Region: Choose **Asia Pacific (Mumbai)** (closest to Ethiopia)
   - Click "Create new project"
   - Wait 2-3 minutes for setup

## Step 2: Get Your API Keys (2 minutes)

1. **Find Your Credentials**
   - Go to **Project Settings** (gear icon in sidebar)
   - Click **API** in the left menu
   - You'll see:
     - **Project URL**: `https://xxxxx.supabase.co`
     - **anon public key**: Long string starting with `eyJ...`

2. **Update Your App**
   - Open `src/config/supabase.js`
   - Replace the placeholders:

```javascript
const supabaseUrl = 'https://xxxxx.supabase.co'; // Your Project URL
const supabaseAnonKey = 'eyJ...'; // Your anon public key
```

## Step 3: Create Database Tables (10 minutes)

1. **Go to SQL Editor**
   - In Supabase dashboard, click **SQL Editor** in sidebar
   - Click **New Query**

2. **Run This SQL Script**
   - Copy and paste the entire script below:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number TEXT UNIQUE NOT NULL,
  name TEXT DEFAULT '',
  email TEXT DEFAULT '',
  emergency_contact TEXT DEFAULT '',
  saved_churches UUID[] DEFAULT '{}',
  saved_stations UUID[] DEFAULT '{}',
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CHURCHES TABLE
-- ============================================
CREATE TABLE churches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  region TEXT,
  city TEXT,
  distance NUMERIC,
  images TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  location JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRIPS TABLE
-- ============================================
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID REFERENCES churches(id) ON DELETE CASCADE,
  trip_type TEXT CHECK (trip_type IN ('group', 'private', 'holiday')),
  date DATE NOT NULL,
  price NUMERIC NOT NULL,
  available_seats INTEGER,
  total_seats INTEGER,
  itinerary TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PICKUP STATIONS TABLE
-- ============================================
CREATE TABLE pickup_stations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  city TEXT,
  address TEXT,
  lat NUMERIC NOT NULL,
  lng NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRIP PICKUP STATIONS (Junction Table)
-- ============================================
CREATE TABLE trip_pickup_stations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  station_id UUID REFERENCES pickup_stations(id) ON DELETE CASCADE,
  pickup_time TEXT NOT NULL,
  extra_price NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trip_id, station_id)
);

-- ============================================
-- BOOKINGS TABLE
-- ============================================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  trip_id UUID REFERENCES trips(id),
  church_id UUID REFERENCES churches(id),
  church_name TEXT NOT NULL,
  trip_type TEXT,
  date DATE NOT NULL,
  pickup_station JSONB NOT NULL,
  seats INTEGER NOT NULL,
  vehicle_type TEXT,
  payment_method TEXT,
  total_price NUMERIC NOT NULL,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'completed', 'cancelled')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  qr_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DRIVERS TABLE
-- ============================================
CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  plate_number TEXT UNIQUE NOT NULL,
  license_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_trips_church_id ON trips(church_id);
CREATE INDEX idx_trips_date ON trips(date);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX idx_trip_pickup_stations_trip_id ON trip_pickup_stations(trip_id);
CREATE INDEX idx_trip_pickup_stations_station_id ON trip_pickup_stations(station_id);
```

3. **Run the Query**
   - Click **RUN** or press Ctrl+Enter
   - You should see "Success. No rows returned"

## Step 4: Enable Row Level Security (RLS) (5 minutes)

Row Level Security ensures users can only access their own data.

1. **Run This SQL Script**
   - Create a new query and run:

```sql
-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickup_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_pickup_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS POLICIES
-- ============================================
-- Users can read all user profiles
CREATE POLICY "Users can read all profiles"
  ON users FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- CHURCHES POLICIES
-- ============================================
-- Everyone can read churches
CREATE POLICY "Anyone can read churches"
  ON churches FOR SELECT
  USING (true);

-- Only admins can manage churches
CREATE POLICY "Admins can manage churches"
  ON churches FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- ============================================
-- TRIPS POLICIES
-- ============================================
-- Everyone can read trips
CREATE POLICY "Anyone can read trips"
  ON trips FOR SELECT
  USING (true);

-- Only admins can manage trips
CREATE POLICY "Admins can manage trips"
  ON trips FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- ============================================
-- PICKUP STATIONS POLICIES
-- ============================================
-- Everyone can read stations
CREATE POLICY "Anyone can read pickup stations"
  ON pickup_stations FOR SELECT
  USING (true);

-- Only admins can manage stations
CREATE POLICY "Admins can manage stations"
  ON pickup_stations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- ============================================
-- TRIP PICKUP STATIONS POLICIES
-- ============================================
-- Everyone can read trip stations
CREATE POLICY "Anyone can read trip stations"
  ON trip_pickup_stations FOR SELECT
  USING (true);

-- Only admins can manage trip stations
CREATE POLICY "Admins can manage trip stations"
  ON trip_pickup_stations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- ============================================
-- BOOKINGS POLICIES
-- ============================================
-- Users can read their own bookings
CREATE POLICY "Users can read own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can read all bookings
CREATE POLICY "Admins can read all bookings"
  ON bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- Users can create bookings
CREATE POLICY "Users can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only admins can update bookings
CREATE POLICY "Admins can update bookings"
  ON bookings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- ============================================
-- DRIVERS POLICIES
-- ============================================
-- Only admins can access drivers
CREATE POLICY "Only admins can access drivers"
  ON drivers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );
```

2. **Run the Query**
   - Click **RUN**
   - You should see "Success"

## Step 5: Enable Phone Authentication (5 minutes)

1. **Go to Authentication Settings**
   - Click **Authentication** in sidebar
   - Click **Providers** tab

2. **Enable Phone Provider**
   - Find **Phone** in the list
   - Toggle it **ON**

3. **Configure SMS Provider (Choose One)**

   **Option A: Twilio (Recommended for Production)**
   - Sign up at https://twilio.com/
   - Get your Account SID and Auth Token
   - Get a phone number with SMS capability
   - In Supabase, enter your Twilio credentials
   - Message Template: Use default or customize

   **Option B: For Development/Testing**
   - You can skip SMS setup initially
   - Use test phone numbers (see below)

4. **Add Test Phone Numbers (Development)**
   - Scroll down to "Phone Numbers"
   - Click "Add test phone number"
   - Phone: `+251900000000`
   - OTP: `123456`
   - This lets you test without real SMS

## Step 6: Enable Storage (for Church Images & Provider Documents) (5 minutes)

1. **Go to Storage**
   - Click **Storage** in sidebar
   - Click **Create a new bucket**

2. **Create Buckets**
   - Create bucket: **churches**
     - Public: ✓ Yes
     - Click "Create bucket"
   
   - Create bucket: **users**
     - Public: ✗ No
     - Click "Create bucket"
   
   - Create bucket: **provider-docs** (for provider registration documents)
     - Public: ✗ No (Private)
     - File size limit: 5 MB
     - Allowed MIME types: `application/pdf, image/png, image/jpeg`
     - Click "Create bucket"

3. **Set Storage Policies**
   - Click on **churches** bucket
   - Click **Policies** tab
   - Click **New Policy**
   - Template: "Enable read access for all users"
   - Click "Review" then "Save policy"
   
   - Click on **provider-docs** bucket
   - Click **Policies** tab
   - Create policy for uploads:
     - Policy name: "Allow authenticated uploads"
     - Policy definition: `(bucket_id = 'provider-docs'::text) AND (auth.role() = 'authenticated'::text)`
     - Operations: INSERT
   - Create policy for admin reads:
     - Policy name: "Allow admin reads"
     - Policy definition: Check if user is admin (see SQL below)
     - Operations: SELECT

## Step 7: Seed Sample Data (10 minutes)

Now let's add sample Ethiopian churches and pickup stations!

1. **Go to SQL Editor**
2. **Run This Seed Script**:

```sql
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
    'UNESCO World Heritage Site featuring rock-hewn churches dating back to the 12th century.',
    'Amhara',
    'Lalibela',
    642.3,
    ARRAY['https://images.unsplash.com/photo-1578922746317-aac19659f663?w=800'],
    ARRAY['UNESCO', 'Historic', 'Pilgrimage', 'Rock-Hewn'],
    '{"lat": 12.0316, "lng": 39.0476}'::jsonb
  ),
  (
    'የአክሱም ጽዮን ቅድስተ ቅዱሳን ቤተክርስቲያን',
    'Ancient church in Axum believed to house the Ark of the Covenant.',
    'Tigray',
    'Axum',
    1024.8,
    ARRAY['https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800'],
    ARRAY['Ancient', 'Sacred', 'Ark of Covenant', 'Orthodox'],
    '{"lat": 14.1311, "lng": 38.7169}'::jsonb
  ),
  (
    'የባሕር ዳር ጊዮርጊስ ቤተክርስቲያን',
    'Beautiful church overlooking Lake Tana, surrounded by ancient monasteries.',
    'Amhara',
    'Bahir Dar',
    564.5,
    ARRAY['https://images.unsplash.com/photo-1605106901227-991bd663255c?w=800'],
    ARRAY['Lake Tana', 'Scenic', 'Orthodox', 'Monasteries'],
    '{"lat": 11.5931, "lng": 37.3896}'::jsonb
  ),
  (
    'የጎንደር ደብረ ብርሃን ሥላሴ ቤተክርስቲያን',
    'Historic church in the royal city of Gondar, featuring stunning frescoes.',
    'Amhara',
    'Gondar',
    738.2,
    ARRAY['https://images.unsplash.com/photo-1578922746317-aac19659f663?w=800'],
    ARRAY['Royal City', 'Historic', 'Frescoes', 'Orthodox'],
    '{"lat": 12.6092, "lng": 37.4661}'::jsonb
  );

-- ============================================
-- SEED PICKUP STATIONS
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
  ('Dawit Tesfaye', '+251933456789', 'suv', '3-34567', 'ETH-DL-345678', 'active');
```

3. **Run the Query**
   - Click **RUN**
   - You should see "Success. 15 rows affected" (or similar)

4. **Verify Data**
   - Click **Table Editor** in sidebar
   - Check **churches**, **pickup_stations**, and **drivers** tables
   - You should see your sample data!

## Step 8: Install Dependencies & Run App (5 minutes)

1. **Install Packages**
```bash
npm install
```

2. **Start the App**
```bash
npm start
```

3. **Test Login**
   - Use test phone: `+251900000000`
   - OTP: `123456`

## Step 9: Make Yourself Admin

After you log in:

1. **Find Your User ID**
   - Go to Supabase Dashboard → **Table Editor**
   - Click **users** table
   - Find your user (by phone number)
   - Copy the **id** (UUID)

2. **Update to Admin**
   - Click on your user row
   - Change `is_admin` from `false` to `true`
   - Click **Save**

3. **Restart App**
   - You should now see the Admin tab!

## Step 10: Create Sample Trips (Optional)

Run this SQL to create trips with pickup stations:

```sql
-- First, get church and station IDs
DO $$
DECLARE
  church_id1 UUID;
  church_id2 UUID;
  station_id1 UUID;
  station_id2 UUID;
  station_id3 UUID;
  trip_id UUID;
BEGIN
  -- Get church IDs
  SELECT id INTO church_id1 FROM churches WHERE city = 'Addis Ababa' LIMIT 1;
  SELECT id INTO church_id2 FROM churches WHERE city = 'Lalibela' LIMIT 1;
  
  -- Get station IDs
  SELECT id INTO station_id1 FROM pickup_stations WHERE name = 'Meskel Square';
  SELECT id INTO station_id2 FROM pickup_stations WHERE name = 'Piazza';
  SELECT id INTO station_id3 FROM pickup_stations WHERE name = 'Mexico Square';
  
  -- Create trip 1
  INSERT INTO trips (church_id, trip_type, date, price, available_seats, total_seats, itinerary, status)
  VALUES (church_id1, 'group', CURRENT_DATE + INTERVAL '7 days', 500, 45, 50, 'Departure at 6:00 AM, guided tour, lunch included, return journey', 'active')
  RETURNING id INTO trip_id;
  
  -- Link stations to trip 1
  INSERT INTO trip_pickup_stations (trip_id, station_id, pickup_time, extra_price) VALUES
    (trip_id, station_id1, '5:30 AM', 0),
    (trip_id, station_id2, '5:45 AM', 0),
    (trip_id, station_id3, '6:00 AM', 25);
  
  -- Create trip 2
  INSERT INTO trips (church_id, trip_type, date, price, available_seats, total_seats, itinerary, status)
  VALUES (church_id2, 'holiday', CURRENT_DATE + INTERVAL '14 days', 750, 30, 35, 'Special holiday pilgrimage to Lalibela rock churches', 'active')
  RETURNING id INTO trip_id;
  
  -- Link stations to trip 2
  INSERT INTO trip_pickup_stations (trip_id, station_id, pickup_time, extra_price) VALUES
    (trip_id, station_id1, '5:00 AM', 50),
    (trip_id, station_id2, '5:15 AM', 25);
END $$;
```

## Troubleshooting

### Error: "Invalid API key"
- **Solution**: Double-check your URL and anon key in `src/config/supabase.js`

### Error: "Row level security policy violation"
- **Solution**: Make sure you ran the RLS policies SQL script

### Phone authentication not working
- **Solution**: 
  - Check that Phone provider is enabled
  - Use test phone number for development
  - For production, configure Twilio

### Can't create bookings
- **Solution**: Make sure you're logged in and the booking policies are set correctly

### Tables not showing up
- **Solution**: Refresh the Table Editor page or check SQL Editor for errors

## Supabase Dashboard Quick Links

- **Table Editor**: View and edit data
- **SQL Editor**: Run custom queries
- **Authentication**: Manage users
- **Storage**: Manage files
- **API Docs**: Auto-generated API documentation

## Next Steps

✅ Your Supabase backend is ready!

Now you can:
1. Test the complete booking flow
2. Add more churches via admin panel
3. Create trips and link pickup stations
4. Test map views and station selection
5. Generate QR tickets

## Advantages of Supabase Over Firebase

1. **Open Source**: Can self-host if needed
2. **PostgreSQL**: More powerful queries, joins, stored procedures
3. **Direct SQL Access**: Full control over your database
4. **Better Pricing**: More generous free tier
5. **Real-time**: Built-in for all tables
6. **Type Safety**: Auto-generated TypeScript types

Your Tankua app is now running on Supabase! 🎉

