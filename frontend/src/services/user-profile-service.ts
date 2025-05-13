import { supabase } from '@/integrations/supabase/client';

/**
 * Interface para dados de usuário pelo username
 */
export interface UserByUsername {
  id: string;
  email: string;
  username: string;
  member_id?: string;
}

/**
 * Serviço para buscar dados de usuário pelo username
 */
export const userProfileService = {
  findUserByUsername: async (username: string): Promise<{ data: UserByUsername | null, error: Error | null }> => {
    try {
      // Em vez de acessar diretamente as propriedades protegidas, 
      // vamos usar a URL e chave do ambiente (mesmos valores que o cliente supabase usa)
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      // Usando REST API direta para evitar problemas de tipagem com views não declaradas
      const apiUrl = `${supabaseUrl}/rest/v1/user_profiles_view?username=eq.${encodeURIComponent(username)}&select=id,email,username,member_id`;
      
      const response = await fetch(apiUrl, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar usuário: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        return { data: data[0], error: null };
      }
      
      return { data: null, error: new Error('Usuário não encontrado') };
    } catch (error) {
      console.error('Erro ao buscar usuário pelo username:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Erro ao buscar usuário') 
      };
    }
  }
};
