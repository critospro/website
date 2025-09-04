-- Add policy to allow public viewing of projects
CREATE POLICY "Anyone can view projects publicly" 
ON public.projects 
FOR SELECT 
USING (true);