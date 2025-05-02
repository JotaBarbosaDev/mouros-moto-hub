
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface Member {
  id: string;
  name: string;
  memberNumber: string;
  isAdmin: boolean;
}

export const useMembers = () => {
  const getMembers = async (): Promise<Member[]> => {
    const { data, error } = await supabase
      .from('members')
      .select('id, name, member_number, is_admin')
      .order('name');

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os membros.',
        variant: 'destructive',
      });
      throw error;
    }

    if (!data) {
      return [];
    }

    return data.map(member => ({
      id: member.id,
      name: member.name,
      memberNumber: member.member_number,
      isAdmin: member.is_admin
    }));
  };

  const membersQuery = useQuery({
    queryKey: ['members'],
    queryFn: getMembers
  });

  return {
    members: membersQuery.data || [],
    isLoading: membersQuery.isLoading,
    isError: membersQuery.isError
  };
};
