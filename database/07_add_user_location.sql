-- ============================================
-- ADD LOCATION FIELD TO USERS TABLE
-- Run this after 01_create_tables.sql
-- ============================================

-- Add location field to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS location TEXT DEFAULT '';

-- Add comment for documentation
COMMENT ON COLUMN users.location IS 'User location/address (city, address, etc.)';

-- ============================================
-- COMPLETED
-- ============================================
-- Location field has been added to users table!
-- Users can now update their location in their profile.


