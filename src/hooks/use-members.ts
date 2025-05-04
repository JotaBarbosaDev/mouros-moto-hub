
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MemberExtended } from '@/types/member-extended';
import { 
  getMembersFromDb, 
  createMemberInDb, 
  updateMemberInDb, 
  deleteMemberFromDb 
} from '@/services/member-service';

// Export the MemberExtended type as Member for backwards compatibility
export type Member = MemberExtended;

export const useMembers = () => {
  const queryClient = useQueryClient();

  // React Query hooks
  const membersQuery = useQuery({
    queryKey: ['members'],
    queryFn: getMembersFromDb
  });

  const createMemberMutation = useMutation({
    mutationFn: createMemberInDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    }
  });

  const updateMemberMutation = useMutation({
    mutationFn: updateMemberInDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    }
  });

  const deleteMemberMutation = useMutation({
    mutationFn: deleteMemberFromDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    }
  });

  return {
    members: membersQuery.data || [],
    isLoading: membersQuery.isLoading,
    isError: membersQuery.isError,
    createMember: createMemberMutation.mutate,
    updateMember: updateMemberMutation.mutate,
    deleteMember: deleteMemberMutation.mutate
  };
};
