-- ============================================
-- TANKUA DATABASE SCHEMA
-- Step 1: Create all tables
-- ============================================

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

-- ============================================
-- COMPLETED
-- ============================================
-- Tables created successfully!
-- Next: Run 02_enable_rls.sql to set up security policies

