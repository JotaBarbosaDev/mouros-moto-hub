// src/services/admin-user-service.ts
import { supabase } from '@/integrations/supabase/client';

/**
 * Interface para o retorno da função get_user_by_username
 */
interface UserByUsername {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  member_id: string;
  name: string;
  username: string;
}

/**
 * Serviço para listar e gerenciar usuários (apenas para administradores)
 */
export const adminUserService = {
  /**
   * Lista usuários do sistema de autenticação
   */
  listUsers: async (options?: { filter?: string, page?: number, pageSize?: number }) => {
    try {
      const filter = options?.filter || '';
      const page = options?.page || 1;
      const pageSize = options?.pageSize || 10;

      // Usamos a função Edge para buscar usuários
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await supabase.functions.invoke('list-users', {
        body: {
          filter,
          page,
          pageSize
        }
      });

      if (response.error) throw response.error;
      
      return {
        data: response.data,
        error: null
      };
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Erro desconhecido ao listar usuários'
        }
      };
    }
  },

  /**
   * Encontra usuário por username nos metadados
   * Esta função não requer permissões administrativas e pode ser usada no login
   */
  findUserByUsername: async (username: string) => {
    try {
      // Usa a função RPC que criamos na migração
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await supabase.rpc('get_user_by_username', {
        p_username: username
      });

      if (response.error) throw response.error;
      
      return {
        data: response.data as UserByUsername | null,
        error: null
      };
    } catch (error) {
      console.error('Erro ao buscar usuário por username:', error);
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Erro desconhecido ao buscar usuário'
        }
      };
    }
  }
};
