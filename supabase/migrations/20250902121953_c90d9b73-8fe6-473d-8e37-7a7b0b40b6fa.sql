-- Add object_fit column to photos table
ALTER TABLE public.photos 
ADD COLUMN object_fit TEXT DEFAULT 'cover' CHECK (object_fit IN ('cover', 'contain', 'fill', 'scale-down', 'none'));