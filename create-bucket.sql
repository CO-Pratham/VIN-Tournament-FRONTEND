-- Create storage bucket for tournament banners
INSERT INTO storage.buckets (id, name, public) VALUES ('tournament-banners', 'tournament-banners', true);

-- Storage policies for tournament banners
CREATE POLICY "Anyone can view tournament banners" ON storage.objects FOR SELECT USING (bucket_id = 'tournament-banners');
CREATE POLICY "Authenticated users can upload tournament banners" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'tournament-banners' AND auth.role() = 'authenticated');