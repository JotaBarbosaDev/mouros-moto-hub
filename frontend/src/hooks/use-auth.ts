// src/hooks/use-auth.ts
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService, LoginCredentials, RegisterData, UserProfile } from '@/services/auth-service';
import { useToast } from '@/hooks/use-toast';

export interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isError: false,
    error: null,
    isAuthenticated: authService.isAuthenticated()
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Função para obter o perfil do usuário
  const getProfile = async (): Promise<UserProfile | null> => {
    if (!authService.isAuthenticated()) {
      return null;
    }
    
    try {
      return await authService.getProfile();
    } catch (error) {
      console.error('Erro ao obter perfil:', error);
      if (error instanceof Error && error.message.includes('401')) {
        // Se o token estiver inválido, fazer logout
        await authService.logout();
        return null;
      }
      throw error;
    }
  };

  // Consulta para obter o perfil do usuário
  const profileQuery = useQuery({
    queryKey: ['user-profile'],
    queryFn: getProfile,
    enabled: authService.isAuthenticated(),
    retry: 1,
    refetchOnWindowFocus: false
  });

  useEffect(() => {
    setAuthState({
      user: profileQuery.data || null,
      isLoading: profileQuery.isLoading,
      isError: profileQuery.isError,
      error: profileQuery.error instanceof Error ? profileQuery.error : null,
      isAuthenticated: authService.isAuthenticated() && !!profileQuery.data
    });
  }, [profileQuery.data, profileQuery.isLoading, profileQuery.isError, profileQuery.error]);

  // Mutation para login
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: true,
        user: data.user
      }));
      toast({
        title: 'Login efetuado com sucesso',
        description: `Bem-vindo, ${data.user.name || data.user.email}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro no login',
        description: error.message || 'Não foi possível fazer login. Verifique suas credenciais.',
        variant: 'destructive',
      });
    }
  });

  // Mutation para registro
  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: true,
        user: data.user
      }));
      toast({
        title: 'Registro efetuado com sucesso',
        description: `Bem-vindo, ${data.user.name || data.user.email}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro no registro',
        description: error.message || 'Não foi possível completar o registro.',
        variant: 'destructive',
      });
    }
  });

  // Mutation para logout
  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      queryClient.invalidateQueries();
      setAuthState({
        user: null,
        isLoading: false,
        isError: false,
        error: null,
        isAuthenticated: false
      });
      toast({
        title: 'Logout efetuado com sucesso',
        description: 'Sessão encerrada.',
      });
    },
    onError: (error) => {
      console.error('Erro ao fazer logout:', error);
      // Mesmo em caso de erro, limpar o estado de autenticação no cliente
      localStorage.removeItem('accessToken');
      setAuthState({
        user: null,
        isLoading: false,
        isError: true,
        error: error instanceof Error ? error : new Error('Erro desconhecido ao fazer logout'),
        isAuthenticated: false
      });
    }
  });

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading || loginMutation.isPending || logoutMutation.isPending,
    error: authState.error,
    authError: authState.error?.message || null, // Adicionando authError para compatibilidade
    login: (credentials: LoginCredentials) => loginMutation.mutate(credentials),
    register: (data: RegisterData) => registerMutation.mutate(data),
    logout: () => logoutMutation.mutate(),
    refreshProfile: () => queryClient.invalidateQueries({ queryKey: ['user-profile'] })
  };
};
