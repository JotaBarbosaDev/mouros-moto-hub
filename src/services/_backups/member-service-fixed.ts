import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { MemberExtended, MemberDbResponse } from '@/types/member-extended';
import { BloodType, MemberType, Vehicle } from '@/types/member';

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

// O restante do arquivo permanece igual - apenas atualizamos a função getMembersFromDb
export { createMemberInDb, updateMemberInDb, deleteMemberFromDb, createUserAccount } from './member-service';
