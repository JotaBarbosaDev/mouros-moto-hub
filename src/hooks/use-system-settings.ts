
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SystemSettings {
  id: string;
  themeColor: string;
  foundingDate: string;
}

export const useSystemSettings = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .single();

      if (error) throw error;

      if (data) {
        setSettings({
          id: data.id,
          themeColor: data.theme_color,
          foundingDate: data.founding_date,
        });
      }
    } catch (error) {
      console.error('Error fetching system settings:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as configurações do sistema.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (updatedSettings: Partial<SystemSettings>) => {
    try {
      if (!settings?.id) {
        throw new Error('Não foi possível encontrar as configurações do sistema');
      }

      const { error } = await supabase
        .from('system_settings')
        .update({
          theme_color: updatedSettings.themeColor,
          founding_date: updatedSettings.foundingDate,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings.id);

      if (error) throw error;

      // Update local state
      setSettings(prev => prev ? { ...prev, ...updatedSettings } : null);

      toast({
        title: 'Sucesso',
        description: 'Configurações atualizadas com sucesso.',
      });

      return true;
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar as configurações.',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    isLoading,
    fetchSettings,
    updateSettings,
  };
};
