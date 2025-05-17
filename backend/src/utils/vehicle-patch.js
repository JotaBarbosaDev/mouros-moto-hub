// Modelo para veículos - PATCH para contornar o problema engine_size
const { supabaseAdmin } = require('../config/supabase');

// Verifica se a coluna existe na tabela
const checkColumnExists = async (table, column) => {
  const { data, error } = await supabaseAdmin.rpc('exec_sql', { 
    sql: `
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = '${table}' 
        AND column_name = '${column}'
      ) as exists;
    `
  });
  
  if (error) {
    console.error(`Erro ao verificar coluna ${column} na tabela ${table}:`, error);
    return false;
  }
  
  return data && data.length > 0 && data[0].exists;
};

// Adiciona a coluna engine_size se não existir
const addEngineSize = async () => {
  try {
    // Verificar se a coluna existe
    const columnExists = await checkColumnExists('vehicles', 'engine_size');
    
    // Se não existir, adiciona a coluna
    if (!columnExists) {
      console.log('Coluna engine_size não existe, adicionando...');
      
      // Adicionar a coluna engine_size à tabela vehicles
      const { error: alterError } = await supabaseAdmin.rpc('exec_sql', {
        sql: `
          ALTER TABLE public.vehicles 
          ADD COLUMN IF NOT EXISTS engine_size INTEGER;
          
          UPDATE public.vehicles SET engine_size = displacement 
          WHERE engine_size IS NULL AND displacement IS NOT NULL;
        `
      });
      
      if (alterError) {
        console.error('Erro ao adicionar coluna engine_size:', alterError);
        throw alterError;
      }
      
      console.log('Coluna engine_size adicionada com sucesso!');
    } else {
      console.log('Coluna engine_size já existe na tabela vehicles');
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao adicionar coluna engine_size:', error);
    return false;
  }
};

// Exportar a função para uso no controlador
module.exports = { addEngineSize };
