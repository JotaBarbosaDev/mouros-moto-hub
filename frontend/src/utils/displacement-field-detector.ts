// Módulo criado para testar qual campo de cilindrada funciona na tabela vehicles
import { fetchWithAuth, getApiBaseUrl } from '@/utils/api';

// Armazenar em cache o resultado para evitar múltiplos testes
let cachedField: string | null = null;

/**
 * Testa os diferentes nomes de campo possíveis para cilindrada
 * e retorna o que foi bem-sucedido
 */
export async function testDisplacementField(): Promise<string | null> {
  // Se já temos um resultado em cache, retornar imediatamente
  if (cachedField !== null) {
    console.log('Usando campo de cilindrada em cache:', cachedField);
    return cachedField;
  }
  
  // Agora apenas displacement é o campo válido
  const testFields = [
    'displacement'
  ];

  // Criar um veículo de teste com todas as variantes possíveis
  const testVehicle = {
    brand: 'TEST',
    model: 'TEST',
    type: 'Mota',
    member_id: 'test',
    // Incluir todos os campos possíveis
    displacement: 100,
    engine_size: 100,
    engineSize: 100,
    engine_displacement: 100,
    cylinderCapacity: 100
  };

  try {
    console.log('Realizando teste de campo de cilindrada...');
    
    // Tentar criar um veículo com todos os campos de uma vez
    // Isto vai falhar, mas nos dará informação sobre qual erro estamos tendo
    const apiUrl = `${getApiBaseUrl()}/vehicles`;
    const response = await fetchWithAuth(apiUrl, {
      method: 'POST',
      body: JSON.stringify(testVehicle)
    });
    
    let errorData: Record<string, unknown> = {};
    try {
      errorData = await response.json();
    } catch (e) {
      console.warn('Não foi possível processar resposta JSON para teste de campos');
    }
    
    // Analisar o erro para determinar qual campo é problemático
    if (errorData?.details) {
      const errorDetails = errorData.details.toString();
      
      // Procurar pelos campos que causaram erro
      const problematicFields = testFields.filter(field => 
        errorDetails.includes(field)
      );
      
      // Se algum campo causou erro, significa que os outros são válidos
      if (problematicFields.length > 0) {
        const validFields = testFields.filter(field => 
          !problematicFields.includes(field)
        );
        
        if (validFields.length > 0) {
          console.log('Campos válidos encontrados:', validFields);
          return validFields[0]; // Retornar o primeiro campo válido
        }
      }
    }
    
    // Se o teste não for conclusivo, retornar 'displacement' como padrão seguro
    return 'displacement';
  } catch (error) {
    console.error('Erro durante teste de campo de cilindrada:', error);
    return null;
  }
}

/**
 * Retorna o nome do campo de cilindrada que funciona no backend atual
 * Agora sempre retorna 'displacement' já que o backend foi corrigido
 */
export async function getWorkingDisplacementField(): Promise<string> {
  // Agora sempre retorna 'displacement' após a correção do backend
  cachedField = 'displacement';
  console.log('Usando campo de cilindrada padrão:', cachedField);
  
  return 'displacement';
}
