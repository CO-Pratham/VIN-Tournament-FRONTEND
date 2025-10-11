-- Migration: Create user_profiles table
-- Run this in your Supabase SQL Editor

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  username VARCHAR(255),
  email VARCHAR(255),
  player_id VARCHAR(50) UNIQUE,
  favorite_game VARCHAR(100),
  level INTEGER DEFAULT 1,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  total_earnings INTEGER DEFAULT 0,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view profiles" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_player_id ON user_profiles(player_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on profile update
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE user_profiles IS 'User profile information and gaming statistics';
COMMENT ON COLUMN user_profiles.player_id IS 'Unique player ID for the user (e.g., VIN#1234)';
COMMENT ON COLUMN user_profiles.favorite_game IS 'Users favorite game';
COMMENT ON COLUMN user_profiles.level IS 'User gaming level/rank';
COMMENT ON COLUMN user_profiles.wins IS 'Total tournament wins';
COMMENT ON COLUMN user_profiles.losses IS 'Total tournament losses';
COMMENT ON COLUMN user_profiles.total_earnings IS 'Total prize money earned';
