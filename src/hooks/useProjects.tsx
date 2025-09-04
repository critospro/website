import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Project {
  id: string;
  title: string;
  client: string;
  date: string;
  video_url?: string;
  thumbnail_url?: string;
  is_video: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const useProjects = () => {
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50); // Limit initial load

      if (error) throw error;
      return data as Project[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const invalidateProjects = () => {
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  };

  return {
    projects,
    isLoading,
    error,
    invalidateProjects,
  };
};