-- ============================================
-- TANKUA ROW LEVEL SECURITY (RLS)
-- Step 2: Enable RLS and create security policies
-- ============================================

-- ============================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
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

-- ============================================
-- COMPLETED
-- ============================================
-- Row Level Security enabled and policies created!
-- Next: Run 03_seed_data.sql to add sample data

