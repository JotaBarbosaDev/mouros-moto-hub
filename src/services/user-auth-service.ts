// src/services/user-auth-service.ts
import { supabase } from '@/integrations/supabase/client';

/**
 * Serviço para gerenciamento de usuários usando funções Edge do Supabase
 * Para operações que exigem privilégios administrativos
 */
export const userAuthService = {
  /**
   * Busca informações de um usuário pelo ID
   */
  getUserById: async (userId: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await supabase.functions.invoke('user-management', {
        body: {
          action: 'getUser',
          userId
        }
      });

      if (response.error) throw response.error;
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Erro desconhecido ao buscar usuário'
        }
      };
    }
  },

  /**
   * Atualiza a senha de um usuário
   */
  updateUserPassword: async (userId: string, password: string) => {
    try {
      if (!userId) {
        throw new Error('ID do usuário não fornecido');
      }
      
      if (!password || password.length < 8) {
        throw new Error('A senha deve ter pelo menos 8 caracteres');
      }
      
      console.log(`Chamando updateUserPassword para usuário ${userId}`);
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await supabase.functions.invoke('user-management', {
        body: {
          action: 'updateUserPassword',
          userId,
          password
        }
      });

      console.log('Resposta da função updateUserPassword:', response);

      if (response.error) {
        console.error('Erro retornado pela função Edge:', response.error);
        throw response.error;
      }
      
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      // Log mais detalhado para diagnóstico
      if (error instanceof Error) {
        console.error('Detalhes do erro:', error.name, error.message, error.stack);
      } else {
        console.error('Erro não é uma instância de Error:', error);
      }
      
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Erro desconhecido ao atualizar senha'
        }
      };
    }
  },

  /**
   * Atualiza os metadados de um usuário (incluindo o username)
   */
  updateUserMetadata: async (userId: string, metadata: Record<string, unknown>) => {
    try {
      if (!userId) {
        throw new Error('ID do usuário não fornecido');
      }
      
      console.log(`Chamando updateUserMetadata para usuário ${userId} com metadados:`, metadata);
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await supabase.functions.invoke('user-management', {
        body: {
          action: 'updateUserMetadata',
          userId,
          metadata
        }
      });

      console.log('Resposta da função updateUserMetadata:', response);

      if (response.error) {
        console.error('Erro retornado pela função Edge:', response.error);
        throw response.error;
      }
      
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Erro ao atualizar metadados:', error);
      // Log mais detalhado para diagnóstico
      if (error instanceof Error) {
        console.error('Detalhes do erro:', error.name, error.message, error.stack);
      } else {
        console.error('Erro não é uma instância de Error:', error);
      }
      
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Erro desconhecido ao atualizar metadados'
        }
      };
    }
  },

  /**
   * Corrige um username específico (para uso por administradores)
   */
  /**
   * Verifica o username atual de um usuário nos metadados
   * Usada apenas para diagnóstico, não faz alterações
   */
  verifyUsername: async (userId: string) => {
    try {
      if (!userId) {
        throw new Error('ID do usuário é obrigatório');
      }
      
      // Obtém o usuário para verificar seu username atual
      const { data: userData } = await userAuthService.getUserById(userId);
      
      if (!userData?.user?.user_metadata?.username) {
        console.warn('Usuário não possui username nos metadados');
        return { data: null, error: { message: 'Usuário não possui username' } };
      }
      
      const currentUsername = userData.user.user_metadata.username;
      
      // Apenas retorna informações sobre o username atual
      return { 
        data: { 
          username: currentUsername,
          hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(currentUsername),
          hasUppercase: /[A-Z]/.test(currentUsername),
          hasNumbers: /[0-9]/.test(currentUsername)
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Erro ao verificar username:', error);
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Erro desconhecido ao verificar username'
        }
      };
    }
  },

  /**
   * Aplica uma correção manual para um username
   */
  fixUsername: async (userId: string, correctUsername: string) => {
    try {
      if (!userId || !correctUsername) {
        throw new Error('ID do usuário e username correto são obrigatórios');
      }
      
      console.log(`Chamando fixUsername para usuário ${userId} com username correto: ${correctUsername}`);
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await supabase.functions.invoke('user-management', {
        body: {
          action: 'fixUsername',
          userId,
          correctUsername
        }
      });

      console.log('Resposta da função fixUsername:', response);

      if (response.error) {
        console.error('Erro retornado pela função Edge:', response.error);
        throw response.error;
      }
      
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Erro ao corrigir username:', error);
      if (error instanceof Error) {
        console.error('Detalhes do erro:', error.name, error.message, error.stack);
      } else {
        console.error('Erro não é uma instância de Error:', error);
      }
      
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Erro desconhecido ao corrigir username'
        }
      };
    }
  }
};
