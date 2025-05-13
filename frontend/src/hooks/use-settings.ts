import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Json } from '@/integrations/supabase/types';

export interface ClubSettings {
  name: string;
  address: string;
  email: string;
  phone: string;
  logo?: string;
}

export interface FeesSettings {
  registrationFee: number;
  annualDues: number;
  childDiscount: number;
  exemptHonoraryMembers: boolean;
  exemptAdminMembers: boolean;
}

export interface ScaleSettings {
  defaultStartTime: string;
  defaultEndTime: string;
  autoCreateMonthlySchedule: boolean;
  notifyMembersBeforeDays: number;
  excludeHolidays: boolean;
}

export interface DefaultSettings {
  defaultMemberPhoto: string;
  defaultMotorcyclePhoto: string;
  defaultQuadPhoto: string;
  defaultBuggyPhoto: string;
}

export const useSettings = () => {
  const queryClient = useQueryClient();

  // Fetch club settings
  const getClubSettings = async (): Promise<ClubSettings> => {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'club_info')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return {
          name: "Os Mouros",
          address: "Rua Principal, 123, Lisboa",
          email: "contacto@osmouros.pt",
          phone: "212345678",
        };
      }
      
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as configurações do clube.',
        variant: 'destructive',
      });
      throw error;
    }

    return data.value as unknown as ClubSettings;
  };

  // Fetch fees settings
  const getFeesSettings = async (): Promise<FeesSettings> => {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'fees')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return {
          registrationFee: 50,
          annualDues: 120,
          childDiscount: 50,
          exemptHonoraryMembers: true,
          exemptAdminMembers: false,
        };
      }
      
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as configurações de taxas.',
        variant: 'destructive',
      });
      throw error;
    }

    return data.value as unknown as FeesSettings;
  };

  // Fetch scale settings
  const getScaleSettings = async (): Promise<ScaleSettings> => {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'scale')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return {
          defaultStartTime: "18:00",
          defaultEndTime: "23:00",
          autoCreateMonthlySchedule: true,
          notifyMembersBeforeDays: 3,
          excludeHolidays: true,
        };
      }
      
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as configurações de escala.',
        variant: 'destructive',
      });
      throw error;
    }

    return data.value as unknown as ScaleSettings;
  };

  // Fetch default settings
  const getDefaultSettings = async (): Promise<DefaultSettings> => {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'defaults')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return {
          defaultMemberPhoto: "/placeholders/default-member.jpg",
          defaultMotorcyclePhoto: "/placeholders/default-motorcycle.jpg",
          defaultQuadPhoto: "/placeholders/default-quad.jpg",
          defaultBuggyPhoto: "/placeholders/default-buggy.jpg",
        };
      }
      
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as configurações padrão.',
        variant: 'destructive',
      });
      throw error;
    }

    return data.value as unknown as DefaultSettings;
  };

  // Save club settings
  const saveClubSettings = async (settings: ClubSettings): Promise<void> => {
    const { error } = await supabase
      .from('settings')
      .upsert({
        key: 'club_info',
        value: settings as unknown as Json
      }, {
        onConflict: 'key'
      });

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as configurações do clube.',
        variant: 'destructive',
      });
      throw error;
    }

    toast({
      title: 'Sucesso',
      description: 'As informações do clube foram atualizadas com sucesso.',
    });
  };

  // Save fees settings
  const saveFeesSettings = async (settings: FeesSettings): Promise<void> => {
    const { error } = await supabase
      .from('settings')
      .upsert({
        key: 'fees',
        value: settings as unknown as Json
      }, {
        onConflict: 'key'
      });

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as configurações de taxas.',
        variant: 'destructive',
      });
      throw error;
    }

    toast({
      title: 'Sucesso',
      description: 'Os valores de cotas e joias foram atualizados com sucesso.',
    });
  };

  // Save scale settings
  const saveScaleSettings = async (settings: ScaleSettings): Promise<void> => {
    const { error } = await supabase
      .from('settings')
      .upsert({
        key: 'scale',
        value: settings as unknown as Json
      }, {
        onConflict: 'key'
      });

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as configurações de escala.',
        variant: 'destructive',
      });
      throw error;
    }

    toast({
      title: 'Sucesso',
      description: 'As configurações de escalas foram atualizadas com sucesso.',
    });
  };

  // Save default settings
  const saveDefaultSettings = async (settings: DefaultSettings): Promise<void> => {
    const { error } = await supabase
      .from('settings')
      .upsert({
        key: 'defaults',
        value: settings as unknown as Json
      }, {
        onConflict: 'key'
      });

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as configurações padrão.',
        variant: 'destructive',
      });
      throw error;
    }

    toast({
      title: 'Sucesso',
      description: 'As configurações de personalização foram atualizadas com sucesso.',
    });
  };

  // React Query hooks
  const clubSettingsQuery = useQuery({
    queryKey: ['clubSettings'],
    queryFn: getClubSettings
  });

  const feesSettingsQuery = useQuery({
    queryKey: ['feesSettings'],
    queryFn: getFeesSettings
  });

  const scaleSettingsQuery = useQuery({
    queryKey: ['scaleSettings'],
    queryFn: getScaleSettings
  });

  const defaultSettingsQuery = useQuery({
    queryKey: ['defaultSettings'],
    queryFn: getDefaultSettings
  });

  const saveClubSettingsMutation = useMutation({
    mutationFn: saveClubSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clubSettings'] });
    }
  });

  const saveFeesSettingsMutation = useMutation({
    mutationFn: saveFeesSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feesSettings'] });
    }
  });

  const saveScaleSettingsMutation = useMutation({
    mutationFn: saveScaleSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scaleSettings'] });
    }
  });

  const saveDefaultSettingsMutation = useMutation({
    mutationFn: saveDefaultSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['defaultSettings'] });
    }
  });

  return {
    clubSettings: clubSettingsQuery.data,
    feesSettings: feesSettingsQuery.data,
    scaleSettings: scaleSettingsQuery.data,
    defaultSettings: defaultSettingsQuery.data,
    isLoadingClubSettings: clubSettingsQuery.isLoading,
    isLoadingFeesSettings: feesSettingsQuery.isLoading,
    isLoadingScaleSettings: scaleSettingsQuery.isLoading,
    isLoadingDefaultSettings: defaultSettingsQuery.isLoading,
    saveClubSettings: saveClubSettingsMutation.mutate,
    saveFeesSettings: saveFeesSettingsMutation.mutate,
    saveScaleSettings: saveScaleSettingsMutation.mutate,
    saveDefaultSettings: saveDefaultSettingsMutation.mutate,
    isSavingClubSettings: saveClubSettingsMutation.isPending,
    isSavingFeesSettings: saveFeesSettingsMutation.isPending,
    isSavingScaleSettings: saveScaleSettingsMutation.isPending,
    isSavingDefaultSettings: saveDefaultSettingsMutation.isPending,
  };
};
