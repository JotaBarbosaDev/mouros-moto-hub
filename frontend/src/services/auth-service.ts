// src/services/auth-service.ts
import { fetchWithAuth, getApiBaseUrl } from '@/utils/api';

/**
 * Interface para dados de login
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Interface para dados de registro
 */
export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

/**
 * Interface para o perfil do usuário
 */
export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  role?: string;
  memberId?: string;
}

/**
 * Serviço para autenticação de usuários
 */
export const authService = {
  /**
   * Realiza login de usuário
   */
  login: async (credentials: LoginCredentials): Promise<{ user: UserProfile; token: string }> => {
    const apiUrl = `${getApiBaseUrl()}/auth/login`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Credenciais inválidas');
      }
      throw new Error(`Erro ao fazer login: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Salvar o token de acesso para uso futuro
    if (data.token) {
      localStorage.setItem('accessToken', data.token);
    }
    
    return {
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || data.user.name,
        avatarUrl: data.user.user_metadata?.avatar_url,
        role: data.user.role || 'user',
        memberId: data.user.member_id
      },
      token: data.token
    };
  },
  
  /**
   * Registra um novo usuário
   */
  register: async (userData: RegisterData): Promise<{ user: UserProfile; token: string }> => {
    const apiUrl = `${getApiBaseUrl()}/auth/register`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Erro ao registrar: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Salvar o token de acesso para uso futuro
    if (data.token) {
      localStorage.setItem('accessToken', data.token);
    }
    
    return {
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || data.user.name,
        role: data.user.role || 'user'
      },
      token: data.token
    };
  },
  
  /**
   * Faz logout do usuário atual
   */
  logout: async (): Promise<void> => {
    try {
      const apiUrl = `${getApiBaseUrl()}/auth/logout`;
      await fetchWithAuth(apiUrl, { method: 'POST' });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      // Sempre remove o token, mesmo se a chamada à API falhar
      localStorage.removeItem('accessToken');
    }
  },
  
  /**
   * Obtém o perfil do usuário logado
   */
  getProfile: async (): Promise<UserProfile> => {
    const apiUrl = `${getApiBaseUrl()}/auth/me`;
    
    try {
      console.log('Buscando perfil do usuário em:', apiUrl);
      const response = await fetchWithAuth(apiUrl);
      
      if (!response.ok) {
        console.error(`Erro ao chamar /api/auth/me: ${response.status}`);
        
        // Se a resposta contém dados de erro, tente ler e logar
        try {
          const errorData = await response.json();
          console.error('Detalhes do erro:', errorData);
        } catch (jsonError) {
          // Falha ao parsear o erro como JSON
        }
        
        throw new Error(`Erro ao obter perfil: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Dados do perfil recebidos:', data);
      
      return {
        id: data.id,
        email: data.email,
        name: data.user_metadata?.name || data.name,
        avatarUrl: data.user_metadata?.avatar_url,
        role: data.role || 'user',
        memberId: data.member_id
      };
    } catch (error) {
      console.error('Exceção ao obter perfil do usuário:', error);
      throw error;
    }
  },
  
  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('accessToken');
  },
  
  /**
   * Obtém o token de acesso atual
   */
  getAccessToken: (): string | null => {
    return localStorage.getItem('accessToken');
  }
};
