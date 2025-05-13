// src/services/admin-service.ts
import { fetchWithAuth, getApiBaseUrl } from '@/utils/api';

export interface SystemStats {
  membersCount: number;
  vehiclesCount: number;
  eventsCount: number;
  barProductsCount: number;
  inventoryItemsCount: number;
  duesPaidCount: number;
  duesPendingCount: number;
}

export interface UserListItem {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
  };
  app_metadata?: {
    role?: string;
    provider?: string;
  };
  role?: string;
  member_id?: string;
}

export interface UserListResponse {
  users: UserListItem[];
  totalCount: number;
}

export interface UpdateUserRoleData {
  userId: string;
  role: 'admin' | 'user' | 'editor';
}

export interface LinkMemberData {
  userId: string;
  memberId: string;
}

/**
 * Serviço para funcionalidades administrativas
 */
export const adminService = {
  /**
   * Obtém estatísticas gerais do sistema
   */
  getStats: async (): Promise<SystemStats> => {
    const apiUrl = `${getApiBaseUrl()}/admin/stats`;
    const response = await fetchWithAuth(apiUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      membersCount: data.membersCount || 0,
      vehiclesCount: data.vehiclesCount || 0,
      eventsCount: data.eventsCount || 0,
      barProductsCount: data.barProductsCount || 0,
      inventoryItemsCount: data.inventoryItemsCount || 0,
      duesPaidCount: data.duesPaidCount || 0,
      duesPendingCount: data.duesPendingCount || 0
    };
  },
  
  /**
   * Lista usuários do sistema
   */
  listUsers: async (options?: { filter?: string; page?: number; pageSize?: number }): Promise<UserListResponse> => {
    const filter = options?.filter || '';
    const page = options?.page || 1;
    const pageSize = options?.pageSize || 10;
    
    const apiUrl = `${getApiBaseUrl()}/admin/users?page=${page}&pageSize=${pageSize}${filter ? `&filter=${encodeURIComponent(filter)}` : ''}`;
    
    const response = await fetchWithAuth(apiUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      users: data.users || [],
      totalCount: data.totalCount || 0
    };
  },
  
  /**
   * Obtém detalhes de um usuário específico
   */
  getUserById: async (userId: string): Promise<UserListItem> => {
    const apiUrl = `${getApiBaseUrl()}/admin/users/${userId}`;
    const response = await fetchWithAuth(apiUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return response.json();
  },
  
  /**
   * Atualiza a função/papel de um usuário
   */
  updateUserRole: async (data: UpdateUserRoleData): Promise<UserListItem> => {
    const apiUrl = `${getApiBaseUrl()}/admin/users/${data.userId}/role`;
    const response = await fetchWithAuth(apiUrl, {
      method: 'PUT',
      body: JSON.stringify({ role: data.role })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return response.json();
  },
  
  /**
   * Vincula um usuário a um membro
   */
  linkUserToMember: async (data: LinkMemberData): Promise<UserListItem> => {
    const apiUrl = `${getApiBaseUrl()}/admin/users/${data.userId}/link-member`;
    const response = await fetchWithAuth(apiUrl, {
      method: 'PUT',
      body: JSON.stringify({ memberId: data.memberId })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return response.json();
  },
  
  /**
   * Remove o vínculo entre um usuário e um membro
   */
  unlinkUserFromMember: async (userId: string): Promise<UserListItem> => {
    const apiUrl = `${getApiBaseUrl()}/admin/users/${userId}/unlink-member`;
    const response = await fetchWithAuth(apiUrl, {
      method: 'PUT'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return response.json();
  },
  
  /**
   * Redefine a senha de um usuário (envia e-mail)
   */
  resetUserPassword: async (userId: string): Promise<{ success: boolean }> => {
    const apiUrl = `${getApiBaseUrl()}/admin/users/${userId}/reset-password`;
    const response = await fetchWithAuth(apiUrl, {
      method: 'POST'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return response.json();
  },
  
  /**
   * Desativa um usuário
   */
  disableUser: async (userId: string): Promise<{ success: boolean }> => {
    const apiUrl = `${getApiBaseUrl()}/admin/users/${userId}/disable`;
    const response = await fetchWithAuth(apiUrl, {
      method: 'PUT'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return response.json();
  },
  
  /**
   * Reativa um usuário
   */
  enableUser: async (userId: string): Promise<{ success: boolean }> => {
    const apiUrl = `${getApiBaseUrl()}/admin/users/${userId}/enable`;
    const response = await fetchWithAuth(apiUrl, {
      method: 'PUT'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return response.json();
  },
  
  /**
   * Cria um novo usuário administrativo
   */
  createUser: async (userData: { email: string; password: string; name: string; role?: string }): Promise<UserListItem> => {
    const apiUrl = `${getApiBaseUrl()}/admin/users`;
    const response = await fetchWithAuth(apiUrl, {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return response.json();
  }
};
