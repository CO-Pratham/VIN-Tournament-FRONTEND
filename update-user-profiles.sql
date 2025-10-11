-- Add player_id column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS player_id VARCHAR(20) UNIQUE;

-- Update existing users with unique player IDs
UPDATE user_profiles 
SET player_id = 'VIN' || UPPER(SUBSTRING(user_id::text, 1, 6))
WHERE player_id IS NULL;

-- Add index for faster searches
CREATE INDEX IF NOT EXISTS idx_user_profiles_player_id ON user_profiles(player_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);

-- Update leaderboard query to include player_id
COMMENT ON COLUMN user_profiles.player_id IS 'Unique player identifier for easy searching';