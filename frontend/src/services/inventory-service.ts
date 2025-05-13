import { fetchWithAuth, getApiBaseUrl } from '@/utils/api';
import { InventoryItem, InventoryLog, InventoryCategory, InventoryUseType } from '@/types/inventory';

export interface CreateInventoryItemDto {
  name: string;
  quantity: number;
  unitOfMeasure: string;
  category: InventoryCategory;
  useType: InventoryUseType;
  imageUrl?: string;
}

/**
 * Serviço para gerenciamento de inventário
 */
export const inventoryService = {
  /**
   * Busca todos os itens de inventário
   */
  getAll: async (): Promise<InventoryItem[]> => {
    const apiUrl = `${getApiBaseUrl()}/inventory`;
    const response = await fetchWithAuth(apiUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.map((item: any) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unitOfMeasure: item.unit_of_measure || item.unitOfMeasure,
      category: item.category,
      useType: item.use_type || item.useType,
      imageUrl: item.image_url || item.imageUrl,
      createdAt: item.created_at || item.createdAt,
      updatedAt: item.updated_at || item.updatedAt
    }));
  },
  
  /**
   * Busca um item de inventário pelo ID
   */
  getById: async (id: string): Promise<InventoryItem> => {
    const apiUrl = `${getApiBaseUrl()}/inventory/${id}`;
    const response = await fetchWithAuth(apiUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const item = await response.json();
    
    return {
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unitOfMeasure: item.unit_of_measure || item.unitOfMeasure,
      category: item.category,
      useType: item.use_type || item.useType,
      imageUrl: item.image_url || item.imageUrl,
      createdAt: item.created_at || item.createdAt,
      updatedAt: item.updated_at || item.updatedAt
    };
  },
  
  /**
   * Cria um novo item de inventário
   */
  create: async (itemData: CreateInventoryItemDto): Promise<InventoryItem> => {
    const apiUrl = `${getApiBaseUrl()}/inventory`;
    
    // Adapta os dados para o formato esperado pelo backend
    const payload = {
      name: itemData.name,
      quantity: itemData.quantity,
      unit_of_measure: itemData.unitOfMeasure,
      category: itemData.category,
      use_type: itemData.useType,
      image_url: itemData.imageUrl || null
    };
    
    const response = await fetchWithAuth(apiUrl, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const createdItem = await response.json();
    
    return {
      id: createdItem.id,
      name: createdItem.name,
      quantity: createdItem.quantity,
      unitOfMeasure: createdItem.unit_of_measure || createdItem.unitOfMeasure,
      category: createdItem.category,
      useType: createdItem.use_type || createdItem.useType,
      imageUrl: createdItem.image_url || createdItem.imageUrl,
      createdAt: createdItem.created_at || createdItem.createdAt,
      updatedAt: createdItem.updated_at || createdItem.updatedAt
    };
  },
  
  /**
   * Atualiza um item de inventário existente
   */
  update: async (id: string, itemData: Partial<InventoryItem>): Promise<InventoryItem> => {
    const apiUrl = `${getApiBaseUrl()}/inventory/${id}`;
    
    // Adapta os dados para o formato esperado pelo backend
    const payload: Record<string, any> = {};
    
    if (itemData.name !== undefined) payload.name = itemData.name;
    if (itemData.quantity !== undefined) payload.quantity = itemData.quantity;
    if (itemData.unitOfMeasure !== undefined) payload.unit_of_measure = itemData.unitOfMeasure;
    if (itemData.category !== undefined) payload.category = itemData.category;
    if (itemData.useType !== undefined) payload.use_type = itemData.useType;
    if (itemData.imageUrl !== undefined) payload.image_url = itemData.imageUrl;
    
    const response = await fetchWithAuth(apiUrl, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const updatedItem = await response.json();
    
    return {
      id: updatedItem.id,
      name: updatedItem.name,
      quantity: updatedItem.quantity,
      unitOfMeasure: updatedItem.unit_of_measure || updatedItem.unitOfMeasure,
      category: updatedItem.category,
      useType: updatedItem.use_type || updatedItem.useType,
      imageUrl: updatedItem.image_url || updatedItem.imageUrl,
      createdAt: updatedItem.created_at || updatedItem.createdAt,
      updatedAt: updatedItem.updated_at || updatedItem.updatedAt
    };
  },
  
  /**
   * Remove um item de inventário
   */
  delete: async (id: string): Promise<void> => {
    const apiUrl = `${getApiBaseUrl()}/inventory/${id}`;
    const response = await fetchWithAuth(apiUrl, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  },
  
  /**
   * Adiciona quantidade a um item
   */
  addQuantity: async (id: string, quantity: number, reason?: string): Promise<InventoryItem> => {
    const apiUrl = `${getApiBaseUrl()}/inventory/${id}/add`;
    const response = await fetchWithAuth(apiUrl, {
      method: 'POST',
      body: JSON.stringify({ quantity, reason })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const updatedItem = await response.json();
    
    return {
      id: updatedItem.id,
      name: updatedItem.name,
      quantity: updatedItem.quantity,
      unitOfMeasure: updatedItem.unit_of_measure || updatedItem.unitOfMeasure,
      category: updatedItem.category,
      useType: updatedItem.use_type || updatedItem.useType,
      imageUrl: updatedItem.image_url || updatedItem.imageUrl,
      createdAt: updatedItem.created_at || updatedItem.createdAt,
      updatedAt: updatedItem.updated_at || updatedItem.updatedAt
    };
  },
  
  /**
   * Remove quantidade de um item
   */
  removeQuantity: async (id: string, quantity: number, reason?: string): Promise<InventoryItem> => {
    const apiUrl = `${getApiBaseUrl()}/inventory/${id}/remove`;
    const response = await fetchWithAuth(apiUrl, {
      method: 'POST',
      body: JSON.stringify({ quantity, reason })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const updatedItem = await response.json();
    
    return {
      id: updatedItem.id,
      name: updatedItem.name,
      quantity: updatedItem.quantity,
      unitOfMeasure: updatedItem.unit_of_measure || updatedItem.unitOfMeasure,
      category: updatedItem.category,
      useType: updatedItem.use_type || updatedItem.useType,
      imageUrl: updatedItem.image_url || updatedItem.imageUrl,
      createdAt: updatedItem.created_at || updatedItem.createdAt,
      updatedAt: updatedItem.updated_at || updatedItem.updatedAt
    };
  },
  
  /**
   * Busca o histórico de um item
   */
  getHistory: async (id: string): Promise<InventoryLog[]> => {
    const apiUrl = `${getApiBaseUrl()}/inventory/${id}/history`;
    const response = await fetchWithAuth(apiUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.map((log: any) => ({
      id: log.id,
      inventoryId: log.inventory_id,
      previousQuantity: log.previous_quantity,
      newQuantity: log.new_quantity,
      changeReason: log.change_reason || '',
      userId: log.user_id,
      createdAt: log.created_at
    }));
  }
};
