-- Create page_elements table for storing draggable page elements
CREATE TABLE public.page_elements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID NOT NULL,
  user_id UUID NOT NULL,
  element_type TEXT NOT NULL, -- 'text', 'image', 'video', 'button', 'container'
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  position JSONB NOT NULL DEFAULT '{"x": 0, "y": 0, "width": 200, "height": 100, "zIndex": 1}'::jsonb,
  styles JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.page_elements ENABLE ROW LEVEL SECURITY;

-- Create policies for page elements
CREATE POLICY "Users can view their own page elements" 
ON public.page_elements 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own page elements" 
ON public.page_elements 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own page elements" 
ON public.page_elements 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own page elements" 
ON public.page_elements 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_page_elements_updated_at
BEFORE UPDATE ON public.page_elements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();