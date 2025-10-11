-- Add banner_url column to existing tournaments table
ALTER TABLE tournaments ADD COLUMN banner_url TEXT;

-- Create storage bucket for tournament banners
INSERT INTO storage.buckets (id, name, public) VALUES ('tournament-banners', 'tournament-banners', true);

-- Storage policy for tournament banners
CREATE POLICY "Anyone can view tournament banners" ON storage.objects FOR SELECT USING (bucket_id = 'tournament-banners');
CREATE POLICY "Authenticated users can upload tournament banners" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'tournament-banners' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update their tournament banners" ON storage.objects FOR UPDATE USING (bucket_id = 'tournament-banners' AND auth.uid()::text = (storage.foldername(name))[1]);