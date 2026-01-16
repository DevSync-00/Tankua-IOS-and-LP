-- ============================================
-- PAYMENT TRANSACTIONS TABLE
-- Track all payment attempts and their status
-- ============================================

-- Create payment transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  
  -- Payment details
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'ETB',
  payment_method TEXT NOT NULL CHECK (payment_method IN ('chapa', 'telebirr', 'cbe', 'amole', 'cash')),
  
  -- Transaction references
  transaction_ref TEXT UNIQUE NOT NULL,
  external_ref TEXT, -- Reference from payment provider
  checkout_url TEXT,
  
  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'success', 'failed', 'cancelled', 'refunded')),
  
  -- Payment provider response
  provider_response JSONB,
  error_message TEXT,
  
  -- Verification
  verified_at TIMESTAMPTZ,
  verified_by TEXT, -- 'webhook', 'manual', 'api'
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_transactions_booking ON payment_transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_ref ON payment_transactions(transaction_ref);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_external_ref ON payment_transactions(external_ref);

-- Enable RLS
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions" ON payment_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create transactions for their bookings
CREATE POLICY "Users can create transactions" ON payment_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- System can update transactions (for webhook processing)
CREATE POLICY "Service role can update transactions" ON payment_transactions
  FOR UPDATE USING (true);

-- ============================================
-- WEBHOOK LOGS TABLE
-- Track all incoming webhooks for debugging
-- ============================================

CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider TEXT NOT NULL,
  event_type TEXT,
  payload JSONB NOT NULL,
  headers JSONB,
  ip_address TEXT,
  processed BOOLEAN DEFAULT FALSE,
  processing_result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for cleanup
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created ON webhook_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_provider ON webhook_logs(provider);

-- ============================================
-- REFUNDS TABLE
-- Track refund requests and processing
-- ============================================

CREATE TABLE IF NOT EXISTS refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_transaction_id UUID REFERENCES payment_transactions(id),
  booking_id UUID REFERENCES bookings(id),
  user_id UUID REFERENCES users(id),
  
  -- Refund details
  amount NUMERIC NOT NULL,
  reason TEXT,
  refund_method TEXT, -- Same as payment or different
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processing', 'completed', 'rejected')),
  
  -- Processing details
  processed_by UUID REFERENCES admin_users(id),
  processed_at TIMESTAMPTZ,
  provider_refund_ref TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_refunds_booking ON refunds(booking_id);
CREATE INDEX IF NOT EXISTS idx_refunds_user ON refunds(user_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);

-- Enable RLS
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

-- Users can view their own refunds
CREATE POLICY "Users can view own refunds" ON refunds
  FOR SELECT USING (auth.uid() = user_id);

-- Users can request refunds
CREATE POLICY "Users can request refunds" ON refunds
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- UPDATE TRIGGER FOR updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payment_transactions_updated_at
  BEFORE UPDATE ON payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_refunds_updated_at
  BEFORE UPDATE ON refunds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE payment_transactions IS 'Tracks all payment attempts with full audit trail';
COMMENT ON TABLE webhook_logs IS 'Stores incoming webhook payloads for debugging and replay';
COMMENT ON TABLE refunds IS 'Manages refund requests and processing';


