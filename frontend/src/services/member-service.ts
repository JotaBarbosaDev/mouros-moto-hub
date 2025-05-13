import { fetchWithAuth, getApiBaseUrl } from '@/utils/api';
import { MemberExtended } from '@/types/member-extended';

/**
 * Serviço para gerenciamento de membros
 */
export const memberService = {
  /**
   * Busca todos os membros
   */
  getAll: async (): Promise<MemberExtended[]> => {
    const apiUrl = `${getApiBaseUrl()}/members`;
    const response = await fetchWithAuth(apiUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return response.json();
  },
  
  /**
   * Busca um membro pelo ID
   */
  getById: async (id: string): Promise<MemberExtended> => {
    const apiUrl = `${getApiBaseUrl()}/members/${id}`;
    const response = await fetchWithAuth(apiUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return response.json();
  },
  
  /**
   * Cria um novo membro
   */
  create: async (member: Omit<MemberExtended, 'id'>): Promise<MemberExtended> => {
    const apiUrl = `${getApiBaseUrl()}/members`;
    
    // Garantir que campos importantes não sejam undefined
    const validatedMember = {
      ...member,
      phoneMain: member.phoneMain || "",
      phoneAlternative: member.phoneAlternative || null,
      email: member.email || "",
      name: member.name || "",
    };
    
    // Adaptar os dados para o formato esperado pelo backend
    const adaptedMember = {
      name: validatedMember.name,
      email: validatedMember.email,
      phone_main: validatedMember.phoneMain,
      phone_alternative: validatedMember.phoneAlternative,
      nickname: validatedMember.nickname,
      photo_url: validatedMember.photoUrl,
      join_date: validatedMember.joinDate,
      member_type: validatedMember.memberType,
      blood_type: validatedMember.bloodType,
      honorary_member: validatedMember.honoraryMember,
      in_whatsapp_group: validatedMember.inWhatsAppGroup || false,
      received_member_kit: validatedMember.receivedMemberKit,
      is_admin: validatedMember.isAdmin,
      is_active: validatedMember.isActive,
      // Dados adicionais
      address: member.address ? {
        street: member.address.street,
        number: member.address.number,
        postal_code: member.address.postalCode,
        city: member.address.city,
        district: member.address.district,
        country: member.address.country
      } : undefined,
      vehicles: member.vehicles,
      dues_payments: member.duesPayments
    };
    
    const response = await fetchWithAuth(apiUrl, {
      method: 'POST',
      body: JSON.stringify(adaptedMember)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Falha ao criar membro: ${response.status} - ${JSON.stringify(errorData)}`);
    }
    
    return response.json();
  },
  
  /**
   * Atualiza um membro existente
   */
  update: async (id: string, member: MemberExtended): Promise<MemberExtended> => {
    const apiUrl = `${getApiBaseUrl()}/members/${id}`;
    
    // Garantir que campos importantes não sejam undefined
    const validatedMember = {
      ...member,
      phoneMain: member.phoneMain || "",
      phoneAlternative: member.phoneAlternative || null,
      email: member.email || "",
      name: member.name || "",
    };
    
    // Adaptar os dados para o formato esperado pelo backend
    const adaptedMember = {
      name: validatedMember.name,
      email: validatedMember.email,
      phone_main: validatedMember.phoneMain,
      phone_alternative: validatedMember.phoneAlternative,
      nickname: validatedMember.nickname,
      photo_url: validatedMember.photoUrl,
      join_date: validatedMember.joinDate,
      member_type: validatedMember.memberType,
      blood_type: validatedMember.bloodType,
      honorary_member: validatedMember.honoraryMember,
      in_whatsapp_group: validatedMember.inWhatsAppGroup || false,
      received_member_kit: validatedMember.receivedMemberKit || false,
      is_admin: validatedMember.isAdmin,
      is_active: validatedMember.isActive,
      // Dados adicionais
      address: validatedMember.address ? {
        street: validatedMember.address.street,
        number: validatedMember.address.number,
        postal_code: validatedMember.address.postalCode,
        city: validatedMember.address.city,
        district: validatedMember.address.district,
        country: validatedMember.address.country
      } : undefined
    };
    
    const response = await fetchWithAuth(apiUrl, {
      method: 'PUT',
      body: JSON.stringify(adaptedMember)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Falha ao atualizar membro: ${response.status} - ${JSON.stringify(errorData)}`);
    }
    
    return response.json();
  },
  
  /**
   * Remove um membro
   */
  delete: async (id: string): Promise<void> => {
    const apiUrl = `${getApiBaseUrl()}/members/${id}`;
    const response = await fetchWithAuth(apiUrl, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  }
};
