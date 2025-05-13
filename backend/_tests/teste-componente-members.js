// Teste do fluxo de autenticação do frontend
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

// Simula o comportamento do componente Members
async function testarComponenteMembers() {
  try {
    console.log('1. Simulando login do usuário...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) throw authError;
    
    const token = authData.session.access_token;
    console.log('Login bem-sucedido. Token obtido.');
    
    // Agora vamos simular o comportamento do componente Members
    console.log('\n2. Simulando o componente Members carregando dados...');
    
    // Primeiro, busca o perfil do usuário (simulando useAuth hook)
    console.log('2.1. Buscando perfil do usuário...');
    const profileResponse = await fetch(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!profileResponse.ok) {
      throw new Error(`Erro ao buscar perfil: ${profileResponse.status}`);
    }

    const userData = await profileResponse.json();
    console.log('Perfil do usuário obtido:', userData);
    
    // Depois, busca a lista de membros (simulando o componente Members)
    console.log('\n2.2. Buscando lista de membros...');
    const membersResponse = await fetch(`${API_URL}/members?limit=10`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!membersResponse.ok) {
      throw new Error(`Erro ao buscar membros: ${membersResponse.status}`);
    }

    const membersData = await membersResponse.json();
    console.log(`Lista de ${membersData.length} membros obtida com sucesso.`);
    
    // Testa se o usuário logado aparece na lista de membros
    const currentUserInList = membersData.some(member => member.id === userData.id);
    console.log(`O usuário logado ${currentUserInList ? 'aparece' : 'não aparece'} na lista de membros.`);
    
    return {
      success: true,
      message: 'Componente Members funcionando corretamente!'
    };
  } catch (error) {
    console.error('Erro no teste do componente Members:', error);
    return {
      success: false,
      message: `Falha no teste: ${error.message}`
    };
  }
}

// Executar o teste
testarComponenteMembers()
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
