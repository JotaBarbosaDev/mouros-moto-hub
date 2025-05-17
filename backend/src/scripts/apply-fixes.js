// Corrigir tabelas usando o backend existente
console.log('Aplicando correções às tabelas...');

// Importar o controller de veículos que contém a função para adicionar a coluna engine_size
const { addEngineSize } = require('../utils/vehicle-patch');

// Função principal
async function main() {
  try {
    console.log('Verificando e corrigindo a coluna engine_size...');
    await addEngineSize();
    console.log('Operação concluída com sucesso!');
    
    // Encerrar o processo
    process.exit(0);
  } catch (error) {
    console.error('Erro ao aplicar correções:', error);
    process.exit(1);
  }
}

// Executar
main();
