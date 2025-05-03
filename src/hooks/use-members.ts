
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface Member {
  id: string;
  name: string;
  memberNumber: string;
  isAdmin: boolean;
  email: string;
  phoneMain: string;
  phoneAlternative?: string;
  nickname?: string;
  photoUrl?: string;
  joinDate: string;
  memberType: string;
  honoraryMember: boolean;
  vehicles: any[];
  duesPayments: any[];
}

export const useMembers = () => {
  const queryClient = useQueryClient();
  
  const getMembers = async (): Promise<Member[]> => {
    const { data, error } = await supabase
      .from('members')
      .select('id, name, member_number, is_admin, email, phone_main, phone_alternative, nickname, photo_url, join_date, member_type, honorary_member')
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
    
    // Get vehicles for each member
    const membersWithDetails = await Promise.all(
      data.map(async (member) => {
        // Get vehicles
        const { data: vehicles } = await supabase
          .from('vehicles')
          .select('*')
          .eq('member_id', member.id);
          
        // Get dues payments
        const { data: duesPayments } = await supabase
          .from('dues_payments')
          .select('*')
          .eq('member_id', member.id);
          
        return {
          id: member.id,
          name: member.name,
          memberNumber: member.member_number,
          isAdmin: member.is_admin,
          email: member.email,
          phoneMain: member.phone_main,
          phoneAlternative: member.phone_alternative,
          nickname: member.nickname,
          photoUrl: member.photo_url,
          joinDate: member.join_date,
          memberType: member.member_type,
          honoraryMember: member.honorary_member,
          vehicles: vehicles || [],
          duesPayments: duesPayments || [],
        };
      })
    );

    return membersWithDetails;
  };
  
  const createMember = async (memberData: Omit<Member, 'id'>): Promise<Member> => {
    const { data, error } = await supabase
      .from('members')
      .insert({
        name: memberData.name,
        member_number: memberData.memberNumber,
        is_admin: memberData.isAdmin,
        email: memberData.email,
        phone_main: memberData.phoneMain,
        phone_alternative: memberData.phoneAlternative,
        nickname: memberData.nickname,
        photo_url: memberData.photoUrl,
        join_date: memberData.joinDate,
        member_type: memberData.memberType,
        honorary_member: memberData.honoraryMember
      })
      .select()
      .single();

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o membro.',
        variant: 'destructive',
      });
      throw error;
    }

    toast({
      title: 'Sucesso',
      description: 'Membro criado com sucesso.',
    });

    return {
      id: data.id,
      name: data.name,
      memberNumber: data.member_number,
      isAdmin: data.is_admin,
      email: data.email,
      phoneMain: data.phone_main,
      phoneAlternative: data.phone_alternative,
      nickname: data.nickname,
      photoUrl: data.photo_url,
      joinDate: data.join_date,
      memberType: data.member_type,
      honoraryMember: data.honorary_member,
      vehicles: [],
      duesPayments: [],
    };
  };

  const updateMember = async (memberData: Member): Promise<Member> => {
    const { data, error } = await supabase
      .from('members')
      .update({
        name: memberData.name,
        member_number: memberData.memberNumber,
        is_admin: memberData.isAdmin,
        email: memberData.email,
        phone_main: memberData.phoneMain,
        phone_alternative: memberData.phoneAlternative,
        nickname: memberData.nickname,
        photo_url: memberData.photoUrl,
        join_date: memberData.joinDate,
        member_type: memberData.memberType,
        honorary_member: memberData.honoraryMember
      })
      .eq('id', memberData.id)
      .select()
      .single();

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o membro.',
        variant: 'destructive',
      });
      throw error;
    }

    toast({
      title: 'Sucesso',
      description: 'Membro atualizado com sucesso.',
    });

    return {
      id: data.id,
      name: data.name,
      memberNumber: data.member_number,
      isAdmin: data.is_admin,
      email: data.email,
      phoneMain: data.phone_main,
      phoneAlternative: data.phone_alternative,
      nickname: data.nickname,
      photoUrl: data.photo_url,
      joinDate: data.join_date,
      memberType: data.member_type,
      honoraryMember: data.honorary_member,
      vehicles: memberData.vehicles,
      duesPayments: memberData.duesPayments,
    };
  };

  const deleteMember = async (memberId: string): Promise<void> => {
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', memberId);

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o membro.',
        variant: 'destructive',
      });
      throw error;
    }

    toast({
      title: 'Sucesso',
      description: 'Membro excluído com sucesso.',
    });
  };

  // React Query hooks
  const membersQuery = useQuery({
    queryKey: ['members'],
    queryFn: getMembers
  });

  const createMemberMutation = useMutation({
    mutationFn: createMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    }
  });

  const updateMemberMutation = useMutation({
    mutationFn: updateMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    }
  });

  const deleteMemberMutation = useMutation({
    mutationFn: deleteMember,
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
