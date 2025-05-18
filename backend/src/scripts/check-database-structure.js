// Script para verificar a estrutura do banco de dados
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Obter credenciais do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Credenciais do Supabase não configuradas');
  process.exit(1);
}

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Verificar se uma tabela existe
async function checkTableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', tableName);
    
    if (error) {
      console.error(`❌ Erro ao verificar tabela ${tableName}:`, error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error(`❌ Erro ao verificar tabela ${tableName}:`, error);
    return false;
  }
}

// Verificar se uma coluna existe em uma tabela
async function checkColumnExists(tableName, columnName) {
  try {
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', tableName)
      .eq('column_name', columnName);
    
    if (error) {
      console.error(`❌ Erro ao verificar coluna ${columnName} na tabela ${tableName}:`, error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error(`❌ Erro ao verificar coluna ${columnName} na tabela ${tableName}:`, error);
    return false;
  }
}

// Verificar se a função exec_sql existe
async function checkExecSqlFunctionExists() {
  try {
    const { data, error } = await supabase
      .from('information_schema.routines')
      .select('routine_name')
      .eq('routine_schema', 'public')
      .eq('routine_name', 'exec_sql');
    
    if (error) {
      console.error('❌ Erro ao verificar função exec_sql:', error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error('❌ Erro ao verificar função exec_sql:', error);
    return false;
  }
}

// Verificar a estrutura do banco de dados
async function checkDatabase() {
  console.log('🔍 Verificando estrutura do banco de dados...');
  
  // Verificar tabelas necessárias
  const requiredTables = ['vehicles', 'members', 'activity_logs'];
  const tableResults = {};
  
  for (const table of requiredTables) {
    tableResults[table] = await checkTableExists(table);
    console.log(`Tabela ${table}: ${tableResults[table] ? '✅ Existe' : '❌ Não existe'}`);
  }
  
  // Verificar coluna engine_size na tabela vehicles
  if (tableResults.vehicles) {
    const engineSizeExists = await checkColumnExists('vehicles', 'engine_size');
    console.log(`Coluna engine_size na tabela vehicles: ${engineSizeExists ? '✅ Existe' : '❌ Não existe'}`);
    
    if (!engineSizeExists) {
      console.log('⚠️ A coluna engine_size é necessária para o correto funcionamento do sistema.');
      console.log('Para adicionar a coluna, você pode:');
      console.log('1. Executar o script add-engine-size.ts no frontend');
      console.log('2. Ou executar o seguinte SQL no Console do Supabase:');
      console.log(`
        ALTER TABLE public.vehicles 
        ADD COLUMN IF NOT EXISTS engine_size INTEGER;
        
        UPDATE public.vehicles SET engine_size = displacement 
        WHERE engine_size IS NULL AND displacement IS NOT NULL;
      `);
    }
  }
  
  // Verificar se a função exec_sql existe
  const execSqlExists = await checkExecSqlFunctionExists();
  console.log(`Função exec_sql: ${execSqlExists ? '✅ Existe' : '❌ Não existe'}`);
  
  if (!execSqlExists) {
    console.log('⚠️ A função exec_sql é necessária para executar os scripts de correção.');
    console.log('Para criar a função, execute o seguinte SQL no Console do Supabase:');
    console.log(`
      CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
      RETURNS SETOF json
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        RETURN QUERY EXECUTE sql;
      END;
      $$;
      
      GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO anon, authenticated;
    `);
  }
  
  console.log('\n🔍 Verificação concluída!');
}

// Executar a verificação
checkDatabase()
  .catch(error => {
    console.error('❌ Erro durante a verificação:', error);
  })
  .finally(() => {
    process.exit(0);
  });
