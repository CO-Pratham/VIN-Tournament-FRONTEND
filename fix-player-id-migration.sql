-- Fix Player ID Migration
-- Run this in your Supabase SQL Editor to fix existing profiles without player_id

-- First, let's see if there are any profiles without player_id
SELECT user_id, username, email, player_id 
FROM user_profiles 
WHERE player_id IS NULL;

-- Update existing profiles that don't have player_id
-- Generate VT- format player IDs for existing users
UPDATE user_profiles 
SET player_id = 'VT-' || UPPER(SUBSTRING(MD5(user_id::text), 1, 8))
WHERE player_id IS NULL;

-- Verify the update worked
SELECT user_id, username, email, player_id 
FROM user_profiles 
ORDER BY created_at DESC;

-- If you want to see all player IDs to verify format
SELECT player_id, COUNT(*) as count
FROM user_profiles 
GROUP BY player_id
ORDER BY count DESC;
