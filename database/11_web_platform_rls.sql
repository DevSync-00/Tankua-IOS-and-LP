-- ============================================
-- ROW LEVEL SECURITY FOR WEB PLATFORM TABLES
-- Run after 10_web_platform_schema.sql
-- ============================================

-- Enable RLS on all new tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ADMIN USERS POLICIES
-- ============================================
-- Only super_admin can see all admin users
CREATE POLICY "Admin users can view themselves"
  ON admin_users FOR SELECT
  USING (auth.uid()::text = id::text OR EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id::text = auth.uid()::text AND role = 'super_admin'
  ));

-- Only super_admin can manage admin users
CREATE POLICY "Super admin can manage admin users"
  ON admin_users FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id::text = auth.uid()::text AND role = 'super_admin'
  ));

-- ============================================
-- PROVIDER USERS POLICIES
-- ============================================
-- Provider users can see their own provider's staff
CREATE POLICY "Provider users can view own provider staff"
  ON provider_users FOR SELECT
  USING (
    provider_id IN (
      SELECT provider_id FROM provider_users 
      WHERE id::text = auth.uid()::text
    )
    OR EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id::text = auth.uid()::text
    )
  );

-- Provider owners can manage their staff
CREATE POLICY "Provider owners can manage staff"
  ON provider_users FOR ALL
  USING (
    provider_id IN (
      SELECT provider_id FROM provider_users 
      WHERE id::text = auth.uid()::text AND role = 'owner'
    )
    OR EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id::text = auth.uid()::text
    )
  );

-- ============================================
-- VEHICLES POLICIES
-- ============================================
-- Provider staff can view their vehicles
CREATE POLICY "Provider staff can view own vehicles"
  ON vehicles FOR SELECT
  USING (
    provider_id IN (
      SELECT provider_id FROM provider_users 
      WHERE id::text = auth.uid()::text
    )
    OR EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id::text = auth.uid()::text
    )
  );

-- Provider managers+ can manage vehicles
CREATE POLICY "Provider managers can manage vehicles"
  ON vehicles FOR ALL
  USING (
    provider_id IN (
      SELECT provider_id FROM provider_users 
      WHERE id::text = auth.uid()::text AND role IN ('owner', 'manager')
    )
    OR EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id::text = auth.uid()::text
    )
  );

-- ============================================
-- PAYOUTS POLICIES
-- ============================================
-- Provider owners can view their payouts
CREATE POLICY "Provider owners can view payouts"
  ON payouts FOR SELECT
  USING (
    provider_id IN (
      SELECT provider_id FROM provider_users 
      WHERE id::text = auth.uid()::text AND role = 'owner'
    )
    OR EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id::text = auth.uid()::text
    )
  );

-- Only admins can manage payouts
CREATE POLICY "Admins can manage payouts"
  ON payouts FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id::text = auth.uid()::text AND role IN ('super_admin', 'admin', 'finance')
  ));

-- ============================================
-- SUPPORT TICKETS POLICIES
-- ============================================
-- Users can view their own tickets
CREATE POLICY "Users can view own tickets"
  ON support_tickets FOR SELECT
  USING (
    user_id::text = auth.uid()::text
    OR provider_id IN (
      SELECT provider_id FROM provider_users 
      WHERE id::text = auth.uid()::text
    )
    OR EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id::text = auth.uid()::text
    )
  );

-- Users can create tickets
CREATE POLICY "Users can create tickets"
  ON support_tickets FOR INSERT
  WITH CHECK (
    user_id::text = auth.uid()::text
    OR provider_id IN (
      SELECT provider_id FROM provider_users 
      WHERE id::text = auth.uid()::text
    )
  );

-- Admins can manage all tickets
CREATE POLICY "Admins can manage tickets"
  ON support_tickets FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id::text = auth.uid()::text
  ));

-- ============================================
-- TICKET MESSAGES POLICIES
-- ============================================
-- Messages visible to ticket participants
CREATE POLICY "Ticket messages visible to participants"
  ON ticket_messages FOR SELECT
  USING (
    ticket_id IN (
      SELECT id FROM support_tickets 
      WHERE user_id::text = auth.uid()::text
        OR provider_id IN (
          SELECT provider_id FROM provider_users 
          WHERE id::text = auth.uid()::text
        )
        OR EXISTS (
          SELECT 1 FROM admin_users 
          WHERE id::text = auth.uid()::text
        )
    )
    AND (NOT is_internal OR EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id::text = auth.uid()::text
    ))
  );

-- Participants can add messages
CREATE POLICY "Participants can add messages"
  ON ticket_messages FOR INSERT
  WITH CHECK (
    ticket_id IN (
      SELECT id FROM support_tickets 
      WHERE user_id::text = auth.uid()::text
        OR provider_id IN (
          SELECT provider_id FROM provider_users 
          WHERE id::text = auth.uid()::text
        )
        OR EXISTS (
          SELECT 1 FROM admin_users 
          WHERE id::text = auth.uid()::text
        )
    )
  );

-- ============================================
-- REVIEWS POLICIES
-- ============================================
-- Public can view visible reviews
CREATE POLICY "Public can view visible reviews"
  ON reviews FOR SELECT
  USING (is_visible = TRUE);

-- Users can create reviews for their bookings
CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (
    user_id::text = auth.uid()::text
    AND booking_id IN (
      SELECT id FROM bookings 
      WHERE user_id::text = auth.uid()::text
    )
  );

-- Provider can respond to reviews
CREATE POLICY "Providers can respond to reviews"
  ON reviews FOR UPDATE
  USING (
    provider_id IN (
      SELECT provider_id FROM provider_users 
      WHERE id::text = auth.uid()::text
    )
    OR EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id::text = auth.uid()::text
    )
  );

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================
-- Recipients can view their notifications
CREATE POLICY "Recipients can view notifications"
  ON notifications FOR SELECT
  USING (recipient_id::text = auth.uid()::text);

-- Recipients can update (mark as read)
CREATE POLICY "Recipients can update notifications"
  ON notifications FOR UPDATE
  USING (recipient_id::text = auth.uid()::text);

-- Admins can create notifications
CREATE POLICY "Admins can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id::text = auth.uid()::text
  ));

-- ============================================
-- PROMOTIONS POLICIES
-- ============================================
-- Active promotions are public
CREATE POLICY "Active promotions are public"
  ON promotions FOR SELECT
  USING (is_active = TRUE AND valid_from <= NOW() AND valid_until >= NOW());

-- Admins can manage promotions
CREATE POLICY "Admins can manage promotions"
  ON promotions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id::text = auth.uid()::text
  ));

-- ============================================
-- PROMOTION USAGE POLICIES
-- ============================================
-- Users can view their usage
CREATE POLICY "Users can view own promotion usage"
  ON promotion_usage FOR SELECT
  USING (user_id::text = auth.uid()::text OR EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id::text = auth.uid()::text
  ));

-- Users can use promotions
CREATE POLICY "Users can use promotions"
  ON promotion_usage FOR INSERT
  WITH CHECK (user_id::text = auth.uid()::text);

-- ============================================
-- AUDIT LOGS POLICIES
-- ============================================
-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id::text = auth.uid()::text AND role IN ('super_admin', 'admin')
  ));

-- System can insert audit logs
CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (TRUE);

-- ============================================
-- SETTINGS POLICIES
-- ============================================
-- Admins can view settings
CREATE POLICY "Admins can view settings"
  ON settings FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id::text = auth.uid()::text
  ));

-- Super admin can manage settings
CREATE POLICY "Super admin can manage settings"
  ON settings FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id::text = auth.uid()::text AND role = 'super_admin'
  ));

-- ============================================
-- COMPLETED
-- ============================================
-- Row Level Security policies configured for all web platform tables

