-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create storage buckets for avatars and tournament banners
INSERT INTO storage.buckets (id, name) 
VALUES ('avatars', 'avatars')
ON CONFLICT DO NOTHING;

INSERT INTO storage.buckets (id, name) 
VALUES ('tournament-banners', 'tournament-banners')
ON CONFLICT DO NOTHING;

-- Set up storage policies
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Anyone can upload an avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (auth.uid() = owner);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    player_id VARCHAR(50) UNIQUE NOT NULL,
    favorite_game VARCHAR(100),
    level INTEGER DEFAULT 1,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    total_earnings DECIMAL(10,2) DEFAULT 0,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT proper_player_id CHECK (player_id ~ '^VT-[A-Z0-9]{8}$')
);

-- Create function to generate player_id
CREATE OR REPLACE FUNCTION generate_player_id()
RETURNS VARCHAR(50) AS $$
DECLARE
    new_id VARCHAR(50);
    exists_already BOOLEAN;
BEGIN
    LOOP
        -- Generate a new ID with 'VT-' prefix and 8 random alphanumeric characters
        new_id := 'VT-' || upper(substring(md5(random()::text) from 1 for 8));
        
        -- Check if this ID already exists
        SELECT EXISTS (
            SELECT 1 FROM user_profiles WHERE player_id = new_id
        ) INTO exists_already;
        
        -- If it doesn't exist, return it
        IF NOT exists_already THEN
            RETURN new_id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create tournaments table
CREATE TABLE IF NOT EXISTS public.tournaments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    game VARCHAR(100) NOT NULL,
    mode VARCHAR(50) NOT NULL,
    entry_fee DECIMAL(10,2) DEFAULT 0,
    prize_pool DECIMAL(10,2) DEFAULT 0,
    max_participants INTEGER DEFAULT 100,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    registration_deadline TIMESTAMPTZ,
    map VARCHAR(100),
    description TEXT,
    rules TEXT,
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'in_progress', 'completed', 'cancelled')),
    organizer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    banner_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tournament_participants table
CREATE TABLE IF NOT EXISTS public.tournament_participants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    player_name VARCHAR(255) NOT NULL,
    game_id VARCHAR(255),
    whatsapp_no VARCHAR(20),
    team_name VARCHAR(255),
    registration_status VARCHAR(20) DEFAULT 'pending' CHECK (registration_status IN ('pending', 'confirmed', 'rejected')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'refunded')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tournament_id, user_id)
);

-- Create matches table
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    match_number INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    winner_id UUID REFERENCES auth.users(id),
    match_date TIMESTAMPTZ,
    result_details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tournament_id, round_number, match_number)
);

-- Create match_participants table
CREATE TABLE IF NOT EXISTS public.match_participants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 0,
    position INTEGER,
    status VARCHAR(20) DEFAULT 'ready' CHECK (status IN ('ready', 'playing', 'finished', 'forfeited')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(match_id, user_id)
);

-- Set up Row Level Security (RLS)

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_participants ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view all profiles"
    ON public.user_profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create their own profile"
    ON public.user_profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON public.user_profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Tournaments Policies
CREATE POLICY "Anyone can view tournaments"
    ON public.tournaments FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can create tournaments"
    ON public.tournaments FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update their tournaments"
    ON public.tournaments FOR UPDATE
    TO authenticated
    USING (auth.uid() = organizer_id);

-- Tournament Participants Policies
CREATE POLICY "Anyone can view tournament participants"
    ON public.tournament_participants FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can register for tournaments"
    ON public.tournament_participants FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their tournament registration"
    ON public.tournament_participants FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- Matches Policies
CREATE POLICY "Anyone can view matches"
    ON public.matches FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Only tournament organizers can manage matches"
    ON public.matches FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM tournaments t
            WHERE t.id = tournament_id
            AND t.organizer_id = auth.uid()
        )
    );

-- Match Participants Policies
CREATE POLICY "Anyone can view match participants"
    ON public.match_participants FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update their match status"
    ON public.match_participants FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- Create trigger to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tournaments_updated_at
    BEFORE UPDATE ON tournaments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at
    BEFORE UPDATE ON matches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to auto-generate player_id on profile creation
CREATE OR REPLACE FUNCTION set_player_id_on_profile_creation()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.player_id IS NULL THEN
        NEW.player_id := generate_player_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_generate_player_id
    BEFORE INSERT ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION set_player_id_on_profile_creation();