-- ============================================
-- CREATE PROVIDERS TABLE
-- Run after 01_create_tables.sql
-- ============================================

-- Create providers table for travel companies
CREATE TABLE IF NOT EXISTS providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  rating NUMERIC DEFAULT 0,
  total_trips INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_providers_status ON providers(status);

-- Add comment for documentation
COMMENT ON TABLE providers IS 'Travel company providers that offer trips to churches and monasteries';

-- ============================================
-- SEED SAMPLE PROVIDERS
-- ============================================

INSERT INTO providers (name, description, phone, email, logo_url, rating, total_trips) VALUES
  (
    'Ethio Travel Express',
    'Reliable travel company specializing in religious pilgrimages across Ethiopia. Over 10 years of experience.',
    '+251911234567',
    'info@ethiotravelexpress.com',
    'https://via.placeholder.com/200x200?text=Ethio+Travel',
    4.8,
    1250
  ),
  (
    'Sacred Journeys Ethiopia',
    'Premium travel services for church and monastery visits. Comfortable vehicles and experienced guides.',
    '+251922345678',
    'contact@sacredjourneys.et',
    'https://via.placeholder.com/200x200?text=Sacred+Journeys',
    4.9,
    890
  ),
  (
    'Pilgrim Tours',
    'Affordable group trips to holy sites. Perfect for families and groups seeking spiritual journeys.',
    '+251933456789',
    'bookings@pilgrimtours.et',
    'https://via.placeholder.com/200x200?text=Pilgrim+Tours',
    4.6,
    2100
  ),
  (
    'Tankua Travel Partners',
    'Official partner of Tankua platform. Trusted service with verified drivers and modern vehicles.',
    '+251944567890',
    'partners@tankua.et',
    'https://via.placeholder.com/200x200?text=Tankua+Partners',
    4.7,
    1560
  ),
  (
    'Heritage Travel Co.',
    'Cultural and religious tours with expert guides. Focus on historical significance and spiritual experience.',
    '+251955678901',
    'info@heritagetravel.et',
    'https://via.placeholder.com/200x200?text=Heritage+Travel',
    4.5,
    980
  );

-- ============================================
-- COMPLETED
-- ============================================
-- Providers table created with 5 sample travel companies
-- You can add more providers or update existing ones as needed

