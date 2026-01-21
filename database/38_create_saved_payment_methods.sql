-- ============================================
-- SAVED PAYMENT METHODS TABLE
-- Allow users to save payment methods for faster checkout
-- ============================================

CREATE TABLE IF NOT EXISTS saved_payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  
  -- Payment method details
  type TEXT NOT NULL CHECK (type IN ('mobile_money', 'card', 'bank_account')),
  provider TEXT NOT NULL CHECK (provider IN ('chapa', 'telebirr', 'cbe', 'amole', 'm_pesa', 'other')),
  name TEXT NOT NULL, -- Display name (e.g., "My Telebirr", "Primary Card")
  
  -- Encrypted/safe storage (only last 4 digits for cards, full number for mobile money)
  account_number TEXT NOT NULL, -- Last 4 digits for cards, full number for mobile money
  masked_number TEXT, -- Display version (e.g., "****1234")
  
  -- Additional details (JSONB for flexibility)
  metadata JSONB, -- Store provider-specific data
  
  -- Default flag
  is_default BOOLEAN DEFAULT FALSE,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure only one default per user
  CONSTRAINT unique_default_per_user UNIQUE NULLS NOT DISTINCT (user_id, is_default) WHERE is_default = TRUE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_saved_payment_methods_user ON saved_payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_payment_methods_active ON saved_payment_methods(user_id, is_active) WHERE is_active = TRUE;

-- Enable RLS
ALTER TABLE saved_payment_methods ENABLE ROW LEVEL SECURITY;

-- Users can view their own payment methods
CREATE POLICY "Users can view own payment methods" ON saved_payment_methods
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own payment methods
CREATE POLICY "Users can create own payment methods" ON saved_payment_methods
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own payment methods
CREATE POLICY "Users can update own payment methods" ON saved_payment_methods
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own payment methods
CREATE POLICY "Users can delete own payment methods" ON saved_payment_methods
  FOR DELETE USING (auth.uid() = user_id);

-- Function to ensure only one default payment method per user
CREATE OR REPLACE FUNCTION ensure_single_default_payment_method()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting a new default, unset all other defaults for this user
  IF NEW.is_default = TRUE THEN
    UPDATE saved_payment_methods
    SET is_default = FALSE, updated_at = NOW()
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_default = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to enforce single default
DROP TRIGGER IF EXISTS trigger_ensure_single_default_payment_method ON saved_payment_methods;
CREATE TRIGGER trigger_ensure_single_default_payment_method
  BEFORE INSERT OR UPDATE ON saved_payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_default_payment_method();

-- ============================================
-- COMPLETED
-- ============================================
-- saved_payment_methods table created with RLS policies
-- Users can save multiple payment methods
-- Only one default payment method per user
