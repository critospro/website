-- Create site settings table for full customization
CREATE TABLE public.site_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  setting_key text NOT NULL,
  setting_value jsonb NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, setting_key)
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own site settings" 
ON public.site_settings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own site settings" 
ON public.site_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own site settings" 
ON public.site_settings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own site settings" 
ON public.site_settings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create pages table for page management
CREATE TABLE public.pages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  slug text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}',
  is_published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, slug)
);

-- Enable RLS for pages
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- Create policies for pages
CREATE POLICY "Anyone can view published pages" 
ON public.pages 
FOR SELECT 
USING (is_published = true);

CREATE POLICY "Users can manage their own pages" 
ON public.pages 
FOR ALL
USING (auth.uid() = user_id);

-- Add triggers for automatic timestamp updates
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pages_updated_at
BEFORE UPDATE ON public.pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create default site settings for existing users
INSERT INTO public.site_settings (user_id, setting_key, setting_value) 
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'theme', '{"colors": {"primary": "0 0% 98%", "background": "0 0% 4%", "accent": "180 100% 35%"}, "logo": null, "siteName": "My Portfolio"}'),
  ('00000000-0000-0000-0000-000000000000', 'layout', '{"headerStyle": "default", "gridColumns": 3, "spacing": "normal"}')
ON CONFLICT (user_id, setting_key) DO NOTHING;