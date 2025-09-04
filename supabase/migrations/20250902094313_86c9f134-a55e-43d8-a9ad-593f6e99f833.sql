-- Create photos table for photography portfolio (fixed)
CREATE TABLE public.photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  src TEXT NOT NULL,
  alt TEXT NOT NULL,
  grid_position INTEGER NOT NULL DEFAULT 0,
  grid_class TEXT NOT NULL DEFAULT 'col-span-1 row-span-1',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- Create policies for photo access
CREATE POLICY "Photos are viewable by everyone" 
ON public.photos 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own photos or public photos" 
ON public.photos 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own photos or admin can update public photos" 
ON public.photos 
FOR UPDATE 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own photos or admin can delete public photos" 
ON public.photos 
FOR DELETE 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_photos_updated_at
BEFORE UPDATE ON public.photos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default photos (user_id will be null for public photos)
INSERT INTO public.photos (src, alt, grid_position, grid_class) VALUES
('https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&h=400&fit=crop&crop=center', 'Luxury Hotel Interior', 0, 'col-span-2 row-span-2'),
('https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&h=400&fit=crop&crop=center', 'African Safari Wildlife', 1, 'col-span-1 row-span-2'),
('https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=600&h=400&fit=crop&crop=center', 'Boutique Hotel Design', 2, 'col-span-1 row-span-1'),
('https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&h=400&fit=crop&crop=center', 'African Landscape', 3, 'col-span-2 row-span-1'),
('https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop&crop=center', 'Resort Pool Photography', 4, 'col-span-1 row-span-2'),
('https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop&crop=center', 'Cultural Travel Photography', 5, 'col-span-1 row-span-1');