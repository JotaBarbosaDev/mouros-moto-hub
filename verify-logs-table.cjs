/**
 * Script para verificar se a tabela activity_logs existe e está funcionando corretamente
 */
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Carregar variáveis de ambiente do frontend
const envPath = path.join(__dirname, 'frontend', '.env');
if (!fs.existsSync(envPath)) {
  console.error('\x1b[31m❌ Arquivo .env não encontrado no diretório frontend!\x1b[0m');
  process.exit(1);
}

dotenv.config({ path: envPath });

// Obter credenciais do Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('\x1b[31m❌ Credenciais do Supabase não encontradas no arquivo .env!\x1b[0m');
  console.error('Verifique se as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão definidas.');
  process.exit(1);
}

console.log('\x1b[32m✅ Credenciais do Supabase encontradas.\x1b[0m');
console.log(`URL do Supabase: ${SUPABASE_URL}`);

// Criar cliente do Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  console.log('\n\x1b[33m==========================================================\x1b[0m');
  console.log('\x1b[33m      VERIFICAÇÃO DA TABELA DE LOGS DE ATIVIDADE           \x1b[0m');
  console.log('\x1b[33m==========================================================\x1b[0m');

  // Verificar se a tabela activity_logs existe
  console.log('\n\x1b[33mVerificando se a tabela activity_logs existe...\x1b[0m');
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('id')
      .limit(1);

    if (error) {
      if (error.message.includes('relation "public.activity_logs" does not exist')) {
        console.error('\x1b[31m❌ A tabela activity_logs não existe!\x1b[0m');
        console.error('Execute o script create-logs-direct.sh para criar a tabela ou use o SQL Editor no Supabase.');
        process.exit(1);
      } else {
        console.error('\x1b[31m❌ Erro ao verificar a tabela activity_logs:\x1b[0m', error.message);
        process.exit(1);
      }
    } else {
      console.log('\x1b[32m✅ A tabela activity_logs existe.\x1b[0m');
    }

    // Inserir um log de teste
    console.log('\n\x1b[33mInserindo um log de teste...\x1b[0m');
    const testLog = {
      user_id: 'system',
      username: 'Script de Verificação CJS',
      action: 'TEST',
      entity_type: 'SYSTEM',
      details: { message: 'Teste de verificação do sistema de logs via JavaScript' }
    };

    const { data: insertedLog, error: insertError } = await supabase
      .from('activity_logs')
      .insert(testLog)
      .select()
      .single();

    if (insertError) {
      console.error('\x1b[31m❌ Falha ao inserir log de teste:\x1b[0m', insertError.message);
      process.exit(1);
    } else {
      console.log('\x1b[32m✅ Log de teste inserido com sucesso! ID: ' + insertedLog.id + '\x1b[0m');
    }

    // Verificar se conseguimos recuperar o log inserido
    console.log('\n\x1b[33mVerificando se o log pode ser recuperado...\x1b[0m');
    const { data: retrievedLog, error: retrieveError } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('id', insertedLog.id)
      .single();

    if (retrieveError) {
      console.error('\x1b[31m❌ Não foi possível recuperar o log inserido:\x1b[0m', retrieveError.message);
      process.exit(1);
    } else {
      console.log('\x1b[32m✅ Log recuperado com sucesso!\x1b[0m');
      console.log('Detalhes do log:');
      console.log(JSON.stringify(retrievedLog, null, 2));
    }

    // Buscar logs recentes
    console.log('\n\x1b[33mBuscando logs recentes...\x1b[0m');
    const { data: recentLogs, error: recentError } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentError) {
      console.error('\x1b[31m❌ Erro ao buscar logs recentes:\x1b[0m', recentError.message);
    } else {
      console.log('\x1b[32m✅ Encontrados ' + recentLogs.length + ' logs recentes.\x1b[0m');
    }

    console.log('\n\x1b[32m===========================================\x1b[0m');
    console.log('\x1b[32m    VERIFICAÇÃO CONCLUÍDA COM SUCESSO      \x1b[0m');
    console.log('\x1b[32m===========================================\x1b[0m');

  } catch (err) {
    console.error('\x1b[31m❌ Erro inesperado:\x1b[0m', err);
    process.exit(1);
  }
}

// Executar o script
main().catch(err => {
  console.error('\x1b[31mErro ao executar verificação:\x1b[0m', err);
  process.exit(1);
});
