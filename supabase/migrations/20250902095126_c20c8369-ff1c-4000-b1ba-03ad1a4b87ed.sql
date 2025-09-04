-- Create photos storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('photos', 'photos', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']);

-- Create storage policies for photos
CREATE POLICY "Anyone can view photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'photos');

CREATE POLICY "Anyone can upload photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'photos');

CREATE POLICY "Anyone can update photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'photos');

CREATE POLICY "Anyone can delete photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'photos');