// Script para adicionar a coluna engine_size à tabela vehicles
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

async function addEngineSizeColumn() {
  console.log('Verificando se a coluna engine_size existe...')

  try {
    // Verificar se a coluna já existe
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'vehicles')
      .eq('column_name', 'engine_size')

    if (columnsError) {
      console.error('Erro ao verificar colunas:', columnsError)
      throw columnsError
    }

    if (columns && columns.length > 0) {
      console.log('Coluna engine_size já existe na tabela vehicles.')
      return
    }

    console.log('Adicionando a coluna engine_size à tabela vehicles...')

    // Adicionar a coluna engine_size
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.vehicles 
        ADD COLUMN IF NOT EXISTS engine_size INTEGER;
        
        -- Atualizar valores existentes
        UPDATE public.vehicles 
        SET engine_size = displacement 
        WHERE engine_size IS NULL AND displacement IS NOT NULL;
      `
    })

    if (error) {
      if (error.message?.includes('exec_sql')) {
        console.error('Função exec_sql não encontrada. Criando função...')
        await createExecSqlFunction()
        // Tentar novamente após criar a função
        return addEngineSizeColumn()
      }
      console.error('Erro ao adicionar coluna engine_size:', error)
      throw error
    }

    console.log('✅ Coluna engine_size adicionada com sucesso!')
  } catch (error) {
    console.error('❌ Erro ao adicionar coluna engine_size:', error)
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
  // Método alternativo usando SQL direto
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
addEngineSizeColumn()
  .then(() => {
    console.log('Processo finalizado.')
  })
  .catch((error) => {
    console.error('Erro durante a adição da coluna:', error)
  })
