-- Create user_profiles table
CREATE TABLE user_profiles (
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

-- Create tournaments table
CREATE TABLE tournaments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  game VARCHAR(100) NOT NULL,
  mode VARCHAR(50) NOT NULL,
  entry_fee INTEGER DEFAULT 0,
  prize INTEGER DEFAULT 0,
  max_participants INTEGER DEFAULT 100,
  date TIMESTAMPTZ NOT NULL,
  map VARCHAR(100),
  description TEXT,
  rules TEXT,
  status VARCHAR(20) DEFAULT 'upcoming',
  organizer_id UUID REFERENCES auth.users(id),
  banner_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tournament_participants table
CREATE TABLE tournament_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  player_name VARCHAR(255),
  game_id VARCHAR(255),
  whatsapp_no VARCHAR(20),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tournament_id, user_id)
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Anyone can view profiles" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for tournaments
CREATE POLICY "Anyone can view tournaments" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create tournaments" ON tournaments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Organizers can update their tournaments" ON tournaments FOR UPDATE USING (auth.uid() = organizer_id);

-- Policies for tournament_participants
CREATE POLICY "Anyone can view participants" ON tournament_participants FOR SELECT USING (true);
CREATE POLICY "Authenticated users can join tournaments" ON tournament_participants FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can leave tournaments they joined" ON tournament_participants FOR DELETE USING (auth.uid() = user_id);
