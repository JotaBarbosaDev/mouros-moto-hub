// Script para contar o número de membros usando um cabeçalho 'Authorization' com a chave de API
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

console.log('Configuração carregada:');
console.log(`URL: ${supabaseUrl}`);
console.log(`API Key (anon): ${supabaseKey ? supabaseKey.substring(0, 10) + '...' : 'Não encontrada'}`);
console.log(`Service Role Key: ${serviceRoleKey ? serviceRoleKey.substring(0, 10) + '...' : 'Não encontrada'}`);

async function countMembers() {
  console.log('\nContando membros...');
  
  try {
    // Tentativa com cabeçalho Authorization
    const response1 = await fetch(`${supabaseUrl}/rest/v1/members?select=id`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Resposta com Authorization: ${response1.status} ${response1.statusText}`);
    
    if (response1.ok) {
      const data1 = await response1.json();
      console.log(`Total de membros encontrados: ${data1.length}`);
      if (data1.length > 0) {
        console.log('Primeiro membro ID:', data1[0].id);
      }
    } else {
      const errorText1 = await response1.text();
      console.log(`Erro: ${errorText1}`);
    }
    
    // Tentativa apenas com apikey
    console.log('\nTentativa apenas com apikey:');
    const response2 = await fetch(`${supabaseUrl}/rest/v1/members?select=id`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Resposta apenas com apikey: ${response2.status} ${response2.statusText}`);
    
    if (response2.ok) {
      const data2 = await response2.json();
      console.log(`Total de membros encontrados: ${data2.length}`);
      if (data2.length > 0) {
        console.log('Primeiro membro ID:', data2[0].id);
      }
    } else {
      const errorText2 = await response2.text();
      console.log(`Erro: ${errorText2}`);
    }
    
    // Tentativa com service role key
    console.log('\nTentativa com service role key:');
    const response3 = await fetch(`${supabaseUrl}/rest/v1/members?select=id`, {
      method: 'GET',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Resposta com service role key: ${response3.status} ${response3.statusText}`);
    
    if (response3.ok) {
      const data3 = await response3.json();
      console.log(`Total de membros encontrados: ${data3.length}`);
      if (data3.length > 0) {
        console.log('Primeiro membro ID:', data3[0].id);
      }
    } else {
      const errorText3 = await response3.text();
      console.log(`Erro: ${errorText3}`);
    }
    
  } catch (error) {
    console.error('Erro na solicitação:', error.message);
  }
}

countMembers();
