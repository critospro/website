-- Remove the insecure public access policy
DROP POLICY IF EXISTS "Anyone can view projects" ON public.projects;