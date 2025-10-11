-- Migration: Add registration fields to tournament_participants table
-- Run this in your Supabase SQL Editor

-- Add new columns to tournament_participants table
ALTER TABLE tournament_participants 
ADD COLUMN IF NOT EXISTS player_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS game_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS whatsapp_no VARCHAR(20);

-- Add comments for documentation
COMMENT ON COLUMN tournament_participants.player_name IS 'Player display name for the tournament';
COMMENT ON COLUMN tournament_participants.game_id IS 'In-game ID of the player';
COMMENT ON COLUMN tournament_participants.whatsapp_no IS 'WhatsApp contact number of the player';
