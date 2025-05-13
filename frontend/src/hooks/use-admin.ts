// src/hooks/use-admin.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  adminService, 
  SystemStats, 
  UserListItem,
  UpdateUserRoleData,
  LinkMemberData
} from '@/services/admin-service';

export interface AdminOptions {
  userFilter?: string;
  userPage?: number;
  userPageSize?: number;
}

export const useAdmin = (options: AdminOptions = {}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Hook para obter estatísticas do sistema
  const statsQuery = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: adminService.getStats,
    refetchOnWindowFocus: false
  });
  
  // Hook para listar usuários com paginação e filtragem
  const usersQuery = useQuery({
    queryKey: ['admin', 'users', options.userPage || 1, options.userPageSize || 10, options.userFilter || ''],
    queryFn: () => adminService.listUsers({
      filter: options.userFilter,
      page: options.userPage || 1,
      pageSize: options.userPageSize || 10
    })
  });
  
  // Mutation para atualizar a função de um usuário
  const updateRoleMutation = useMutation({
    mutationFn: (data: UpdateUserRoleData) => adminService.updateUserRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast({
        title: 'Função atualizada',
        description: 'A função do usuário foi atualizada com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: `Não foi possível atualizar a função: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  // Mutation para vincular um usuário a um membro
  const linkMemberMutation = useMutation({
    mutationFn: (data: LinkMemberData) => adminService.linkUserToMember(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast({
        title: 'Vínculo criado',
        description: 'Usuário vinculado ao membro com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: `Não foi possível vincular o usuário: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  // Mutation para desvincular um usuário de um membro
  const unlinkMemberMutation = useMutation({
    mutationFn: (userId: string) => adminService.unlinkUserFromMember(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast({
        title: 'Vínculo removido',
        description: 'O vínculo entre o usuário e o membro foi removido.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: `Não foi possível desvincular o usuário: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  // Mutation para redefinir a senha de um usuário
  const resetPasswordMutation = useMutation({
    mutationFn: (userId: string) => adminService.resetUserPassword(userId),
    onSuccess: () => {
      toast({
        title: 'E-mail enviado',
        description: 'Um e-mail de redefinição de senha foi enviado ao usuário.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: `Não foi possível enviar o e-mail de redefinição: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  // Mutation para desativar um usuário
  const disableUserMutation = useMutation({
    mutationFn: (userId: string) => adminService.disableUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast({
        title: 'Usuário desativado',
        description: 'O usuário foi desativado com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: `Não foi possível desativar o usuário: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  // Mutation para reativar um usuário
  const enableUserMutation = useMutation({
    mutationFn: (userId: string) => adminService.enableUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast({
        title: 'Usuário reativado',
        description: 'O usuário foi reativado com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: `Não foi possível reativar o usuário: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  // Mutation para criar um novo usuário
  const createUserMutation = useMutation({
    mutationFn: (userData: { email: string; password: string; name: string; role?: string }) => 
      adminService.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast({
        title: 'Usuário criado',
        description: 'O novo usuário foi criado com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: `Não foi possível criar o usuário: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  return {
    stats: statsQuery.data,
    statsLoading: statsQuery.isLoading,
    statsError: statsQuery.error,
    
    users: usersQuery.data?.users || [],
    totalUsers: usersQuery.data?.totalCount || 0,
    usersLoading: usersQuery.isLoading,
    usersError: usersQuery.error,
    
    updateUserRole: updateRoleMutation.mutate,
    linkMember: linkMemberMutation.mutate,
    unlinkMember: unlinkMemberMutation.mutate,
    resetPassword: resetPasswordMutation.mutate,
    disableUser: disableUserMutation.mutate,
    enableUser: enableUserMutation.mutate,
    createUser: createUserMutation.mutate,
    
    isActionLoading: updateRoleMutation.isPending || 
                    linkMemberMutation.isPending ||
                    unlinkMemberMutation.isPending ||
                    resetPasswordMutation.isPending ||
                    disableUserMutation.isPending ||
                    enableUserMutation.isPending ||
                    createUserMutation.isPending
  };
};
