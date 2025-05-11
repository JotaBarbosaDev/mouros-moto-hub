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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await supabase.functions.invoke('user-management', {
        body: {
          action: 'updateUserPassword',
          userId,
          password
        }
      });

      if (response.error) throw response.error;
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await supabase.functions.invoke('user-management', {
        body: {
          action: 'updateUserMetadata',
          userId,
          metadata
        }
      });

      if (response.error) throw response.error;
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Erro ao atualizar metadados:', error);
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Erro desconhecido ao atualizar metadados'
        }
      };
    }
  }
};
