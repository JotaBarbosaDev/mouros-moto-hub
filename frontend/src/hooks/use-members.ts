import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MemberExtended } from '@/types/member-extended';
import { memberService } from '@/services/member-service';

// Export the MemberExtended type as Member for backwards compatibility
export type Member = MemberExtended;

export const useMembers = () => {
  const queryClient = useQueryClient();

  // React Query hooks
  const membersQuery = useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      try {
        return await memberService.getAll();
      } catch (error) {
        console.error('Erro ao buscar membros:', error);
        throw error;
      }
    }
  });

  const createMemberMutation = useMutation({
    mutationFn: (member: Omit<MemberExtended, 'id'>) => memberService.create(member),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
    onError: (error) => {
      console.error('Erro ao criar membro:', error);
    }
  });

  const updateMemberMutation = useMutation({
    mutationFn: ({ id, member }: { id: string, member: MemberExtended }) => 
      memberService.update(id, member),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
    onError: (error) => {
      console.error('Erro ao atualizar membro:', error);
    }
  });

  const deleteMemberMutation = useMutation({
    mutationFn: (id: string) => memberService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
    onError: (error) => {
      console.error('Erro ao excluir membro:', error);
    }
  });

  // Helper functions
  const createMember = async (member: Omit<MemberExtended, 'id'>) => {
    return createMemberMutation.mutateAsync(member);
  };

  const updateMember = async (member: MemberExtended) => {
    const { id, ...memberData } = member;
    return updateMemberMutation.mutateAsync({ id, member });
  };

  const deleteMember = async (id: string) => {
    return deleteMemberMutation.mutateAsync(id);
  };

  return {
    members: membersQuery.data || [],
    isLoading: membersQuery.isLoading,
    isError: membersQuery.isError,
    error: membersQuery.error,
    createMember,
    updateMember,
    deleteMember,
    refetch: membersQuery.refetch
  };
};
