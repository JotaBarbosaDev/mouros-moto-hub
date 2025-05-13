// src/types/supabase-rpc.ts
/**
 * Tipos para as funções RPC do Supabase
 * Este arquivo complementa os tipos gerados automaticamente pelo Supabase CLI
 */

// Tipo de retorno da função get_user_by_username
export interface UserByUsername {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  member_id: string;
  name: string;
  username: string;
}

// Namespace para as funções RPC do Supabase
export namespace SupabaseRPC {
  // Assinatura da função get_user_by_username
  export interface GetUserByUsername {
    (params: { p_username: string }): Promise<{
      data: UserByUsername | null;
      error: { message: string } | null;
    }>;
  }
}
