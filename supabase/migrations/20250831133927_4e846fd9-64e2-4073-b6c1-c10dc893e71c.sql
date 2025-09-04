-- Remove the public access policy that exposes all projects
DROP POLICY IF EXISTS "Anyone can view projects publicly" ON public.projects;

-- The remaining policy "Users can view their own projects" will ensure only authenticated users can see their own projects
-- This provides proper data isolation and security