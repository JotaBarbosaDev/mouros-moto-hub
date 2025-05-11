import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { MemberExtended, MemberDbResponse, VehicleData, AddressData, DuesPaymentData } from '@/types/member-extended';
import { BloodType, MemberType, Vehicle, VehicleType } from '@/types/member';
import { vehiclesTable, duesPaymentsTable, addressesTable } from './supabase-helpers';
import { CustomSupabaseClient, SupabaseQueryResponse } from '@/types/custom-supabase';

// Helper para tipagem de respostas Supabase
type SupabaseResponse<T> = Promise<{
  data: T | null;
  error: {
    message: string;
    details?: string;
    hint?: string;
    code?: string;
  } | null;
}>;

// Tipo para membros retornados do Supabase
interface SupabaseMemberResponse {
  id: string;
  name: string;
  member_number: string;
  is_admin: boolean;
  is_active: boolean;
  email: string;
  phone_main: string;
  phone_alternative?: string;
  nickname?: string;
  photo_url?: string;
  join_date: string;
  member_type: string;
  honorary_member: boolean;
  blood_type?: string;
  in_whatsapp_group?: boolean;
  received_member_kit?: boolean;
  legacy_member?: boolean;
  registration_fee_paid?: boolean;
  registration_fee_exempt?: boolean;
}

// Tipo para endereços retornados do Supabase
interface SupabaseAddressResponse {
  id: string;
  member_id: string;
  street: string;
  number: string;
  postal_code: string;
  city: string;
  district: string;
  country: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Função utilitária para converter um veículo do formato Supabase para o formato da aplicação
 */
export const mapVehicleFromSupabase = (vehicleData: VehicleData): Vehicle => {
  return {
    id: vehicleData.id || '',
    brand: vehicleData.brand,
    model: vehicleData.model,
    type: vehicleData.type as VehicleType,
    displacement: typeof vehicleData.displacement === 'string' 
      ? parseInt(vehicleData.displacement, 10) 
      : Number(vehicleData.displacement),
    nickname: vehicleData.nickname || undefined,
    photoUrl: vehicleData.photo_url || undefined
  };
};

/**
 * Função utilitária para converter um endereço do formato Supabase para o formato da aplicação
 */
export const mapAddressFromSupabase = (addressData: AddressData | null) => {
  if (!addressData) {
    return {
      street: '',
      number: '',
      postalCode: '',
      city: '',
      district: '',
      country: ''
    };
  }
  
  return {
    street: addressData.street || '',
    number: addressData.number || '',
    postalCode: addressData.postal_code || '',
    city: addressData.city || '',
    district: addressData.district || '',
    country: addressData.country || ''
  };
};

/**
 * Busca todos os membros do banco de dados
 */
export const getMembersFromDb = async (): Promise<MemberExtended[]> => {
  try {
    console.log("Iniciando busca de membros...");
    
    // Busca os membros com todas as colunas disponíveis na tabela members
    // Não inclui username pois sabemos que a coluna não existe
    const { data: membersData, error } = await (supabase
      .from('members')
      .select('id, name, member_number, is_admin, is_active, email, phone_main, phone_alternative, nickname, photo_url, join_date, member_type, honorary_member, blood_type, in_whatsapp_group, received_member_kit, legacy_member, registration_fee_paid, registration_fee_exempt')
      .order('name') as unknown as SupabaseResponse<SupabaseMemberResponse[]>);

    if (error) {
      console.error("Erro ao buscar membros:", error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os membros: ' + error.message,
        variant: 'destructive',
      });
      throw error;
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
          // Get vehicles usando o helper
          const { data: vehiclesData } = await vehiclesTable.select('*', { 
            eq: ['member_id', member.id] 
          });
            
          // Get dues payments usando o helper
          const { data: duesPaymentsData } = await duesPaymentsTable.select('*', {
            eq: ['member_id', member.id]
          });
            
          // Get address - usando tratamento de erro para possíveis erros 406
          let addressData = null;
          try {
            // Usando o helper addressesTable para buscar o endereço
            const { data: fetchedAddress, error: addressError } = await addressesTable.maybeSingle({ 
              eq: ['member_id', member.id]
            });
              
            if (!addressError && fetchedAddress) {
              addressData = fetchedAddress;
            } else if (addressError) {
              console.warn(`Erro ao buscar endereço do membro ${member.id}:`, addressError);
            }
          } catch (e) {
            console.warn(`Exceção ao buscar endereço do membro ${member.id}:`, e);
          }
            
          // Criar username baseado no email (já que a coluna não existe no banco)
          const username = member.email?.split('@')[0] || '';
          
          // Mapeia veículos usando a função utilitária
          const vehicles = Array.isArray(vehiclesData) 
            ? vehiclesData.map((v: VehicleData) => mapVehicleFromSupabase(v)) 
            : [];
            
          // Mapeia pagamentos de cotas
          const duesPayments = Array.isArray(duesPaymentsData) 
            ? duesPaymentsData.map((payment: DuesPaymentData) => ({
                year: payment.year,
                paid: payment.paid,
                exempt: payment.exempt,
                date: payment.payment_date
              })) 
            : [];
            
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
            // Use actual address data if available, otherwise provide default empty values
            address: mapAddressFromSupabase(addressData),
            bloodType: member.blood_type as BloodType | undefined,
            legacyMember: member.legacy_member || false,
            registrationFeePaid: member.registration_fee_paid || false,
            registrationFeeExempt: member.registration_fee_exempt || false,
            inWhatsAppGroup: member.in_whatsapp_group || false,
            receivedMemberKit: member.received_member_kit || false,
            username, // Username derivado do email
            vehicles,
            duesPayments,
          };
        } catch (memberError: unknown) {
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
    // Preparar dados para inserção (sem a coluna username)
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
      legacy_member: memberData.legacyMember,
      registration_fee_paid: memberData.registrationFeePaid,
      registration_fee_exempt: memberData.registrationFeeExempt
    };

    // Inserir membro sem username
    const { data: member, error: memberError } = await (supabase
      .from('members')
      .insert(memberToInsert)
      .select()
      .single() as unknown as SupabaseResponse<SupabaseMemberResponse>);

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

    return mapToMemberExtended(member as unknown as Record<string, unknown>, memberData);
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
      const { error: addressError } = await addressesTable.insert({
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

      // Usando helper para inserir veículos
      for (const vehicle of vehiclesToInsert) {
        const { error: vehicleError } = await vehiclesTable.insert(vehicle);
        if (vehicleError) {
          console.error('Erro ao salvar veículo:', vehicleError);
        }
      }
    } catch (e) {
      console.error('Exceção ao salvar veículos:', e);
    }
  }
};

/**
 * Função utilitária para mapear um membro do formato do Supabase para o formato da aplicação
 */
const mapToMemberExtended = (member: Record<string, unknown>, memberData: Partial<MemberExtended>): MemberExtended => {
  // Extrair informações do membro para tipagem mais segura
  const memberResponse = {
    id: member.id as string,
    name: member.name as string,
    member_number: member.member_number as string,
    is_admin: member.is_admin as boolean,
    is_active: member.is_active as boolean,
    email: member.email as string,
    phone_main: member.phone_main as string,
    phone_alternative: member.phone_alternative as string | undefined,
    nickname: member.nickname as string | undefined,
    photo_url: member.photo_url as string | undefined,
    join_date: member.join_date as string,
    member_type: member.member_type as MemberType,
    honorary_member: member.honorary_member as boolean,
    blood_type: member.blood_type as BloodType | undefined,
    in_whatsapp_group: Boolean(member.in_whatsapp_group),
    received_member_kit: Boolean(member.received_member_kit),
    legacy_member: Boolean(member.legacy_member),
    registration_fee_paid: Boolean(member.registration_fee_paid),
    registration_fee_exempt: Boolean(member.registration_fee_exempt)
  };
  
  // Determinar username baseado no email
  const username = memberData.username || (memberResponse.email?.split('@')[0] || '');
    
  // Mapear para o formato extendido
  return {
    id: memberResponse.id,
    name: memberResponse.name,
    memberNumber: memberResponse.member_number,
    isAdmin: memberResponse.is_admin,
    isActive: memberResponse.is_active,
    email: memberResponse.email,
    phoneMain: memberResponse.phone_main,
    phoneAlternative: memberResponse.phone_alternative,
    nickname: memberResponse.nickname,
    photoUrl: memberResponse.photo_url,
    joinDate: memberResponse.join_date,
    memberType: memberResponse.member_type,
    honoraryMember: memberResponse.honorary_member,
    address: memberData.address || {
      street: '',
      number: '',
      postalCode: '',
      city: '',
      district: '',
      country: ''
    },
    bloodType: memberResponse.blood_type,
    legacyMember: memberResponse.legacy_member,
    registrationFeePaid: memberResponse.registration_fee_paid,
    registrationFeeExempt: memberResponse.registration_fee_exempt,
    inWhatsAppGroup: memberResponse.in_whatsapp_group,
    receivedMemberKit: memberResponse.received_member_kit,
    username,
    vehicles: memberData.vehicles || [],
    duesPayments: memberData.duesPayments || [],
  };
};

/**
 * Atualiza um membro existente no banco de dados
 */
export const updateMemberInDb = async (memberData: MemberExtended): Promise<MemberExtended> => {
  try {
    // Preparar dados para atualização (sem username)
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
      legacy_member: memberData.legacyMember,
      registration_fee_paid: memberData.registrationFeePaid,
      registration_fee_exempt: memberData.registrationFeeExempt
    };

    // Atualizar membro
    const { error } = await (supabase
      .from('members')
      .update(memberToUpdate)
      .eq('id', memberData.id) as unknown as SupabaseResponse<SupabaseMemberResponse>);

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
      const { data: existingAddress, error: existingAddressError } = await (supabase
        .from('addresses')
        .select('id')
        .eq('member_id', memberData.id)
        .maybeSingle() as unknown as SupabaseResponse<{id: string}>);

      if (!existingAddressError) {
        if (existingAddress) {
          // Update existing address
          const { error: addressError } = await addressesTable.update({
            street: memberData.address.street,
            number: memberData.address.number,
            postal_code: memberData.address.postalCode,
            city: memberData.address.city,
            district: memberData.address.district,
            country: memberData.address.country
          }, { eq: ['member_id', memberData.id] });

          if (addressError) {
            console.error('Erro ao atualizar endereço:', addressError);
          }
        } else {
          // Create new address
          const { error: addressError } = await addressesTable.insert({
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
    const { error } = await (supabase
      .from('members')
      .delete()
      .eq('id', memberId) as unknown as SupabaseResponse<null>);
      
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
    // Senha padrão baseada no email
    const password = memberData.email.split('@')[0];
    
    // Usar o tipo AuthAdmin definido no custom-supabase.ts
    const customSupabase = supabase as CustomSupabaseClient;
    
    const { data, error } = await customSupabase.auth.admin.createUser({
      email: memberData.email,
      password: password,
      email_confirm: true,
      user_metadata: {
        name: memberData.name,
        member_id: memberData.id,
        username: memberData.email.split('@')[0], // Derivado do email
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
