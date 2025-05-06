
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { MemberExtended, MemberDbResponse } from '@/types/member-extended';
import { BloodType, MemberType, Vehicle } from '@/types/member';

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
  
  // Get vehicles and address for each member
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
        
      // Get address
      const { data: address } = await supabase
        .from('addresses')
        .select('*')
        .eq('member_id', member.id)
        .single();
        
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
        // Use actual address data if available, otherwise provide default empty values
        address: address || {
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
  // Start a transaction to ensure all data is saved or nothing is saved
  const { data: member, error: memberError } = await supabase
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

  if (memberError) {
    toast({
      title: 'Erro',
      description: 'Não foi possível criar o membro.',
      variant: 'destructive',
    });
    throw memberError;
  }

  // Save address if provided
  if (memberData.address && (
    memberData.address.street || 
    memberData.address.city || 
    memberData.address.postalCode || 
    memberData.address.number || 
    memberData.address.district || 
    memberData.address.country
  )) {
    const { error: addressError } = await supabase
      .from('addresses')
      .insert({
        member_id: member.id,
        street: memberData.address.street || '',
        number: memberData.address.number || '',
        postal_code: memberData.address.postalCode || '',
        city: memberData.address.city || '',
        district: memberData.address.district || '',
        country: memberData.address.country || ''
      });

    if (addressError) {
      console.error('Error saving address:', addressError);
      toast({
        title: 'Aviso',
        description: 'Membro criado, mas houve um problema ao salvar a morada.',
        variant: 'destructive',
      });
    }
  }

  // Save vehicles if provided
  if (memberData.vehicles && memberData.vehicles.length > 0) {
    const vehiclesWithMemberId = memberData.vehicles.map(vehicle => ({
      brand: vehicle.brand,
      model: vehicle.model,
      type: vehicle.type,
      displacement: vehicle.displacement,
      nickname: vehicle.nickname || null,
      photo_url: vehicle.photoUrl || null,
      member_id: member.id
    }));

    const { error: vehiclesError } = await supabase
      .from('vehicles')
      .insert(vehiclesWithMemberId);

    if (vehiclesError) {
      console.error('Error saving vehicles:', vehiclesError);
      toast({
        title: 'Aviso',
        description: 'Membro criado, mas houve um problema ao salvar os veículos.',
        variant: 'destructive',
      });
    }
  }

  toast({
    title: 'Sucesso',
    description: 'Membro criado com sucesso.',
  });

  // Return the created member with all relationships
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
    address: memberData.address || {
      street: '',
      number: '',
      postalCode: '',
      city: '',
      district: '',
      country: ''
    },
    bloodType: member.blood_type as BloodType | undefined,
    legacyMember: false,
    registrationFeePaid: false,
    registrationFeeExempt: false,
    inWhatsAppGroup: member.in_whatsapp_group || false,
    receivedMemberKit: member.received_member_kit || false,
    vehicles: memberData.vehicles || [],
    duesPayments: memberData.duesPayments || [],
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

  // Update address if provided
  if (memberData.address) {
    // Check if address exists
    const { data: existingAddress } = await supabase
      .from('addresses')
      .select('id')
      .eq('member_id', memberData.id)
      .maybeSingle();

    if (existingAddress) {
      // Update existing address
      const { error: addressError } = await supabase
        .from('addresses')
        .update({
          street: memberData.address.street || '',
          number: memberData.address.number || '',
          postal_code: memberData.address.postalCode || '',
          city: memberData.address.city || '',
          district: memberData.address.district || '',
          country: memberData.address.country || ''
        })
        .eq('member_id', memberData.id);

      if (addressError) {
        console.error('Error updating address:', addressError);
        toast({
          title: 'Aviso',
          description: 'Membro atualizado, mas houve um problema ao atualizar a morada.',
          variant: 'destructive',
        });
      }
    } else {
      // Insert new address
      const { error: addressError } = await supabase
        .from('addresses')
        .insert({
          member_id: memberData.id,
          street: memberData.address.street || '',
          number: memberData.address.number || '',
          postal_code: memberData.address.postalCode || '',
          city: memberData.address.city || '',
          district: memberData.address.district || '',
          country: memberData.address.country || ''
        });

      if (addressError) {
        console.error('Error creating address:', addressError);
        toast({
          title: 'Aviso',
          description: 'Membro atualizado, mas houve um problema ao criar a morada.',
          variant: 'destructive',
        });
      }
    }
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
    address: memberData.address,
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
  // Delete address first (foreign key constraint)
  await supabase
    .from('addresses')
    .delete()
    .eq('member_id', memberId);
    
  // Delete vehicles (foreign key constraint)
  await supabase
    .from('vehicles')
    .delete()
    .eq('member_id', memberId);
    
  // Delete dues payments (foreign key constraint)
  await supabase
    .from('dues_payments')
    .delete()
    .eq('member_id', memberId);
    
  // Finally delete the member
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
