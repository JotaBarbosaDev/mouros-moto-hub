import { fetchWithAuth, getApiBaseUrl } from '@/utils/api';
import { Product } from '@/types/bar';

/**
 * Serviço para gerenciamento de produtos do bar
 */
export const barProductService = {
  /**
   * Busca todos os produtos do bar
   */
  getAll: async (): Promise<Product[]> => {
    const apiUrl = `${getApiBaseUrl()}/bar/products`;
    const response = await fetchWithAuth(apiUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.map((product: any) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description || '',
      unitOfMeasure: product.unit_of_measure,
      imageUrl: product.image_url || '',
      stock: product.stock,
      minStock: product.min_stock,
      inventoryId: product.inventory_id
    }));
  },
  
  /**
   * Busca um produto pelo ID
   */
  getById: async (id: string): Promise<Product> => {
    const apiUrl = `${getApiBaseUrl()}/bar/products/${id}`;
    const response = await fetchWithAuth(apiUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const product = await response.json();
    
    return {
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description || '',
      unitOfMeasure: product.unit_of_measure,
      imageUrl: product.image_url || '',
      stock: product.stock,
      minStock: product.min_stock,
      inventoryId: product.inventory_id
    };
  },
  
  /**
   * Cria um novo produto
   */
  create: async (product: Omit<Product, 'id'>): Promise<Product> => {
    const apiUrl = `${getApiBaseUrl()}/bar/products`;
    
    // Adapta os dados para o formato esperado pelo backend
    const payload = {
      name: product.name,
      price: product.price,
      description: product.description || '',
      unit_of_measure: product.unitOfMeasure,
      image_url: product.imageUrl || '',
      stock: product.stock,
      min_stock: product.minStock,
      inventory_id: product.inventoryId
    };
    
    const response = await fetchWithAuth(apiUrl, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const createdProduct = await response.json();
    
    return {
      id: createdProduct.id,
      name: createdProduct.name,
      price: createdProduct.price,
      description: createdProduct.description || '',
      unitOfMeasure: createdProduct.unit_of_measure,
      imageUrl: createdProduct.image_url || '',
      stock: createdProduct.stock,
      minStock: createdProduct.min_stock,
      inventoryId: createdProduct.inventory_id
    };
  },
  
  /**
   * Atualiza um produto existente
   */
  update: async (id: string, product: Product): Promise<Product> => {
    const apiUrl = `${getApiBaseUrl()}/bar/products/${id}`;
    
    // Adapta os dados para o formato esperado pelo backend
    const payload = {
      name: product.name,
      price: product.price,
      description: product.description || '',
      unit_of_measure: product.unitOfMeasure,
      image_url: product.imageUrl || '',
      stock: product.stock,
      min_stock: product.minStock,
      inventory_id: product.inventoryId
    };
    
    const response = await fetchWithAuth(apiUrl, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const updatedProduct = await response.json();
    
    return {
      id: updatedProduct.id,
      name: updatedProduct.name,
      price: updatedProduct.price,
      description: updatedProduct.description || '',
      unitOfMeasure: updatedProduct.unit_of_measure,
      imageUrl: updatedProduct.image_url || '',
      stock: updatedProduct.stock,
      minStock: updatedProduct.min_stock,
      inventoryId: updatedProduct.inventory_id
    };
  },
  
  /**
   * Busca um produto pelo ID do item de inventário relacionado
   */
  getByInventoryId: async (inventoryId: string): Promise<Product | null> => {
    try {
      const apiUrl = `${getApiBaseUrl()}/bar/products?inventory_id=${encodeURIComponent(inventoryId)}`;
      const response = await fetchWithAuth(apiUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Se não encontrou produtos relacionados, retorna null
      if (!data || !Array.isArray(data) || data.length === 0) {
        return null;
      }
      
      const product = data[0]; // Pegamos o primeiro produto relacionado
      
      return {
        id: product.id,
        name: product.name,
        price: product.price,
        description: product.description || '',
        unitOfMeasure: product.unit_of_measure,
        imageUrl: product.image_url || '',
        stock: product.stock,
        minStock: product.min_stock || 0,
        inventoryId: product.inventory_id
      };
    } catch (error) {
      console.error('Erro ao buscar produto por inventoryId:', error);
      return null; // Retorna null em caso de erro para facilitar o tratamento
    }
  },
  
  /**
   * Remove um produto
   */
  delete: async (id: string): Promise<void> => {
    const apiUrl = `${getApiBaseUrl()}/bar/products/${id}`;
    const response = await fetchWithAuth(apiUrl, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  },
  
  /**
   * Atualiza o estoque de um produto
   */
  updateStock: async (id: string, stock: number): Promise<void> => {
    const apiUrl = `${getApiBaseUrl()}/bar/products/${id}/stock`;
    const response = await fetchWithAuth(apiUrl, {
      method: 'PATCH',
      body: JSON.stringify({ stock })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  }
};
