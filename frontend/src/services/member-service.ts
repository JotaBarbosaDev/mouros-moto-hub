import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { MemberExtended, MemberDbResponse } from '@/types/member-extended';
import { BloodType, MemberType, Vehicle } from '@/types/member';
import { activityLogService } from './activity-log-service';

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

    // Garantir que os dados são do tipo esperado antes de mapear
    return Array.isArray(data) 
      ? data.map(member => {
          // Verificar se o objeto tem a estrutura esperada antes de fazer o cast
          if (typeof member === 'object' && member !== null) {
            return mapMemberFromDb(member as unknown as MemberDbResponse);
          }
          // Se o objeto não tiver a estrutura esperada, retornar um objeto vazio
          console.warn('Objeto de membro inválido encontrado:', member);
          // Retornar um objeto com ID para que possa ser identificado e filtrado corretamente
          return { id: '' } as MemberExtended;
        }).filter(member => !!member?.id) // Verificação segura com operador opcional
      : [];
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

    // Verificar se os dados têm a estrutura esperada antes de fazer o cast
    if (data && typeof data === 'object' && data !== null) {
      return mapMemberFromDb(data as unknown as MemberDbResponse);
    }
    return null;
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

    // Verificar se os dados têm a estrutura esperada antes de fazer o cast
    if (data && typeof data === 'object' && data !== null && 'id' in data) {
      // Registrar a criação do membro no histórico
      try {
        const userDetails = await supabase.auth.getUser();
        const user = userDetails?.data?.user;
        
        // Obter o nome de usuário de forma mais detalhada, priorizando informações disponíveis
        const username = user?.user_metadata?.name || 
                         user?.user_metadata?.username || 
                         user?.email || 
                         'sistema';
        
        await activityLogService.createLog({
          userId: user?.id || null,
          username: username,
          action: 'CREATE',
          entityType: 'MEMBER',
          entityId: data.id,
          details: {
            memberName: data.name,
            memberNumber: data.member_number,
            memberEmail: data.email,
            createdBy: username,
            createdAt: new Date().toISOString()
          }
        });
        console.log(`Log de criação de membro registrado com sucesso por ${username}.`);
      } catch (logError) {
        console.error('Erro ao registrar log de criação de membro:', logError);
        // Não interrompemos o fluxo em caso de falha no log
      }
      
      return mapMemberFromDb(data as unknown as MemberDbResponse);
    } 
    console.warn('Dados inválidos retornados ao criar membro:', data);
    // Retornar um objeto com ID vazio para evitar erros de nulo
    return { id: '' } as MemberExtended;
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

    // Verificar se os dados têm a estrutura esperada antes de fazer o cast
    if (data && typeof data === 'object' && data !== null && 'id' in data) {
      // Registrar a atualização do membro no histórico
      try {
        const userDetails = await supabase.auth.getUser();
        const user = userDetails?.data?.user;
        
        // Obter o nome de usuário de forma mais detalhada, priorizando informações disponíveis
        const username = user?.user_metadata?.name || 
                         user?.user_metadata?.username || 
                         user?.email || 
                         'sistema';
        
        await activityLogService.createLog({
          userId: user?.id || null,
          username: username,
          action: 'UPDATE',
          entityType: 'MEMBER',
          entityId: data.id,
          details: {
            memberName: data.name,
            memberNumber: data.member_number,
            changedFields: Object.keys(memberToUpdate).join(', '),
            updatedBy: username,
            updatedAt: new Date().toISOString()
          }
        });
        console.log(`Log de atualização de membro registrado com sucesso por ${username}.`);
      } catch (logError) {
        console.error('Erro ao registrar log de atualização de membro:', logError);
        // Não interrompemos o fluxo em caso de falha no log
      }
      
      return mapMemberFromDb(data as unknown as MemberDbResponse);
    }
    console.warn('Dados inválidos retornados ao atualizar membro:', data);
    // Retornar um objeto com ID vazio para evitar erros de nulo
    return { id: '' } as MemberExtended;
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
    
    // Registrar a exclusão do membro no histórico
    try {
      // Primeiro, buscar o nome do membro que está sendo excluído para enriquecer o log
      const { data: memberData } = await supabase
        .from('members')
        .select('name, member_number')
        .eq('id', id)
        .single();
      
      const userDetails = await supabase.auth.getUser();
      const user = userDetails?.data?.user;
      
      // Obter o nome de usuário de forma mais detalhada, priorizando informações disponíveis
      const username = user?.user_metadata?.name || 
                       user?.user_metadata?.username || 
                       user?.email || 
                       'sistema';
      
      await activityLogService.createLog({
        userId: user?.id || null,
        username: username,
        action: 'DELETE',
        entityType: 'MEMBER',
        entityId: id,
        details: {
          memberName: memberData?.name || 'Nome não disponível',
          memberNumber: memberData?.member_number || 'Número não disponível',
          deletedAt: new Date().toISOString(),
          deletedBy: username
        }
      });
      console.log(`Log de exclusão de membro registrado com sucesso por ${username}.`);
    } catch (logError) {
      console.error('Erro ao registrar log de exclusão de membro:', logError);
      // Não interrompemos o fluxo em caso de falha no log
    }
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
