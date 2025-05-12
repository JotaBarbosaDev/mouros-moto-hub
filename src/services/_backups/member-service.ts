import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { MemberExtended, MemberDbResponse } from '@/types/member-extended';
import { BloodType, MemberType, Vehicle } from '@/types/member';

/**
 * Busca todos os membros do banco de dados com tratamento especial para campo username
 * que pode não estar disponível dependendo da versão da migração
 */
export const getMembersFromDb = async (): Promise<MemberExtended[]> => {
  try {
    console.log("Iniciando busca de membros...");
    
    // Primeiro, tenta buscar com todas as colunas, incluindo username
    let membersData;
    let fetchError;
    
    try {
      // @ts-expect-error - Ignorando erros de tipo do Supabase
      const { data, error } = await supabase
        .from('members')
        .select('id, name, member_number, is_admin, is_active, email, phone_main, phone_alternative, nickname, photo_url, join_date, member_type, honorary_member, blood_type, in_whatsapp_group, received_member_kit, username')
        .order('name');
        
      if (!error) {
        membersData = data;
      } else {
        fetchError = error;
        console.warn("Erro ao tentar buscar membros com username, tentando sem username:", error);
      }
    } catch (e) {
      console.warn("Exceção ao buscar membros com username, tentando sem username:", e);
    }
    
    // Se falhou, tenta buscar sem o campo username
    if (!membersData) {
      // @ts-expect-error - Ignorando erros de tipo do Supabase
      const { data, error } = await supabase
        .from('members')
        .select('id, name, member_number, is_admin, is_active, email, phone_main, phone_alternative, nickname, photo_url, join_date, member_type, honorary_member, blood_type, in_whatsapp_group, received_member_kit')
        .order('name');

      if (error) {
        console.error("Erro ao buscar membros:", error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os membros: ' + error.message,
          variant: 'destructive',
        });
        throw error;
      }
      
      membersData = data;
    }

    if (!membersData || membersData.length === 0) {
      console.log("Nenhum membro encontrado");
      return [];
    }
    
    console.log(`Encontrados ${membersData.length} membros`);
    
    // Get vehicles and address for each member
    const membersWithDetails = await Promise.all(
      membersData.map(async (member: MemberDbResponse) => {
        try {
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
            
          // Cria variável para username, tentando diferentes abordagens
          let username = '';
          try {
            // @ts-expect-error - Acessando propriedade que pode não existir
            username = member.username || '';
          } catch (e) {
            console.warn("Username não encontrado para o membro:", member.id);
          }

          if (!username && member.email) {
            username = member.email.split('@')[0];
          }
            
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
            username: username, // Username tratado acima
            // @ts-expect-error - Veículos e pagamentos
            vehicles: vehicles || [],
            // @ts-expect-error - Veículos e pagamentos
            duesPayments: duesPayments || [],
          };
        } catch (memberError) {
          console.error("Erro ao carregar detalhes do membro:", member.id, memberError);
          // Retorna membro com dados mínimos para evitar quebrar a lista
          return {
            id: member.id,
            name: member.name || "Membro sem nome",
            memberNumber: member.member_number || "0",
            isAdmin: false,
            isActive: false,
            email: member.email || "",
            phoneMain: "",
            joinDate: new Date().toISOString(),
            memberType: "Sócio Adulto" as MemberType,
            honoraryMember: false,
            address: {
              street: '',
              number: '',
              postalCode: '',
              city: '',
              district: '',
              country: ''
            },
            username: member.email?.split('@')[0] || `user${Date.now()}`,
            vehicles: [],
            duesPayments: [],
            bloodType: undefined,
            legacyMember: false,
            registrationFeePaid: false,
            registrationFeeExempt: false,
            inWhatsAppGroup: false,
            receivedMemberKit: false
          };
        }
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

/**
 * Cria um novo membro no banco de dados
 */
export const createMemberInDb = async (memberData: Omit<MemberExtended, 'id'>): Promise<MemberExtended> => {
  try {
    // Definir username, se fornecido utiliza o valor, senão usa o email como padrão
    const username = memberData.username || memberData.email?.split('@')[0];

    // Preparar dados para inserção
    const memberToInsert = {
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
    };

    // Tentar inserir com username
    try {
      // @ts-expect-error - Ignorando erros de tipo do Supabase
      memberToInsert.username = username;
      
      // @ts-expect-error - Ignorando erros de tipo do Supabase
      const { data: member, error: memberError } = await supabase
        .from('members')
        .insert(memberToInsert)
        .select()
        .single();

      if (!memberError) {
        // Sucesso na inserção com username
        console.log("Membro criado com username:", member.username);
        
        // Continuar com inserção de endereço e veículos
        await insertAdditionalMemberData(member.id, memberData);
        
        toast({
          title: 'Sucesso',
          description: 'Membro criado com sucesso.',
        });
        
        return mapToMemberExtended(member, memberData);
      }
    } catch (e) {
      console.warn("Erro ao inserir membro com username, tentando sem username:", e);
    }
    
    // Se falhou, tenta inserir sem o campo username
    // @ts-expect-error - Acessando propriedade
    delete memberToInsert.username;
    
    // @ts-expect-error - Ignorando erros de tipo do Supabase
    const { data: member, error: memberError } = await supabase
      .from('members')
      .insert(memberToInsert)
      .select()
      .single();

    if (memberError) {
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o membro: ' + memberError.message,
        variant: 'destructive',
      });
      throw memberError;
    }

    // Inserir dados adicionais (endereço, veículos)
    await insertAdditionalMemberData(member.id, memberData);
    
    toast({
      title: 'Sucesso',
      description: 'Membro criado com sucesso.',
    });

    return mapToMemberExtended(member, memberData);
  } catch (error) {
    console.error('Erro ao criar membro:', error);
    return {} as MemberExtended;
  }
};

/**
 * Função auxiliar para inserir dados adicionais do membro (endereço, veículos)
 */
const insertAdditionalMemberData = async (memberId: string, memberData: Omit<MemberExtended, 'id'>) => {
  // Save address if provided
  if (memberData.address && (
    memberData.address.street || 
    memberData.address.city || 
    memberData.address.postalCode || 
    memberData.address.number || 
    memberData.address.district || 
    memberData.address.country
  )) {
    try {
      // @ts-expect-error - Ignorando erros de tipo do Supabase
      const { error: addressError } = await supabase
        .from('addresses')
        .insert({
          member_id: memberId,
          street: memberData.address.street || '',
          number: memberData.address.number || '',
          postal_code: memberData.address.postalCode || '',
          city: memberData.address.city || '',
          district: memberData.address.district || '',
          country: memberData.address.country || ''
        });
      
      if (addressError) {
        console.error('Erro ao salvar endereço:', addressError);
      }
    } catch (e) {
      console.error('Exceção ao salvar endereço:', e);
    }
  }

  // Save vehicles if provided
  if (memberData.vehicles && memberData.vehicles.length > 0) {
    try {
      const vehiclesToInsert = memberData.vehicles.map(vehicle => ({
        member_id: memberId,
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
        console.error('Erro ao salvar veículos:', vehiclesError);
      }
    } catch (e) {
      console.error('Exceção ao salvar veículos:', e);
    }
  }
};

/**
 * Função auxiliar para mapear dados do banco para o tipo MemberExtended
 */
const mapToMemberExtended = (member: any, memberData: any): MemberExtended => {
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
    username: member.username || memberData.username || member.email?.split('@')[0],
    vehicles: memberData.vehicles || [],
    duesPayments: memberData.duesPayments || [],
  };
};

/**
 * Atualiza um membro existente no banco de dados
 */
export const updateMemberInDb = async (memberData: MemberExtended): Promise<MemberExtended> => {
  try {
    // Preparar dados para atualização
    const memberToUpdate = {
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
      received_member_kit: memberData.receivedMemberKit,
    };

    // Tentar atualizar com username
    if (memberData.username) {
      try {
        // @ts-expect-error - Ignorando erros de tipo do Supabase
        memberToUpdate.username = memberData.username;
        
        // @ts-expect-error - Ignorando erros de tipo do Supabase
        const { error } = await supabase
          .from('members')
          .update(memberToUpdate)
          .eq('id', memberData.id);

        if (!error) {
          // Sucesso na atualização com username
          console.log("Membro atualizado com username:", memberData.username);
          await updateAdditionalMemberData(memberData);
          
          toast({
            title: 'Sucesso',
            description: 'Membro atualizado com sucesso.',
          });
          
          return memberData;
        }
      } catch (e) {
        console.warn("Erro ao atualizar membro com username, tentando sem username:", e);
      }
    }
    
    // Se falhou, tenta atualizar sem o campo username
    // @ts-expect-error - Acessando propriedade
    delete memberToUpdate.username;
    
    // @ts-expect-error - Ignorando erros de tipo do Supabase
    const { error } = await supabase
      .from('members')
      .update(memberToUpdate)
      .eq('id', memberData.id);

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o membro: ' + error.message,
        variant: 'destructive',
      });
      throw error;
    }

    // Atualizar dados adicionais
    await updateAdditionalMemberData(memberData);
    
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

/**
 * Função auxiliar para atualizar dados adicionais do membro
 */
const updateAdditionalMemberData = async (memberData: MemberExtended) => {
  // Update address
  if (memberData.address) {
    try {
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
            console.error('Erro ao atualizar endereço:', addressError);
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
            console.error('Erro ao criar endereço:', addressError);
          }
        }
      }
    } catch (e) {
      console.error('Exceção ao atualizar endereço:', e);
    }
  }
};

/**
 * Exclui um membro do banco de dados
 */
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
        description: 'Não foi possível excluir o membro: ' + error.message,
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

/**
 * Cria uma conta de usuário para um membro
 */
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
        username: memberData.username || memberData.email.split('@')[0],
      }
    });

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a conta de usuário: ' + error.message,
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
