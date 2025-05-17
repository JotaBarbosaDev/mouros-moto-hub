// Script para criar tabela de logs e adicionar coluna engine_size
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// Criar cliente Supabase usando variáveis de ambiente do frontend
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Credenciais do Supabase não definidas!');
  console.error('Defina VITE_SUPABASE_URL e VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

// Função para verificar se a coluna existe
const checkColumnExists = async (table, column) => {
  const { data, error } = await supabase.rpc('exec_sql', { 
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

// Função para verificar se a tabela existe
const checkTableExists = async (table) => {
  const { data, error } = await supabase.rpc('exec_sql', { 
    sql: `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '${table}'
      ) as exists;
    `
  });
  
  if (error) {
    console.error(`Erro ao verificar tabela ${table}:`, error);
    return false;
  }
  
  return data && data.length > 0 && data[0].exists;
};

// Adicionar coluna engine_size à tabela vehicles
const addEngineSize = async () => {
  try {
    console.log('Verificando se a coluna engine_size existe...');
    
    // Verificar se a coluna existe
    const columnExists = await checkColumnExists('vehicles', 'engine_size');
    
    // Se não existir, adicionar
    if (!columnExists) {
      console.log('Coluna engine_size não existe, adicionando...');
      
      const { error } = await supabase.rpc('exec_sql', {
        sql: `
          ALTER TABLE public.vehicles 
          ADD COLUMN IF NOT EXISTS engine_size INTEGER;
          
          UPDATE public.vehicles SET engine_size = displacement 
          WHERE engine_size IS NULL AND displacement IS NOT NULL;
        `
      });
      
      if (error) {
        console.error('❌ Erro ao adicionar coluna engine_size:', error);
        return false;
      }
      
      console.log('✅ Coluna engine_size adicionada com sucesso!');
    } else {
      console.log('✅ Coluna engine_size já existe na tabela vehicles');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao adicionar coluna engine_size:', error);
    return false;
  }
};

// Criar tabela activity_logs se não existir
const createActivityLogsTable = async () => {
  try {
    console.log('Verificando se a tabela activity_logs existe...');
    
    // Verificar se a tabela existe
    const tableExists = await checkTableExists('activity_logs');
    
    // Se não existir, criar
    if (!tableExists) {
      console.log('Tabela activity_logs não existe, criando...');
      
      const { error } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.activity_logs (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID,
            username VARCHAR(255),
            action VARCHAR(50) NOT NULL,
            entity_type VARCHAR(50) NOT NULL,
            entity_id UUID,
            details JSONB,
            ip_address VARCHAR(45),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
          );
          
          -- Conceder permissões para os perfis do Supabase
          GRANT SELECT, INSERT ON public.activity_logs TO authenticated;
          GRANT SELECT ON public.activity_logs TO anon;
          
          -- Políticas de segurança para a tabela de logs:
          -- Qualquer usuário autenticado pode inserir logs
          CREATE POLICY insert_logs_policy ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (true);
          
          -- Somente administradores podem ver todos os logs
          CREATE POLICY select_logs_policy ON public.activity_logs FOR SELECT TO authenticated USING (
              auth.uid() IN (
                  SELECT id FROM public.members WHERE is_admin = true
              )
          );
          
          -- Ativar RLS
          ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
        `
      });
      
      if (error) {
        console.error('❌ Erro ao criar tabela activity_logs:', error);
        return false;
      }
      
      console.log('✅ Tabela activity_logs criada com sucesso!');
    } else {
      console.log('✅ Tabela activity_logs já existe');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao criar tabela activity_logs:', error);
    return false;
  }
};

// Executar ambas as funções
const fixTables = async () => {
  console.log('🔧 Iniciando correções nas tabelas...');
  
  // Passo 1: Verificar se a função exec_sql existe
  try {
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: 'SELECT 1 as test;' 
    });
    
    if (error) {
      console.error('❌ Erro ao executar função exec_sql:', error);
      console.error('Por favor, crie a função exec_sql no Supabase primeiro.');
      return;
    }
    
    console.log('✅ Função exec_sql disponível no Supabase.');
  } catch (error) {
    console.error('❌ Erro ao testar função exec_sql:', error);
    return;
  }
  
  // Passo 2: Adicionar coluna engine_size
  const engineSizeAdded = await addEngineSize();
  
  // Passo 3: Criar tabela activity_logs
  const activityLogsCreated = await createActivityLogsTable();
  
  if (engineSizeAdded && activityLogsCreated) {
    console.log('🎉 Todas as correções foram aplicadas com sucesso!');
  } else {
    console.warn('⚠️ Algumas correções não foram aplicadas. Verifique os logs acima.');
  }
  
  process.exit(0);
};

// Executar
fixTables().catch(error => {
  console.error('❌ Erro inesperado:', error);
  process.exit(1);
});
