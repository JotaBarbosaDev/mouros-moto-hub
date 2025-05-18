// Teste de conexão com o Supabase
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Configurar path para o arquivo .env do backend
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, 'backend', '.env');

console.log(`Carregando variáveis de ambiente de: ${envPath}`);
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.error(`Arquivo .env não encontrado em: ${envPath}`);
}

console.log('Iniciando teste de conexão com o Supabase...');

// Verificar variáveis de ambiente
console.log('Verificando variáveis de ambiente:');
console.log(`SUPABASE_URL: ${process.env.SUPABASE_URL ? '✅ Definida' : '❌ Não definida'}`);
console.log(`SUPABASE_KEY: ${process.env.SUPABASE_KEY ? '✅ Definida' : '❌ Não definida'}`);
console.log(`SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Definida' : '❌ Não definida'}`);

// Criar cliente com chave anônima
const supabaseAnon = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Tentar login com credenciais de teste
async function testLogin() {
  console.log('\n--- Tentando login com credenciais de teste usando chave anônima ---');
  try {
    const { data, error } = await supabaseAnon.auth.signInWithPassword({
      email: 'admin@admin.com',
      password: 'admin'
    });

    if (error) {
      console.log('❌ Erro ao fazer login:', error.message);
    } else {
      console.log('✅ Login bem-sucedido!');
      console.log('Dados do usuário:', data.user);
    }
  } catch (err) {
    console.log('❌ Exceção ao tentar login:', err.message);
  }
}

// Testar acesso à tabela members com chave anônima
async function testMembersTableWithAnonKey() {
  console.log('\n--- Tentando acessar tabela members com chave anônima ---');
  try {
    const { data, error } = await supabaseAnon
      .from('members')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Erro ao acessar tabela:', error.message);
    } else {
      console.log('✅ Acesso bem-sucedido!');
      console.log('Dados:', data);
    }
  } catch (err) {
    console.log('❌ Exceção ao acessar tabela:', err.message);
  }
}

// Executar testes
async function runTests() {
  await testLogin();
  await testMembersTableWithAnonKey();
  
  console.log('\nTestes concluídos!');
}

runTests();
