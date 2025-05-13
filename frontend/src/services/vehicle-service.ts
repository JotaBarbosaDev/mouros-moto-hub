import { fetchWithAuth, getApiBaseUrl } from '@/utils/api';
import { Vehicle, VehicleType } from '@/types/member';

// Interface para a resposta da API
interface VehicleResponse {
  id: string;
  brand: string;
  model: string;
  type: string;
  displacement: number;
  nickname: string | null;
  photoUrl: string | null;
  memberId: string;
  owner?: {
    id: string;
    name: string;
    memberNumber: string;
  };
}

// Interface para veículos com informações do proprietário
export interface VehicleWithOwner extends Vehicle {
  owner: string;
  memberNumber: string;
}

/**
 * Serviço para gerenciamento de veículos
 */
export const vehicleService = {
  /**
   * Busca todos os veículos
   */
  getAll: async (): Promise<VehicleWithOwner[]> => {
    const apiUrl = `${getApiBaseUrl()}/vehicles`;
    const response = await fetchWithAuth(apiUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data: VehicleResponse[] = await response.json();
    
    // Transforma os dados para o formato esperado pelo componente
    return data.map(item => ({
      id: item.id,
      brand: item.brand,
      model: item.model,
      type: item.type as VehicleType,
      displacement: item.displacement,
      nickname: item.nickname || undefined,
      photoUrl: item.photoUrl || undefined,
      owner: item.owner ? item.owner.name || 'Desconhecido' : 'Desconhecido',
      memberNumber: item.owner ? item.owner.memberNumber || '-' : '-'
    }));
  },
  
  /**
   * Busca um veículo pelo ID
   */
  getById: async (id: string): Promise<VehicleWithOwner> => {
    const apiUrl = `${getApiBaseUrl()}/vehicles/${id}`;
    const response = await fetchWithAuth(apiUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const item: VehicleResponse = await response.json();
    
    return {
      id: item.id,
      brand: item.brand,
      model: item.model,
      type: item.type as VehicleType,
      displacement: item.displacement,
      nickname: item.nickname || undefined,
      photoUrl: item.photoUrl || undefined,
      owner: item.owner ? item.owner.name || 'Desconhecido' : 'Desconhecido',
      memberNumber: item.owner ? item.owner.memberNumber || '-' : '-'
    };
  },
  
  /**
   * Cria um novo veículo
   */
  create: async (vehicleData: Omit<Vehicle, 'id'> & { memberId?: string }): Promise<Vehicle> => {
    const { memberId, ...vehicle } = vehicleData;
    
    // Formatar os dados no formato esperado pelo backend
    const payload = {
      brand: vehicle.brand,
      model: vehicle.model,
      type: vehicle.type,
      displacement: vehicle.displacement,
      nickname: vehicle.nickname || null,
      photo_url: vehicle.photoUrl || null,
      member_id: memberId
    };
    
    const apiUrl = `${getApiBaseUrl()}/vehicles`;
    const response = await fetchWithAuth(apiUrl, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Falha ao salvar veículo: ${response.status} - ${JSON.stringify(errorData)}`);
    }
    
    return response.json();
  },
  
  /**
   * Atualiza um veículo existente
   */
  update: async (id: string, vehicle: Vehicle): Promise<Vehicle> => {
    const apiUrl = `${getApiBaseUrl()}/vehicles/${id}`;
    const response = await fetchWithAuth(apiUrl, {
      method: 'PUT',
      body: JSON.stringify(vehicle)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return response.json();
  },
  
  /**
   * Remove um veículo
   */
  delete: async (id: string): Promise<void> => {
    const apiUrl = `${getApiBaseUrl()}/vehicles/${id}`;
    const response = await fetchWithAuth(apiUrl, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  },
  
  /**
   * Busca veículos de um membro específico
   */
  getByMemberId: async (memberId: string): Promise<Vehicle[]> => {
    const apiUrl = `${getApiBaseUrl()}/vehicles/member/${memberId}`;
    const response = await fetchWithAuth(apiUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data: VehicleResponse[] = await response.json();
    
    return data.map(item => ({
      id: item.id,
      brand: item.brand,
      model: item.model,
      type: item.type as VehicleType,
      displacement: item.displacement,
      nickname: item.nickname || undefined,
      photoUrl: item.photoUrl || undefined
    }));
  }
};
