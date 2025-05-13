// Configuração da conexão com o Supabase
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

// Verificar se as variáveis de ambiente necessárias estão disponíveis
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Variável de ambiente ${envVar} não configurada. Verifique o arquivo .env`);
  }
}

// Criar cliente Supabase com chave de serviço (acesso administrativo)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Criar cliente Supabase com chave anônima (acesso público)
const supabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Preferência por usar o cliente com permissões administrativas
const supabase = supabaseAdmin;

// Testar conexão
const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabaseAdmin
      .from('members')
      .select('count')
      .limit(1);
      
    if (error) {
      throw error;
    }
    
    console.log('Conexão com Supabase estabelecida com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao conectar com Supabase:', error);
    return false;
  }
};

// Exportações
module.exports = {
  supabase,
  supabaseAdmin,
  supabaseClient,
  testSupabaseConnection
};
