import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Page {
  id: string;
  slug: string;
  title: string;
  is_published: boolean;
  content: any;
  user_id: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const usePages = () => {
  const queryClient = useQueryClient();

  const { data: pages = [], isLoading, error } = useQuery({
    queryKey: ['pages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Page[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const createPageMutation = useMutation({
    mutationFn: async (newPage: Omit<Page, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('pages')
        .insert([{ ...newPage, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      toast.success('Page created successfully!');
    },
    onError: (error: any) => {
      toast.error('Error creating page: ' + error.message);
    },
  });

  const updatePageMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Page> & { id: string }) => {
      const { data, error } = await supabase
        .from('pages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      toast.success('Page updated successfully!');
    },
    onError: (error: any) => {
      toast.error('Error updating page: ' + error.message);
    },
  });

  const deletePageMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      toast.success('Page deleted successfully!');
    },
    onError: (error: any) => {
      toast.error('Error deleting page: ' + error.message);
    },
  });

  const invalidatePages = () => {
    queryClient.invalidateQueries({ queryKey: ['pages'] });
  };

  return {
    pages,
    isLoading,
    error,
    createPage: createPageMutation.mutate,
    updatePage: updatePageMutation.mutate,
    deletePage: deletePageMutation.mutate,
    isCreating: createPageMutation.isPending,
    isUpdating: updatePageMutation.isPending,
    isDeleting: deletePageMutation.isPending,
    invalidatePages,
  };
};