// Script para testar a conexão com a API do Supabase
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

console.log('Configuração carregada:');
console.log(`URL: ${supabaseUrl}`);
console.log(`API Key: ${supabaseKey ? supabaseKey.substring(0, 10) + '...' : 'Não encontrada'}`);

async function testMembersApi() {
  console.log('\nTestando API de membros...');
  
  try {
    console.log('Fazendo requisição para /rest/v1/members...');
    
    const response = await fetch(`${supabaseUrl}/rest/v1/members?select=*`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error(`Erro na requisição: ${response.status} ${response.statusText}`);
      console.error(`Detalhes: ${error}`);
      return;
    }
    
    const data = await response.json();
    console.log('Resposta recebida com sucesso!');
    console.log(`Total de registros: ${data.length}`);
    if (data.length > 0) {
      const member = data[0];
      console.log('Primeiro membro:');
      console.log(`  ID: ${member.id}`);
      console.log(`  Nome: ${member.name || 'N/A'}`);
      console.log(`  Email: ${member.email || 'N/A'}`);
    }
    
  } catch (error) {
    console.error('Erro ao testar API:', error.message);
  }
}

testMembersApi();
