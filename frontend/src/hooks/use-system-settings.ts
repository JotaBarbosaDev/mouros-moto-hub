import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '@/services/settings-service';
import { ClubSettings, MemberFeeSettings, FeePayment } from '@/types/settings';
import { toast } from '@/components/ui/use-toast';

export function useSystemSettings() {
  const queryClient = useQueryClient();

  // Buscar configurações do clube
  const { 
    data: clubSettings,
    isLoading: isLoadingClubSettings,
    error: clubSettingsError 
  } = useQuery({
    queryKey: ['systemSettings'],
    queryFn: settingsService.getClubSettings
  });

  // Atualizar configurações do clube
  const updateClubSettingsMutation = useMutation({
    mutationFn: settingsService.updateClubSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemSettings'] });
      toast({
        title: 'Configurações atualizadas',
        description: 'As configurações do clube foram atualizadas com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar as configurações do clube.',
        variant: 'destructive',
      });
      console.error('Erro ao atualizar configurações:', error);
    }
  });

  // Hook para obter configurações de cotas de um membro
  const useMemberFeeSettings = (memberId?: string) => {
    return useQuery({
      queryKey: ['memberFeeSettings', memberId],
      queryFn: () => {
        if (!memberId) return null;
        return settingsService.getMemberFeeSettings(memberId);
      },
      enabled: !!memberId
    });
  };

  // Hook para obter histórico de pagamento de cotas de um membro
  const useMemberFeePayments = (memberId?: string) => {
    return useQuery({
      queryKey: ['memberFeePayments', memberId],
      queryFn: () => {
        if (!memberId) return [];
        return settingsService.getMemberFeePayments(memberId);
      },
      enabled: !!memberId
    });
  };

  // Hook para calcular os anos de pagamento devido para um membro
  const useMemberDueYears = (memberId?: string) => {
    return useQuery({
      queryKey: ['memberDueYears', memberId],
      queryFn: () => {
        if (!memberId) return [];
        return settingsService.calculateMemberDueYears(memberId);
      },
      enabled: !!memberId
    });
  };

  // Atualizar configurações de cotas de um membro
  const updateMemberFeeSettingsMutation = useMutation({
    mutationFn: settingsService.setMemberFeeSettings,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['memberFeeSettings', data.memberId] });
      queryClient.invalidateQueries({ queryKey: ['memberDueYears', data.memberId] });
      toast({
        title: 'Configurações atualizadas',
        description: 'As configurações de cotas do membro foram atualizadas com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar as configurações de cotas do membro.',
        variant: 'destructive',
      });
      console.error('Erro ao atualizar configurações de cotas:', error);
    }
  });

  // Registrar pagamento de cota
  const updateFeePaymentMutation = useMutation({
    mutationFn: settingsService.updateFeePayment,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['memberFeePayments', data.memberId] });
      queryClient.invalidateQueries({ queryKey: ['memberDueYears', data.memberId] });
      toast({
        title: 'Pagamento registrado',
        description: 'O pagamento de cota foi registrado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar o pagamento de cota.',
        variant: 'destructive',
      });
      console.error('Erro ao registrar pagamento de cota:', error);
    }
  });

  return {
    // Dados e estado das configurações do clube
    clubSettings,
    isLoadingClubSettings,
    clubSettingsError,
    
    // Mutações para atualização de dados
    updateClubSettings: updateClubSettingsMutation.mutate,
    isUpdatingClubSettings: updateClubSettingsMutation.isPending,
    
    // Hooks para configurações de membros específicos
    useMemberFeeSettings,
    useMemberFeePayments,
    useMemberDueYears,
    
    // Mutações para configurações de membros
    updateMemberFeeSettings: updateMemberFeeSettingsMutation.mutate,
    isUpdatingMemberFeeSettings: updateMemberFeeSettingsMutation.isPending,
    
    // Mutações para pagamentos
    updateFeePayment: updateFeePaymentMutation.mutate,
    isUpdatingFeePayment: updateFeePaymentMutation.isPending,
  };
}
