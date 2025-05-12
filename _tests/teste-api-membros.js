// Script para testar a API de membros usando fetch
// Não requer dependências externas

const baseUrl = 'http://localhost:3000';

// Função para obter todos os membros
const getAllMembers = async () => {
  try {
    const response = await fetch(`${baseUrl}/api/members`);
    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao obter membros:', error);
    return null;
  }
};

// Função para obter um membro específico
const getMemberById = async (id) => {
  try {
    const response = await fetch(`${baseUrl}/api/members/${id}`);
    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Erro ao obter membro com ID ${id}:`, error);
    return null;
  }
};

// Executar o teste
async function runTest() {
  console.log('1. Obtendo todos os membros...');
  const members = await getAllMembers();
  
  if (members && members.length > 0) {
    console.log(`Encontrados ${members.length} membros.`);
    
    // Mostrar campos de cada membro para verificar se username está presente
    members.forEach((member, index) => {
      console.log(`\n--- Membro ${index + 1} ---`);
      console.log(`Nome: ${member.name}`);
      console.log(`Username: ${member.username || 'não definido'}`);
      console.log(`Email: ${member.email}`);
      console.log(`Todos os campos disponíveis: ${Object.keys(member).join(', ')}`);
    });
    
    // Testar obtenção de um membro específico
    console.log('\n2. Obtendo detalhes do primeiro membro...');
    const firstMemberId = members[0].id;
    const memberDetail = await getMemberById(firstMemberId);
    
    if (memberDetail) {
      console.log('Detalhes do membro:');
      console.log(`ID: ${memberDetail.id}`);
      console.log(`Nome: ${memberDetail.name}`);
      console.log(`Username: ${memberDetail.username || 'não definido'}`);
    }
  } else {
    console.log('Nenhum membro encontrado ou erro na consulta.');
  }
}

// Iniciar o teste
runTest();
