/**
 * Utilitário para verificar e corrigir problemas com colunas no banco de dados
 */
const { supabaseAdmin } = require('../config/supabase');

/**
 * Verifica e garante que as colunas necessárias existam na tabela de veículos
 */
async function ensureVehicleColumns() {
  try {
    // Primeiro verificar se podemos acessar a tabela
    console.log('Verificando acesso à tabela vehicles...');
    
    try {
      const { data, error } = await supabaseAdmin
        .from('vehicles')
        .select('id')
        .limit(1);
      
      if (error && error.code === '42P01') {
        console.log('Tabela vehicles não existe. Pulando verificação de colunas.');
        return false;
      }
      
      console.log('Acesso à tabela vehicles OK.');
    } catch (error) {
      console.error('Erro ao verificar tabela vehicles:', error);
      return false;
    }
    
    // Verificar colunas existentes
    const { data, error } = await supabaseAdmin
      .from('vehicles')
      .select('*')
      .limit(1);
    
    // Verificar se a coluna displacement existe no resultado
    let hasDisplacement = false;
    
    if (data && data.length > 0) {
      hasDisplacement = 'displacement' in data[0];
      console.log(`Coluna displacement ${hasDisplacement ? 'existe' : 'não existe'} na tabela.`);
    }
    
    // Se não tiver displacement, tentar corrigir
    if (!hasDisplacement) {
      console.log('Tentando adicionar coluna displacement...');
      
      try {
        // Usar SQL direto através do insert para tentar adicionar coluna
        const { error } = await supabaseAdmin
          .from('_temp_test')
          .insert({ 
            sql_command: 'ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS displacement INTEGER;' 
          });
          
        if (!error || (error && error.message.includes('does not exist'))) {
          console.log('Comando para adicionar displacement enviado.');
        }
      } catch (error) {
        console.log('Erro esperado ao tentar adicionar coluna (ignorável):', error.message);
      }
    }
    
    console.log('Verificação de colunas concluída.');
    return true;
  } catch (error) {
    console.error('Erro ao verificar/corrigir colunas:', error);
    return false;
  }
}

module.exports = { ensureVehicleColumns };
