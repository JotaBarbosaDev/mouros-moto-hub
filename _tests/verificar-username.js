// Teste para verificar o funcionamento da API de membros após reorganização dos arquivos
// Este script verifica se o campo username está sendo retornado corretamente

// Configuração
const baseUrl = 'http://localhost:3000';

// Função para obter todos os membros
async function getAllMembers() {
  try {
    console.log('Obtendo lista de membros...');
    const response = await fetch(`${baseUrl}/api/members`);
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Obtidos ${data.length} membros com sucesso.`);
    return data;
  } catch (error) {
    console.error('Erro ao obter membros:', error);
    return [];
  }
}

// Função para testar se o campo username está presente
function testarCampoUsername(membros) {
  console.log('\nVerificando campo username:');
  
  let comUsername = 0;
  let semUsername = 0;
  
  membros.forEach(membro => {
    if (membro.username) {
      comUsername++;
      console.log(`- ID: ${membro.id}, Nome: ${membro.name}, Username: ${membro.username}`);
    } else {
      semUsername++;
      console.log(`- ID: ${membro.id}, Nome: ${membro.name}, Username: AUSENTE`);
    }
  });
  
  console.log(`\nResumo: ${comUsername} membros com username, ${semUsername} membros sem username.`);
}

// Função principal de teste
async function executarTeste() {
  console.log('=== TESTE DE API DE MEMBROS ===');
  console.log('Verificando se o campo username está sendo retornado corretamente\n');
  
  // Obter todos os membros
  const membros = await getAllMembers();
  
  if (membros.length === 0) {
    console.log('Não foi possível obter membros para teste.');
    return;
  }
  
  // Verificar username
  testarCampoUsername(membros);
}

// Executar o teste
executarTeste().catch(error => {
  console.error('Erro durante a execução do teste:', error);
});
