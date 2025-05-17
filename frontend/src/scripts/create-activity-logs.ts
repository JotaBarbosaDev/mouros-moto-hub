// Script para criar a tabela activity_logs
import { createClient } from '@supabase/supabase-js'

// Obter credenciais do Supabase das variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('⚠️ Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são necessárias')
  throw new Error('Credenciais do Supabase não configuradas')
}

// Criar cliente do Supabase
const supabase = createClient(supabaseUrl, supabaseKey)

async function createActivityLogsTable() {
  console.log('Criando tabela activity_logs...')

  try {
    // Verificar se a tabela já existe
    const { data: existingTables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'activity_logs')

    if (tablesError) {
      console.error('Erro ao verificar tabelas:', tablesError)
      throw tablesError
    }

    if (existingTables && existingTables.length > 0) {
      console.log('Tabela activity_logs já existe.')
      return
    }

    // Criar a tabela activity_logs
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
        
        -- Garantir que RLS esteja ativado
        ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
        
        -- Conceder permissões para os perfis do Supabase
        GRANT SELECT, INSERT ON public.activity_logs TO authenticated;
        GRANT SELECT ON public.activity_logs TO anon;
        
        -- Políticas de segurança para a tabela de logs:
        -- Qualquer usuário autenticado pode inserir logs
        CREATE POLICY insert_logs_policy ON public.activity_logs 
          FOR INSERT TO authenticated WITH CHECK (true);
        
        -- Somente administradores podem ver todos os logs
        CREATE POLICY select_logs_policy ON public.activity_logs 
          FOR SELECT TO authenticated USING (
            auth.uid() IN (
              SELECT id FROM public.members WHERE is_admin = true
            )
          );
      `
    })

    if (error) {
      if (error.message?.includes('exec_sql')) {
        console.error('Função exec_sql não encontrada. Criando função...')
        await createExecSqlFunction()
        // Tentar novamente após criar a função
        return createActivityLogsTable()
      }
      console.error('Erro ao criar tabela activity_logs:', error)
      throw error
    }

    console.log('✅ Tabela activity_logs criada com sucesso!')
  } catch (error) {
    console.error('❌ Erro ao criar tabela activity_logs:', error)
    throw error
  }
}

async function createExecSqlFunction() {
  console.log('Criando função exec_sql...')

  try {
    // SQL para criar a função exec_sql
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
        RETURNS SETOF json
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          RETURN QUERY EXECUTE sql;
        END;
        $$;
        
        -- Configurar permissões
        GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO anon, authenticated;
      `
    })

    if (error) {
      // Se a função não existe ainda, usaremos outro método
      console.warn('Não foi possível criar a função exec_sql com a API RPC. Tentando método alternativo...')
      await createExecSqlFunctionAlternative()
    } else {
      console.log('✅ Função exec_sql criada com sucesso!')
    }
  } catch (error) {
    console.error('Erro ao criar função exec_sql:', error)
    await createExecSqlFunctionAlternative()
  }
}

async function createExecSqlFunctionAlternative() {
  // Método alternativo usando SQL direto - você precisará executar este SQL
  // manualmente no Console SQL do Supabase
  console.log(`
  ⚠️ ATENÇÃO: Você precisa executar o SQL abaixo no Console SQL do Supabase:
  
  CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
  RETURNS SETOF json
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $$
  BEGIN
    RETURN QUERY EXECUTE sql;
  END;
  $$;
  
  -- Configurar permissões
  GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO anon, authenticated;
  `)
}

// Executar o script
createActivityLogsTable()
  .then(() => {
    console.log('Processo finalizado.')
  })
  .catch((error) => {
    console.error('Erro durante a criação da tabela:', error)
  })
