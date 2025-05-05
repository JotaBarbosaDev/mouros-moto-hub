
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { MemberExtended, MemberDbResponse } from '@/types/member-extended';
import { BloodType, MemberType } from '@/types/member';

export const getMembersFromDb = async (): Promise<MemberExtended[]> => {
  const { data, error } = await supabase
    .from('members')
    .select('id, name, member_number, is_admin, is_active, email, phone_main, phone_alternative, nickname, photo_url, join_date, member_type, honorary_member, blood_type, in_whatsapp_group, received_member_kit')
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
    data.map(async (member: MemberDbResponse) => {
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
        isActive: member.is_active,
        email: member.email,
        phoneMain: member.phone_main,
        phoneAlternative: member.phone_alternative,
        nickname: member.nickname,
        photoUrl: member.photo_url,
        joinDate: member.join_date,
        memberType: member.member_type,
        honoraryMember: member.honorary_member,
        // Add required properties from MemberType
        address: {
          street: '',
          number: '',
          postalCode: '',
          city: '',
          district: '',
          country: ''
        },
        bloodType: member.blood_type,
        legacyMember: false,
        registrationFeePaid: false,
        registrationFeeExempt: false,
        inWhatsAppGroup: member.in_whatsapp_group || false,
        receivedMemberKit: member.received_member_kit || false,
        vehicles: vehicles || [],
        duesPayments: duesPayments || [],
      };
    })
  );

  return membersWithDetails;
};

export const createMemberInDb = async (memberData: Omit<MemberExtended, 'id'>): Promise<MemberExtended> => {
  const { data, error } = await supabase
    .from('members')
    .insert({
      name: memberData.name,
      member_number: memberData.memberNumber,
      is_admin: memberData.isAdmin,
      is_active: memberData.isActive || true,
      email: memberData.email,
      phone_main: memberData.phoneMain,
      phone_alternative: memberData.phoneAlternative,
      nickname: memberData.nickname,
      photo_url: memberData.photoUrl,
      join_date: memberData.joinDate,
      member_type: memberData.memberType,
      honorary_member: memberData.honoraryMember,
      blood_type: memberData.bloodType,
      in_whatsapp_group: memberData.inWhatsAppGroup,
      received_member_kit: memberData.receivedMemberKit
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
    isActive: data.is_active,
    email: data.email,
    phoneMain: data.phone_main,
    phoneAlternative: data.phone_alternative,
    nickname: data.nickname,
    photoUrl: data.photo_url,
    joinDate: data.join_date,
    memberType: data.member_type,
    honoraryMember: data.honorary_member,
    address: {
      street: '',
      number: '',
      postalCode: '',
      city: '',
      district: '',
      country: ''
    },
    bloodType: data.blood_type as BloodType | undefined,
    legacyMember: false,
    registrationFeePaid: false,
    registrationFeeExempt: false,
    inWhatsAppGroup: data.in_whatsapp_group || false,
    receivedMemberKit: data.received_member_kit || false,
    vehicles: memberData.vehicles,
    duesPayments: memberData.duesPayments,
  };
};

export const updateMemberInDb = async (memberData: MemberExtended): Promise<MemberExtended> => {
  const { data, error } = await supabase
    .from('members')
    .update({
      name: memberData.name,
      member_number: memberData.memberNumber,
      is_admin: memberData.isAdmin,
      is_active: memberData.isActive,
      email: memberData.email,
      phone_main: memberData.phoneMain,
      phone_alternative: memberData.phoneAlternative,
      nickname: memberData.nickname,
      photo_url: memberData.photoUrl,
      join_date: memberData.joinDate,
      member_type: memberData.memberType,
      honorary_member: memberData.honoraryMember,
      blood_type: memberData.bloodType,
      in_whatsapp_group: memberData.inWhatsAppGroup,
      received_member_kit: memberData.receivedMemberKit
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
    isActive: data.is_active,
    email: data.email,
    phoneMain: data.phone_main,
    phoneAlternative: data.phone_alternative,
    nickname: data.nickname,
    photoUrl: data.photo_url,
    joinDate: data.join_date,
    memberType: data.member_type,
    honoraryMember: data.honorary_member,
    address: {
      street: '',
      number: '',
      postalCode: '',
      city: '',
      district: '',
      country: ''
    },
    bloodType: data.blood_type as BloodType | undefined,
    legacyMember: false,
    registrationFeePaid: false,
    registrationFeeExempt: false,
    inWhatsAppGroup: data.in_whatsapp_group || false,
    receivedMemberKit: data.received_member_kit || false,
    vehicles: memberData.vehicles,
    duesPayments: memberData.duesPayments,
  };
};

export const deleteMemberFromDb = async (memberId: string): Promise<void> => {
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
