-- Add columns for optimized images to photos table
ALTER TABLE public.photos 
ADD COLUMN IF NOT EXISTS webp_src TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_src TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_webp_src TEXT;