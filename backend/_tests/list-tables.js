// Script para listar as tabelas disponíveis no Supabase
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Configuração carregada:');
console.log(`URL: ${supabaseUrl}`);
console.log(`API Key: ${supabaseKey ? supabaseKey.substring(0, 10) + '...' : 'Não encontrada'}`);

async function listTables() {
  console.log('\nListando tabelas disponíveis...');
  
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
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
    console.log('Tabelas disponíveis:');
    console.log(JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Erro ao listar tabelas:', error.message);
  }
}

listTables();
