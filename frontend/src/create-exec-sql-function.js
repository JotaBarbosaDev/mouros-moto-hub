/**
 * Script para criar a função exec_sql no Supabase.
 * Esta função é necessária para que os scripts de inicialização funcionem corretamente.
 * 
 * Para executar: node create-exec-sql-function.js
 * 
 * Nota: Este arquivo usa ES Modules. Para executar com Node.js diretamente,
 * adicione "type": "module" no package.json ou use a extensão .mjs
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Credenciais do Supabase não definidas! Verifique o arquivo .env.local');
  process.exit(1);
}

// Cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function createExecSqlFunction() {
  try {
    console.log('Criando a função exec_sql no Supabase...');
    
    // Criar a função exec_sql usando SQL bruto
    const createFunctionSQL = `
    CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
    RETURNS SETOF json
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      RETURN QUERY EXECUTE sql;
    END;
    $$;

    -- Configurar permissões (conceder acesso a anon e autenticado)
    GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO anon, authenticated;
    `;
    
    // Tentar usar métodos diferentes para executar o SQL
    let error = null;
    
    try {
      // Primeiro, tentar usar o método SQL direto se disponível
      const { error: sqlError } = await supabase.rest.sql(createFunctionSQL);
      if (!sqlError) {
        console.log('Função criada com sucesso usando supabase.rest.sql!');
        return;
      } else {
        console.error('Erro ao usar supabase.rest.sql:', sqlError);
        error = sqlError;
      }
    } catch (err) {
      console.error('Método supabase.rest.sql não disponível:', err);
    }
    
    if (error) {
      console.log('Falha ao usar pgaudit.exec_sql, tentando alternativa...');
      
      // Método alternativo: tentar usar POST direta para /rest/v1/rpc/sql
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({ query: createFunctionSQL })
      });
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status} - ${await response.text()}`);
      }
      
      console.log('Função exec_sql criada com sucesso usando API REST!');
    } else {
      console.log('Função exec_sql criada com sucesso!');
    }
    
    console.log('Agora você pode executar o script init-tables.sh ou recarregar a aplicação.');
    
  } catch (error) {
    console.error('Erro ao criar função exec_sql:', error);
    console.log('\nVocê precisará criar a função manualmente no painel do Supabase:');
    console.log('1. Vá para o painel do Supabase > SQL Editor');
    console.log('2. Crie uma nova consulta e cole o seguinte SQL:');
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

    -- Configurar permissões
    GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO anon, authenticated;
    `);
    console.log('3. Execute a consulta');
    console.log('4. Tente novamente recarregar a aplicação ou executar init-tables.sh');
  }
}

createExecSqlFunction();
