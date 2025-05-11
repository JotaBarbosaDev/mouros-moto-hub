// filepath: /Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/src/services/member-service.ts
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { MemberExtended, MemberDbResponse } from '@/types/member-extended';
import { BloodType, MemberType, Vehicle } from '@/types/member';

export const getMembersFromDb = async (): Promise<MemberExtended[]> => {
  try {
    // @ts-expect-error - Ignorando erros de tipo do Supabase
    const { data, error } = await supabase
      .from('members')
      .select('id, name, member_number, is_admin, is_active, email, phone_main, phone_alternative, nickname, photo_url, join_date, member_type, honorary_member, blood_type, in_whatsapp_group, received_member_kit, username')
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
        // @ts-expect-error - Ignorando erros de tipo do Supabase
        const { data: vehicles } = await supabase
          .from('vehicles')
          .select('*')
          .eq('member_id', member.id);
          
        // Get dues payments
        // @ts-expect-error - Ignorando erros de tipo do Supabase
        const { data: duesPayments } = await supabase
          .from('dues_payments')
          .select('*')
          .eq('member_id', member.id);
          
        // Get address
        // @ts-expect-error - Ignorando erros de tipo do Supabase
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
          bloodType: member.blood_type as BloodType | undefined,
          legacyMember: false,
          registrationFeePaid: false,
          registrationFeeExempt: false,
          inWhatsAppGroup: member.in_whatsapp_group || false,
          receivedMemberKit: member.received_member_kit || false,
          username: member.username || member.email, // Username para login (email como fallback)
          // @ts-expect-error - Veículos e pagamentos
          vehicles: vehicles || [],
          // @ts-expect-error - Veículos e pagamentos
          duesPayments: duesPayments || [],
        };
      })
    );

    return membersWithDetails as MemberExtended[];
  } catch (error) {
    console.error('Erro ao buscar membros:', error);
    toast({
      title: 'Erro',
      description: 'Ocorreu um erro ao buscar os membros.',
      variant: 'destructive',
    });
    return [];
  }
};

export const createMemberInDb = async (memberData: Omit<MemberExtended, 'id'>): Promise<MemberExtended> => {
  try {
    // Definir username, se fornecido utiliza o valor, senão usa o email como padrão
    const username = memberData.username || memberData.email;

    // Agora criar o registro do membro na tabela members
    // @ts-expect-error - Ignorando erros de tipo do Supabase
    const { data: member, error: memberError } = await supabase
      .from('members')
      .insert({
        name: memberData.name,
        member_number: memberData.memberNumber,
        is_admin: memberData.memberType === "Administração" ? true : false,
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
        received_member_kit: memberData.receivedMemberKit,
        username: username // Salva o username para login
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
      // @ts-expect-error - Ignorando erros de tipo do Supabase
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
          description: 'Membro criado, mas houve um problema ao salvar o endereço.',
          variant: 'destructive',
        });
      }
    }

    // Save vehicles if provided
    if (memberData.vehicles && memberData.vehicles.length > 0) {
      const vehiclesToInsert = memberData.vehicles.map(vehicle => ({
        member_id: member.id,
        brand: vehicle.brand,
        model: vehicle.model,
        type: vehicle.type,
        displacement: vehicle.displacement,
        nickname: vehicle.nickname || null,
        photo_url: vehicle.photoUrl || null
      }));

      // @ts-expect-error - Ignorando erros de tipo do Supabase
      const { error: vehiclesError } = await supabase
        .from('vehicles')
        .insert(vehiclesToInsert);
      
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
      username: member.username || member.email,
      vehicles: memberData.vehicles || [],
      duesPayments: memberData.duesPayments || [],
    };
  } catch (error) {
    console.error('Erro ao criar membro:', error);
    return {} as MemberExtended;
  }
};

export const updateMemberInDb = async (memberData: MemberExtended): Promise<MemberExtended> => {
  try {
    // @ts-expect-error - Ignorando erros de tipo do Supabase
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
        username: memberData.username,
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

    // Update address
    if (memberData.address) {
      // Check if address exists
      // @ts-expect-error - Ignorando erros de tipo do Supabase
      const { data: existingAddress, error: existingAddressError } = await supabase
        .from('addresses')
        .select('id')
        .eq('member_id', memberData.id)
        .maybeSingle();

      if (!existingAddressError) {
        if (existingAddress) {
          // Update existing address
          // @ts-expect-error - Ignorando erros de tipo do Supabase
          const { error: addressError } = await supabase
            .from('addresses')
            .update({
              street: memberData.address.street,
              number: memberData.address.number,
              postal_code: memberData.address.postalCode,
              city: memberData.address.city,
              district: memberData.address.district,
              country: memberData.address.country
            })
            .eq('member_id', memberData.id);

          if (addressError) {
            console.error('Error updating address:', addressError);
          }
        } else {
          // Create new address
          // @ts-expect-error - Ignorando erros de tipo do Supabase
          const { error: addressError } = await supabase
            .from('addresses')
            .insert({
              member_id: memberData.id,
              street: memberData.address.street,
              number: memberData.address.number,
              postal_code: memberData.address.postalCode,
              city: memberData.address.city,
              district: memberData.address.district,
              country: memberData.address.country
            });

          if (addressError) {
            console.error('Error creating address:', addressError);
          }
        }
      }
    }

    toast({
      title: 'Sucesso',
      description: 'Membro atualizado com sucesso.',
    });

    return memberData;
  } catch (error) {
    console.error('Erro ao atualizar membro:', error);
    throw error;
  }
};

export const deleteMemberFromDb = async (memberId: string): Promise<void> => {
  try {
    // @ts-expect-error - Ignorando erros de tipo do Supabase
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
  } catch (error) {
    console.error('Erro ao excluir membro:', error);
    throw error;
  }
};

export const createUserAccount = async (memberData: MemberExtended): Promise<void> => {
  try {
    const password = memberData.password || memberData.username || memberData.email.split('@')[0];
    
    // @ts-expect-error - Ignorando erros de tipo do Supabase
    const { data, error } = await supabase.auth.admin.createUser({
      email: memberData.email,
      password: password,
      email_confirm: true,
      user_metadata: {
        name: memberData.name,
        member_id: memberData.id,
        username: memberData.username,
      }
    });

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a conta de usuário.',
        variant: 'destructive',
      });
      throw error;
    }

    toast({
      title: 'Sucesso',
      description: 'Conta de usuário criada com sucesso.',
    });
  } catch (error) {
    console.error('Erro ao criar conta de usuário:', error);
    throw error;
  }
};
