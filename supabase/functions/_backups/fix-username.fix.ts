// supabase/functions/user-management/fix-username.fix.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.23.0';
import { filterUsername } from './filter-username.ts';

// Definições de tipos para o Supabase Admin
interface SupabaseAdminClient {
  auth: {
    admin: {
      getUserById(userId: string): Promise<{ 
        data: { user: any } | null; 
        error: { message: string } | null 
      }>;
      updateUserById(userId: string, attributes: Record<string, any>): Promise<{
        data: any;
        error: { message: string } | null;
      }>;
    };
  };
  from(table: string): {
    insert(data: Record<string, any>): any;
  };
}

// Esta função pode ser chamada manualmente para atualizar o username para qualquer valor desejado
export async function fixUsername(supabase: SupabaseAdminClient, { userId, correctUsername }: { userId: string, correctUsername: string }) {
  try {
    console.log(`Iniciando atualização manual de username para usuário ${userId}`);
    console.log(`Novo username fornecido: "${correctUsername}"`);
    
    // Verificar usuário existente
    const { data: userData, error: getUserError } = await supabase.auth.admin.getUserById(userId);
    
    if (getUserError) {
      console.error('Erro ao buscar usuário:', getUserError);
      return { error: { message: `Usuário não encontrado: ${getUserError.message}` } };
    }
    
    if (!userData || !userData.user) {
      console.error('Usuário não encontrado pelo ID:', userId);
      return { error: { message: 'Usuário não encontrado' } };
    }
    
    // Obter metadados atuais
    const existingMetadata = userData.user.user_metadata || {};
    console.log('Metadados atuais:', existingMetadata);
    console.log('Username atual:', existingMetadata.username);
    
    // Registra informações sobre o novo username para diagnóstico
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(correctUsername);
    const hasUppercase = /[A-Z]/.test(correctUsername);
    const hasNumbers = /[0-9]/.test(correctUsername);
    
    console.log("Características do novo username:", {
      comprimento: correctUsername.length,
      temCaracteresEspeciais: hasSpecialChars,
      temMaiusculas: hasUppercase,
      temNumeros: hasNumbers
    });
    
    // Atualizar metadados com o username fornecido, preservando outros dados
    const updatedMetadata = {
      ...existingMetadata,
      username: correctUsername
    };
    
    // Atualizar os metadados do usuário
    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: updatedMetadata
    });
    
    if (error) {
      console.error('Erro ao atualizar username:', error);
      return { error: { message: `Falha ao atualizar username: ${error.message}` } };
    }
    
    // Registra a correção na tabela de correções para análise futura
    try {
      const oldUsername = existingMetadata.username;
      const detectedPattern = detectPattern(oldUsername);
      
      await supabase
        .from('username_corrections')
        .insert({
          user_id: userId,
          old_username: oldUsername || '(vazio)',
          new_username: correctUsername,
          detected_pattern: detectedPattern,
          correction_source: 'manual'  // origem manual vs. automática
        });
      
      console.log('Registro de correção adicionado para análise futura');
    } catch (recordError) {
      // Não falhar se o registro falhar, apenas logar
      console.warn('Erro ao salvar registro de correção:', recordError);
    }
    
    console.log('Username atualizado com sucesso para:', correctUsername);
    return { success: true, data: { username: correctUsername } };
  } catch (error: any) {
    console.error('Exceção ao atualizar username:', error);
    return { error: { message: `Erro interno: ${error.message}` } };
  }
}

// Função auxiliar para detectar padrões de erro em usernames antigos
function detectPattern(oldUsername: string | undefined): string {
  if (!oldUsername) return 'empty';
  
  if (oldUsername.indexOf('\u0000') >= 0) return 'null_chars';
  if (/[^\x00-\x7F]/.test(oldUsername)) return 'non_ascii';
  if (oldUsername !== oldUsername.trim()) return 'whitespace';
  
  // Padrões específicos já observados
  if (oldUsername.toLowerCase() !== oldUsername) return 'case_transformation';
  if (oldUsername.replace(/[^\w]/g, '') !== oldUsername) return 'special_char_removal';
  
  return 'unknown';
}
