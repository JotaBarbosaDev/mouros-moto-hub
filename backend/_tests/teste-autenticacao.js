// Teste de autenticação no backend
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
dotenv.config();

// Para capturar erros não tratados
process.on('uncaughtException', (error) => {
  console.error('Erro não tratado:', error);
});

// Configuração da URL da API
const API_URL = 'http://localhost:3001/api';
console.log('Testando API em:', API_URL);

// Credenciais de teste
const email = 'admin@admin.com';
const password = 'admin';

// Cliente Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function testarAutenticacao() {
  try {
    console.log('1. Fazendo login via Supabase...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) throw authError;
    
    const token = authData.session.access_token;
    console.log('Login bem-sucedido. Token obtido.');
    
    // Verificar detalhes da sessão
    console.log('Dados da sessão:');
    console.log('- ID do usuário:', authData.user.id);
    console.log('- Email do usuário:', authData.user.email);
    console.log('- Expiração do token:', new Date(authData.session.expires_at * 1000).toLocaleString());

    // Testar endpoint /auth/me com o token obtido
    console.log('\n2. Testando endpoint /api/auth/me...');
    const profileResponse = await fetch(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.error(`Erro ${profileResponse.status}: ${errorText}`);
      throw new Error(`Erro ao buscar perfil: ${profileResponse.status}`);
    }

    const profileData = await profileResponse.json();
    console.log('Dados do perfil obtidos com sucesso:');
    console.log(JSON.stringify(profileData, null, 2));
    
    return {
      success: true,
      message: 'Autenticação e obtenção do perfil funcionando corretamente!'
    };
  } catch (error) {
    console.error('Erro no teste de autenticação:', error);
    return {
      success: false,
      message: `Falha no teste: ${error.message}`
    };
  }
}

// Executar o teste
testarAutenticacao()
  .then(result => {
    console.log('\nResultado do teste:', result.message);
    if (!result.success) {
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Erro fatal:', err);
    process.exit(1);
  });
