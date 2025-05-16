import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('As variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY precisam estar definidas');
  process.exit(1);
}

// Inicializar cliente Supabase com a chave de serviço
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Verificar se a tabela já existe
async function checkTableExists() {
  console.log('Verificando se a tabela activity_logs já existe...');
  
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'activity_logs');

    if (error) {
      console.error('Erro ao verificar tabela:', error);
      return false;
    }

    const tableExists = data && data.length > 0;
    console.log(tableExists ? '✅ Tabela activity_logs já existe' : '❌ Tabela activity_logs não existe');
    return tableExists;
  } catch (error) {
    console.error('Erro ao verificar tabela:', error);
    return false;
  }
}

// Criar a tabela activity_logs
async function createLogsTable() {
  console.log('Criando tabela activity_logs...');
  
  try {
    // Ler o conteúdo do arquivo SQL
    const sqlContent = fs.readFileSync('./create-activity-logs-table.sql', 'utf8');
    
    // Executar o SQL diretamente
    const { error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      // Se for um erro específico de função não encontrada, vamos tentar criar a função primeiro
      if (error.message.includes('Could not find the function')) {
        console.log('A função exec_sql não existe. Criando a função...');
        
        // Ler o conteúdo do arquivo SQL para criar a função
        const funcSqlContent = fs.readFileSync('../frontend/create-exec-sql-function.sql', 'utf8');
        
        // Executar SQL para criar a função exec_sql
        const { error: funcError } = await supabase.rpc('exec_sql', { sql: funcSqlContent });
        
        if (funcError) {
          console.error('Erro ao criar função exec_sql:', funcError);
          
          // Tentar executar SQL diretamente
          console.log('Tentando criar tabela com SQL direto...');
          const { error: directError } = await supabase.rpc('exec_sql', { 
            sql: `CREATE TABLE IF NOT EXISTS public.activity_logs (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              user_id UUID,
              username VARCHAR(255),
              action VARCHAR(50) NOT NULL,
              entity_type VARCHAR(50) NOT NULL,
              entity_id UUID,
              details JSONB,
              ip_address VARCHAR(45),
              created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
            );` 
          });
          
          if (directError) {
            console.error('Erro ao criar tabela diretamente:', directError);
            return false;
          }
        }
      } else {
        console.error('Erro ao criar tabela activity_logs:', error);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao criar tabela:', error);
    return false;
  }
}

// Executar o processo
async function run() {
  const tableExists = await checkTableExists();
  
  if (!tableExists) {
    const created = await createLogsTable();
    if (created) {
      console.log('✅ Tabela activity_logs criada com sucesso');
      
      // Verificar novamente
      const tableNowExists = await checkTableExists();
      if (tableNowExists) {
        console.log('✅ Verificação confirma: tabela criada com sucesso');
      } else {
        console.log('❌ Verificação indica que a tabela não foi criada corretamente');
      }
    } else {
      console.log('❌ Falha ao criar tabela activity_logs');
    }
  }
}

run()
  .catch(console.error)
  .finally(() => {
    console.log('Processo concluído');
  });
