// Este script testa o serviço de membros e imprime os resultados
// Deve ser executado com: node --experimental-modules teste-service.js

// Usamos a importação dinâmica para funcionar com CommonJS
(async () => {
  try {
    // Importa o serviço de membros
    const memberServiceModule = await import('./src/services/member-service-robust.js');
    const { getMembersFromDb } = memberServiceModule;
    
    console.log("Testando serviço de membros...");
    
    // Busca membros do banco de dados
    const members = await getMembersFromDb();
    
    console.log(`Recuperados ${members.length} membros do banco de dados`);
    
    // Imprime dados dos membros
    members.forEach((member, index) => {
      console.log(`\n--- Membro ${index + 1} ---`);
      console.log(`ID: ${member.id}`);
      console.log(`Nome: ${member.name}`);
      console.log(`Email: ${member.email}`);
      console.log(`Username: ${member.username}`);
      console.log(`Número de membro: ${member.memberNumber}`);
      console.log(`É administrador: ${member.isAdmin ? 'Sim' : 'Não'}`);
      console.log(`Está ativo: ${member.isActive ? 'Sim' : 'Não'}`);
    });
    
  } catch (error) {
    console.error('Erro ao executar teste:', error);
  }
})();
