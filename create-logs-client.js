/**
 * Script para criar a tabela activity_logs no Supabase usando o cliente JavaScript
 * 
 * Uso: node create-logs-client.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

// Carregar credenciais do Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('\x1b[31m%s\x1b[0m', 'Erro: Credenciais do Supabase não encontradas!');
  console.error('\x1b[33m%s\x1b[0m', 'Verifique se as variáveis SUPABASE_URL e SUPABASE_SERVICE_KEY existem no arquivo .env do backend.');
  process.exit(1);
}

console.log('\x1b[33m%s\x1b[0m', '=========================================================');
console.log('\x1b[33m%s\x1b[0m', '      CRIANDO TABELA DE LOGS DE ATIVIDADE NO SUPABASE     ');
console.log('\x1b[33m%s\x1b[0m', '=========================================================');

// Inicializar cliente Supabase com a chave de serviço (admin)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createActivityLogsTable() {
  try {
    // Verificar se a tabela já existe
    console.log('\x1b[33m%s\x1b[0m', 'Verificando se a tabela activity_logs já existe...');
    
    const { data: existingTable, error: checkError } = await supabase
      .from('activity_logs')
      .select('id')
      .limit(1);
    
    if (!checkError) {
      console.log('\x1b[33m%s\x1b[0m', 'A tabela activity_logs já existe.');
      const answer = await promptUser('Deseja recriar a tabela? (s/n): ');
      
      if (answer.toLowerCase() !== 's') {
        console.log('\x1b[32m%s\x1b[0m', 'Operação cancelada pelo usuário.');
        process.exit(0);
      }
      
      console.log('\x1b[33m%s\x1b[0m', 'Removendo tabela existente...');
      
      const { error: dropError } = await supabase.rpc('exec_sql', { 
        sql: 'DROP TABLE IF EXISTS public.activity_logs CASCADE' 
      });
      
      if (dropError) {
        console.error('\x1b[31m%s\x1b[0m', 'Erro ao remover tabela existente:', dropError);
        console.log('\x1b[33m%s\x1b[0m', 'Tentando criar a tabela mesmo assim...');
      } else {
        console.log('\x1b[32m%s\x1b[0m', '✅ Tabela antiga removida com sucesso.');
      }
    }
    
    // Lista de queries SQL para criar a tabela e configurações
    const queries = [
      // Criar tabela
      `CREATE TABLE IF NOT EXISTS public.activity_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id TEXT,
        username TEXT,
        action VARCHAR(50) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id TEXT,
        details JSONB,
        ip_address VARCHAR(45),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      )`,
      
      // Comentários
      "COMMENT ON TABLE public.activity_logs IS 'Registros de todas as atividades realizadas pelos usuários no sistema'",
      "COMMENT ON COLUMN public.activity_logs.user_id IS 'ID do usuário que realizou a ação'",
      "COMMENT ON COLUMN public.activity_logs.username IS 'Nome do usuário que realizou a ação'",
      "COMMENT ON COLUMN public.activity_logs.action IS 'Ação realizada (CREATE, UPDATE, DELETE, VIEW)'",
      "COMMENT ON COLUMN public.activity_logs.entity_type IS 'Tipo de entidade afetada (MEMBER, VEHICLE, EVENT)'",
      "COMMENT ON COLUMN public.activity_logs.entity_id IS 'ID da entidade afetada'",
      "COMMENT ON COLUMN public.activity_logs.details IS 'Detalhes da ação em formato JSON'",
      "COMMENT ON COLUMN public.activity_logs.ip_address IS 'Endereço IP de onde a ação foi realizada'",
      
      // RLS
      "ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY",
      
      // Permissões
      "GRANT ALL ON public.activity_logs TO postgres",
      "GRANT SELECT, INSERT ON public.activity_logs TO authenticated",
      "GRANT SELECT, INSERT ON public.activity_logs TO anon",
      
      // Políticas
      "CREATE POLICY insert_logs_policy ON public.activity_logs FOR INSERT TO authenticated, anon WITH CHECK (true)",
      "CREATE POLICY insert_anon_logs_policy ON public.activity_logs FOR INSERT TO anon WITH CHECK (true)",
      "CREATE POLICY select_logs_policy ON public.activity_logs FOR SELECT TO authenticated, anon USING (true)",
      
      // Índices
      "CREATE INDEX IF NOT EXISTS activity_logs_user_id_idx ON public.activity_logs(user_id)",
      "CREATE INDEX IF NOT EXISTS activity_logs_entity_type_idx ON public.activity_logs(entity_type)",
      "CREATE INDEX IF NOT EXISTS activity_logs_entity_id_idx ON public.activity_logs(entity_id)",
      "CREATE INDEX IF NOT EXISTS activity_logs_action_idx ON public.activity_logs(action)",
      "CREATE INDEX IF NOT EXISTS activity_logs_created_at_idx ON public.activity_logs(created_at)"
    ];
    
    // Executar todas as queries em sequência
    console.log('\x1b[33m%s\x1b[0m', 'Criando tabela activity_logs e configurações...');
    
    for (const sql of queries) {
      // Se você estiver usando um método RPC para executar SQL, use:
      // const { error } = await supabase.rpc('exec_sql', { sql });
      
      // Como temos que fazer pelo PostgreSQL diretamente:
      const { data, error } = await supabase.rpc('exec_sql', { sql });
      
      if (error) {
        console.error('\x1b[31m%s\x1b[0m', `Erro ao executar SQL: ${sql.substring(0, 40)}...`);
        console.error('\x1b[31m%s\x1b[0m', error);
      }
    }
    
    // Verificar se a tabela foi criada
    const { data, error } = await supabase
      .from('activity_logs')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('\x1b[31m%s\x1b[0m', 'Erro ao verificar tabela: ', error);
      process.exit(1);
    }
    
    console.log('\x1b[32m%s\x1b[0m', '✅ Tabela activity_logs criada com sucesso!');
    
    // Inserir um log de teste
    console.log('\x1b[33m%s\x1b[0m', 'Inserindo log de teste...');
    
    const { data: insertData, error: insertError } = await supabase
      .from('activity_logs')
      .insert({
        user_id: 'system',
        username: 'Sistema',
        action: 'CREATE',
        entity_type: 'SYSTEM',
        details: { message: 'Tabela de logs criada com sucesso' }
      })
      .select();
    
    if (insertError) {
      console.error('\x1b[31m%s\x1b[0m', 'Erro ao inserir log de teste:', insertError);
    } else {
      console.log('\x1b[32m%s\x1b[0m', '✅ Log de teste inserido com sucesso!');
    }
    
    console.log('\x1b[32m%s\x1b[0m', '=====================================');
    console.log('\x1b[32m%s\x1b[0m', '    CONFIGURAÇÃO CONCLUÍDA COM SUCESSO    ');
    console.log('\x1b[32m%s\x1b[0m', '=====================================');
    
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', 'Erro ao criar tabela activity_logs:', error);
    process.exit(1);
  }
}

// Função para perguntar ao usuário
function promptUser(question) {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise(resolve => {
    readline.question(question, answer => {
      readline.close();
      resolve(answer);
    });
  });
}

// Executar o script
createActivityLogsTable();
