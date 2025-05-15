import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { MemberExtended, MemberDbResponse } from '@/types/member-extended';
import { BloodType, MemberType, Vehicle } from '@/types/member';

// Função para obter todos os membros
const getAll = async (): Promise<MemberExtended[]> => {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('id, name, member_number, is_admin, is_active, email, phone_main, phone_alternative, nickname, photo_url, join_date, member_type, honorary_member, blood_type, in_whatsapp_group, received_member_kit, username, legacy_member, registration_fee_paid, registration_fee_exempt')
      .order('name');

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os membros.',
        variant: 'destructive',
      });
      throw error;
    }

    return Array.isArray(data) ? data.map(member => mapMemberFromDb(member as MemberDbResponse)) : [];
  } catch (error) {
    console.error('Erro ao carregar membros:', error);
    return [];
  }
};

// Função para obter um membro pelo ID
const getById = async (id: string): Promise<MemberExtended | null> => {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('id, name, member_number, is_admin, is_active, email, phone_main, phone_alternative, nickname, photo_url, join_date, member_type, honorary_member, blood_type, in_whatsapp_group, received_member_kit, username, legacy_member, registration_fee_paid, registration_fee_exempt')
      .eq('id', id)
      .single();

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o membro.',
        variant: 'destructive',
      });
      throw error;
    }

    return data ? mapMemberFromDb(data as MemberDbResponse) : null;
  } catch (error) {
    console.error('Erro ao carregar membro:', error);
    return null;
  }
};

// Função para mapear um membro do banco de dados para o formato utilizado no frontend
const mapMemberFromDb = (member: MemberDbResponse): MemberExtended => {
  return {
    id: member.id,
    name: member.name,
    memberNumber: member.member_number,
    isAdmin: member.is_admin,
    isActive: member.is_active,
    email: member.email,
    phoneMain: member.phone_main,
    phoneAlternative: member.phone_alternative,
    nickname: member.nickname,
    photoUrl: member.photo_url,
    joinDate: member.join_date,
    memberType: member.member_type as MemberType,
    honoraryMember: member.honorary_member,
    bloodType: member.blood_type as BloodType,
    inWhatsAppGroup: member.in_whatsapp_group,
    receivedMemberKit: member.received_member_kit,
    username: member.username,
    legacyMember: member.legacy_member,
    registrationFeePaid: member.registration_fee_paid,
    registrationFeeExempt: member.registration_fee_exempt,
    // Campos obrigatórios com valores padrão
    address: {
      street: '',
      number: '',
      postalCode: '',
      city: '',
      district: '',
      country: 'Portugal'
    },
    vehicles: [],
    duesPayments: []
  };
};

// Função para criar um membro
const create = async (member: Omit<MemberExtended, 'id'>): Promise<MemberExtended> => {
  try {
    // Mapear o membro para o formato esperado pelo Supabase
    const memberToCreate = {
      name: member.name,
      member_number: member.memberNumber,
      is_admin: member.isAdmin,
      is_active: member.isActive,
      email: member.email,
      phone_main: member.phoneMain,
      phone_alternative: member.phoneAlternative,
      nickname: member.nickname,
      photo_url: member.photoUrl,
      join_date: member.joinDate,
      member_type: member.memberType,
      honorary_member: member.honoraryMember,
      in_whatsapp_group: member.inWhatsAppGroup,
      received_member_kit: member.receivedMemberKit,
      username: member.username,
      legacy_member: member.legacyMember,
      registration_fee_paid: member.registrationFeePaid,
      registration_fee_exempt: member.registrationFeeExempt
    };

    const { data, error } = await supabase
      .from('members')
      .insert(memberToCreate)
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

    return data ? mapMemberFromDb(data as MemberDbResponse) : {} as MemberExtended;
  } catch (error) {
    console.error('Erro ao criar membro:', error);
    throw error;
  }
};

// Função para atualizar um membro
const update = async (id: string, member: MemberExtended): Promise<MemberExtended> => {
  try {
    // Mapear o membro para o formato esperado pelo Supabase
    const memberToUpdate = {
      name: member.name,
      member_number: member.memberNumber,
      is_admin: member.isAdmin,
      is_active: member.isActive,
      email: member.email,
      phone_main: member.phoneMain,
      phone_alternative: member.phoneAlternative,
      nickname: member.nickname,
      photo_url: member.photoUrl,
      join_date: member.joinDate,
      member_type: member.memberType,
      honorary_member: member.honoraryMember,
      in_whatsapp_group: member.inWhatsAppGroup,
      received_member_kit: member.receivedMemberKit,
      username: member.username,
      legacy_member: member.legacyMember,
      registration_fee_paid: member.registrationFeePaid,
      registration_fee_exempt: member.registrationFeeExempt
    };

    const { data, error } = await supabase
      .from('members')
      .update(memberToUpdate)
      .eq('id', id)
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

    return data ? mapMemberFromDb(data as MemberDbResponse) : {} as MemberExtended;
  } catch (error) {
    console.error('Erro ao atualizar membro:', error);
    throw error;
  }
};

// Função para excluir um membro
const deleteMember = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id);

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
  } catch (error) {
    console.error('Erro ao excluir membro:', error);
    throw error;
  }
};

// Exportando o serviço de membros
export const memberService = {
  getAll,
  getById,
  create,
  update,
  delete: deleteMember
};
