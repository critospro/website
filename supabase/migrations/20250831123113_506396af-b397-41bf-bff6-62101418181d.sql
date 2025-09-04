-- Remove the insecure public access policy
DROP POLICY IF EXISTS "Anyone can view projects" ON public.projects;

-- Create a secure policy that only allows users to view their own projects
CREATE POLICY "Users can view their own projects" 
ON public.projects 
FOR SELECT 
USING (auth.uid() = user_id);