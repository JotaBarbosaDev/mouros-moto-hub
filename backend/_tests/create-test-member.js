// Script para criar um membro de teste no Supabase
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

console.log('Configuração carregada:');
console.log(`URL: ${supabaseUrl}`);
console.log(`API Key: ${supabaseKey ? supabaseKey.substring(0, 10) + '...' : 'Não encontrada'}`);

// Dados de um membro de teste
const testMember = {
  member_number: "TEST001",
  name: "Membro Teste",
  nickname: "Tester",
  email: "teste@osmouros.pt",
  phone_main: "351912345678",
  member_type: "Sócio Adulto",
  join_date: new Date().toISOString().split('T')[0], // Data atual em formato YYYY-MM-DD
  is_active: true,
  is_admin: false,
  legacy_member: false,
  honorary_member: false,
  registration_fee_paid: true,
  registration_fee_exempt: false,
  in_whatsapp_group: true,
  received_member_kit: true
};

async function createTestMember() {
  console.log('\nCriando membro de teste...');
  
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/members`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(testMember)
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error(`Erro na requisição: ${response.status} ${response.statusText}`);
      console.error(`Detalhes: ${error}`);
      return;
    }
    
    const data = await response.json();
    console.log('Membro de teste criado com sucesso!');
    console.log('Detalhes do membro:');
    console.log(JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Erro ao criar membro de teste:', error.message);
  }
}

createTestMember();
