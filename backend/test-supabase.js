// Teste de conexão com o Supabase
const dotenv = require('dotenv');
dotenv.config();
const { createClient } = require('@supabase/supabase-js');

console.log('URL do Supabase:', process.env.SUPABASE_URL);
console.log('Chave anônima do Supabase:', process.env.SUPABASE_KEY ? 'Configurada' : 'Não configurada');
console.log('Chave de serviço do Supabase:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Configurada' : 'Não configurada');

// Função para testar conexão
const testConnection = async (keyType, key) => {
  console.log(`\nTestando conexão com chave ${keyType}...`);
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      key,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    // Testar autenticação
    console.log('Tentando autenticar...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'teste@exemplo.com',
      password: 'senhateste'
    });
    
    if (error) {
      console.error(`Erro na autenticação com chave ${keyType}:`, error);
    } else {
      console.log(`Autenticação bem-sucedida com chave ${keyType}:`, data);
    }
    
    return !error;
  } catch (err) {
    console.error(`Erro ao testar conexão com chave ${keyType}:`, err);
    return false;
  }
};

// Executar os testes
const runTests = async () => {
  console.log('=== TESTANDO CONEXÃO COM SUPABASE ===');
  
  if (process.env.SUPABASE_KEY) {
    await testConnection('anônima', process.env.SUPABASE_KEY);
  }
  
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    await testConnection('de serviço', process.env.SUPABASE_SERVICE_ROLE_KEY);
  }
  
  console.log('\n=== FIM DOS TESTES ===');
};

runTests();
