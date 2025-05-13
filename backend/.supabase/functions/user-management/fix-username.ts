
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.23.0';
import { filterUsername } from './filter-username.ts';

// Esta função pode ser chamada manualmente para verificar e corrigir um username específico
export async function fixUsername(supabase, { userId, correctUsername }) {
  try {
    console.log(`Iniciando correção de username para usuário ${userId}`);
    console.log(`Username correto fornecido: "${correctUsername}"`);
    
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
    
    // Aplicar filtro para verificar se o username fornecido precisa de correção
    const filteredUsername = filterUsername(correctUsername);
    
    if (filteredUsername !== correctUsername) {
      console.log(`⚠️ O username fornecido contém padrões problemáticos. Sugestão de correção: ${filteredUsername}`);
      console.log(`Continuando com o username fornecido manualmente: ${correctUsername}`);
    }
    
    // Atualizar metadados com o username correto, preservando outros dados
    const updatedMetadata = {
      ...existingMetadata,
      username: correctUsername // Usamos o valor fornecido pelo usuário, não o filtrado
    };
    
    console.log('Metadados atualizados:', updatedMetadata);
    
    // Aplicar atualização
    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: updatedMetadata
    });
    
    if (error) {
      console.error('Erro ao atualizar metadados:', error);
      throw error;
    }
    
    console.log('Username corrigido com sucesso!');
    
    // Armazenar mapeamento de username antigo -> novo para referência futura
    try {
      if (existingMetadata.username && existingMetadata.username !== correctUsername) {
        // Registramos o mapeamento em uma tabela auxiliar para futura referência
        // Isso pode ser útil para debug ou para identificar padrões de transformação
        const { error: logError } = await supabase
          .from('username_corrections')
          .insert({
            user_id: userId,
            old_username: existingMetadata.username,
            new_username: correctUsername,
            detected_pattern: existingMetadata.username.includes('mb') ? 'mb_transformation' : 'other',
            corrected_at: new Date().toISOString()
          })
          .select();
          
        if (logError) {
          console.warn('Erro ao registrar correção de username:', logError);
          // Não impedimos o fluxo principal por causa de erro no registro
        }
      }
    } catch (logErr) {
      console.warn('Erro ao tentar registrar correção:', logErr);
      // Ignoramos erros nesta parte para não afetar o fluxo principal
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Exceção ao corrigir username:', error);
    return { error: { message: error.message } };
  }
}
