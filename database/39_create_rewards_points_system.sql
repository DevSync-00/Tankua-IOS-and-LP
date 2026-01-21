-- ============================================
-- REWARDS POINTS SYSTEM
-- Track user loyalty points, earnings, and redemptions
-- ============================================

-- Create rewards_points table to track current balance
CREATE TABLE IF NOT EXISTS rewards_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Current balance
  current_points INTEGER DEFAULT 0 NOT NULL CHECK (current_points >= 0),
  
  -- Lifetime totals
  total_earned INTEGER DEFAULT 0 NOT NULL CHECK (total_earned >= 0),
  total_redeemed INTEGER DEFAULT 0 NOT NULL CHECK (total_redeemed >= 0),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create rewards_transactions table for history
CREATE TABLE IF NOT EXISTS rewards_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  
  -- Transaction details
  type TEXT NOT NULL CHECK (type IN ('earned', 'redeemed', 'expired', 'adjusted')),
  amount INTEGER NOT NULL, -- Positive for earned, negative for redeemed
  description TEXT NOT NULL,
  
  -- Source reference
  source_type TEXT, -- 'booking', 'referral', 'promotion', 'manual', etc.
  source_id UUID, -- Reference to booking_id, referral_id, etc.
  
  -- Expiration (if applicable)
  expires_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rewards_points_user ON rewards_points(user_id);
CREATE INDEX IF NOT EXISTS idx_rewards_transactions_user ON rewards_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_rewards_transactions_type ON rewards_transactions(type);
CREATE INDEX IF NOT EXISTS idx_rewards_transactions_created ON rewards_transactions(created_at DESC);

-- Enable RLS
ALTER TABLE rewards_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own rewards
CREATE POLICY "Users can view own rewards" ON rewards_points
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own reward transactions" ON rewards_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Function to update rewards balance
CREATE OR REPLACE FUNCTION update_rewards_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert rewards_points record
  INSERT INTO rewards_points (user_id, current_points, total_earned, total_redeemed, updated_at)
  VALUES (
    NEW.user_id,
    CASE 
      WHEN NEW.type = 'earned' THEN NEW.amount
      WHEN NEW.type = 'redeemed' THEN -NEW.amount
      ELSE 0
    END,
    CASE WHEN NEW.type = 'earned' THEN NEW.amount ELSE 0 END,
    CASE WHEN NEW.type = 'redeemed' THEN NEW.amount ELSE 0 END,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    current_points = GREATEST(0, rewards_points.current_points + 
      CASE 
        WHEN NEW.type = 'earned' THEN NEW.amount
        WHEN NEW.type = 'redeemed' THEN -NEW.amount
        WHEN NEW.type = 'expired' THEN -NEW.amount
        ELSE 0
      END),
    total_earned = rewards_points.total_earned + 
      CASE WHEN NEW.type = 'earned' THEN NEW.amount ELSE 0 END,
    total_redeemed = rewards_points.total_redeemed + 
      CASE WHEN NEW.type IN ('redeemed', 'expired') THEN ABS(NEW.amount) ELSE 0 END,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update balance on transaction
DROP TRIGGER IF EXISTS trigger_update_rewards_balance ON rewards_transactions;
CREATE TRIGGER trigger_update_rewards_balance
  AFTER INSERT ON rewards_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_rewards_balance();

-- Function to award points for booking completion
CREATE OR REPLACE FUNCTION award_points_for_booking()
RETURNS TRIGGER AS $$
DECLARE
  points_to_award INTEGER := 10; -- 10 points per booking
BEGIN
  -- Only award points when booking is completed and paid
  IF NEW.status = 'completed' AND NEW.payment_status = 'paid' AND 
     (OLD.status IS NULL OR OLD.status != 'completed' OR OLD.payment_status != 'paid') THEN
    
    -- Insert reward transaction
    INSERT INTO rewards_transactions (
      user_id,
      type,
      amount,
      description,
      source_type,
      source_id
    ) VALUES (
      NEW.user_id,
      'earned',
      points_to_award,
      'Points earned for completed trip booking',
      'booking',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to award points on booking completion
DROP TRIGGER IF EXISTS trigger_award_points_for_booking ON bookings;
CREATE TRIGGER trigger_award_points_for_booking
  AFTER INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION award_points_for_booking();

-- ============================================
-- COMPLETED
-- ============================================
-- rewards_points table: tracks current balance per user
-- rewards_transactions table: full history of all point movements
-- Automatic point awarding on booking completion
-- Automatic balance updates via triggers
