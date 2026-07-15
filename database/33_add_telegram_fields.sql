-- Migration 33: Add Telegram login fields to the users table
-- Run this in your Supabase SQL Editor or via the CLI.

-- Add telegram_id column (text to avoid bigint overflow on some clients)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS telegram_id       TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS telegram_username TEXT,
  ADD COLUMN IF NOT EXISTS photo_url         TEXT;

-- Index for fast lookup during Telegram sign-in profile sync
CREATE INDEX IF NOT EXISTS users_telegram_id_idx ON public.users (telegram_id);

-- Comment for documentation
COMMENT ON COLUMN public.users.telegram_id       IS 'Telegram user numeric ID (string). Unique per user.';
COMMENT ON COLUMN public.users.telegram_username IS 'Telegram @username (without @). May be null if user has none.';
COMMENT ON COLUMN public.users.photo_url         IS 'Profile photo URL supplied by Telegram or other OAuth providers.';
