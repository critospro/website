import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SiteTheme {
  colors: {
    primary: string;
    background: string;
    accent: string;
    secondary?: string;
    foreground?: string;
  };
  logo?: string;
  siteName: string;
}

export interface SiteLayout {
  headerStyle: 'default' | 'minimal' | 'centered';
  gridColumns: number;
  spacing: 'tight' | 'normal' | 'loose';
}

export interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  user_id: string;
}

export const useSiteSettings = (userId?: string) => {
  const queryClient = useQueryClient();

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ['site-settings', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return data as SiteSetting[];
    },
    enabled: !!userId,
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      if (!userId) throw new Error('User ID required');

      const { data, error } = await supabase
        .from('site_settings')
        .upsert(
          { user_id: userId, setting_key: key, setting_value: value },
          { onConflict: 'user_id,setting_key' }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings', userId] });
      toast.success('Settings updated successfully!');
    },
    onError: (error) => {
      toast.error('Failed to update settings: ' + error.message);
    },
  });

  // Helper functions to get specific settings
  const getTheme = (): SiteTheme => {
    const themeSetting = settings.find(s => s.setting_key === 'theme');
    return themeSetting?.setting_value || {
      colors: {
        primary: "0 0% 98%",
        background: "0 0% 4%",
        accent: "180 100% 35%"
      },
      siteName: "My Portfolio"
    };
  };

  const getLayout = (): SiteLayout => {
    const layoutSetting = settings.find(s => s.setting_key === 'layout');
    return layoutSetting?.setting_value || {
      headerStyle: 'default',
      gridColumns: 3,
      spacing: 'normal'
    };
  };

  const updateTheme = (theme: Partial<SiteTheme>) => {
    const currentTheme = getTheme();
    updateSettingMutation.mutate({
      key: 'theme',
      value: { ...currentTheme, ...theme }
    });
  };

  const updateLayout = (layout: Partial<SiteLayout>) => {
    const currentLayout = getLayout();
    updateSettingMutation.mutate({
      key: 'layout',
      value: { ...currentLayout, ...layout }
    });
  };

  return {
    settings,
    isLoading,
    getTheme,
    getLayout,
    updateTheme,
    updateLayout,
    updateSetting: updateSettingMutation.mutate,
    isUpdating: updateSettingMutation.isPending,
  };
};