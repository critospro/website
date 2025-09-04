-- Restore public access policy for projects to make them visible
CREATE POLICY "Anyone can view projects publicly" 
ON public.projects 
FOR SELECT 
USING (true);