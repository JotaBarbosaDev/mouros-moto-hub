// Teste simples de autenticação para Mouros Moto Hub
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

// Credenciais de teste - podem ser modificadas conforme necessário
const email = 'teste@exemplo.com';
const password = 'senha123';

// Cliente Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

/**
 * Função para testar a autenticação de forma simplificada
 */
async function testeDeLoginSimplificado() {
  try {
    console.log('1. Verificando sessão atual...');
    const { data: { session } } = await supabase.auth.getSession();
    
    let token;
    
    if (session?.access_token) {
      console.log('✅ Sessão ativa encontrada, usando token existente');
      token = session.access_token;
    } else {
      console.log('2. Nenhuma sessão ativa, tentando fazer login...');
      
      // Aqui você pode substituir por credenciais válidas no seu ambiente
      const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (loginError) {
        console.error('❌ Erro ao fazer login:', loginError.message);
        console.log('Este teste requer credenciais válidas. Modifique email/senha no script ou use uma sessão válida.');
        return;
      }
      
      token = authData.session.access_token;
      console.log('✅ Login bem-sucedido, token obtido');
    }
    
    // Teste da chamada ao endpoint /me
    console.log('\n3. Testando endpoint /api/auth/me com token...');
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Erro desconhecido');
        console.error(`❌ API retornou erro (${response.status}):`, errorText);
        
        if (response.status === 401) {
          console.log('\nPossíveis motivos para erro 401:');
          console.log('1. Token expirado ou inválido');
          console.log('2. Middlewares de autenticação no backend configurados incorretamente');
          console.log('3. API está rodando em um host diferente do configurado');
        }
      } else {
        const profileData = await response.json();
        console.log('✅ Perfil obtido com sucesso:');
        console.log(JSON.stringify(profileData, null, 2));
      }
    } catch (apiError) {
      console.error('❌ Erro ao chamar API:', apiError.message);
      console.log('\nVerifique se o servidor backend está rodando em', API_URL);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Executar o teste
testeDeLoginSimplificado().catch(console.error);
