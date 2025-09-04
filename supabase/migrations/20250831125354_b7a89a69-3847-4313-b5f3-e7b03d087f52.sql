-- Make videos bucket public so reels can be viewed
UPDATE storage.buckets 
SET public = true 
WHERE id = 'videos';