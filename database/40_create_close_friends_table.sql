-- ============================================
-- CLOSE FRIENDS SYSTEM
-- Allow users to add and manage close friends
-- ============================================

-- Create close_friends table
CREATE TABLE IF NOT EXISTS close_friends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  friend_user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_user_id),
  CHECK (user_id != friend_user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_close_friends_user_id ON close_friends(user_id);
CREATE INDEX IF NOT EXISTS idx_close_friends_friend_user_id ON close_friends(friend_user_id);

-- Enable RLS
ALTER TABLE close_friends ENABLE ROW LEVEL SECURITY;

-- Users can view their own close friends
CREATE POLICY "Users can view own close friends" ON close_friends
  FOR SELECT USING (auth.uid() = user_id);

-- Users can add their own close friends
CREATE POLICY "Users can add own close friends" ON close_friends
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own close friends
CREATE POLICY "Users can delete own close friends" ON close_friends
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- COMPLETED
-- ============================================
-- close_friends table: tracks user friendships
-- Bidirectional relationships can be created by adding both directions
