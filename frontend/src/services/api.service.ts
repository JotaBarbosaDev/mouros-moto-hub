import { getAccessToken, getApiBaseUrl } from '@/utils/api';

/**
 * Serviço API genérico para fazer chamadas à API backend
 */
export class ApiService {
  /**
   * URL base da API
   */
  private static baseUrl = getApiBaseUrl();

  /**
   * Obtém todos os itens de um recurso específico
   * @param endpoint Endpoint da API
   * @returns Promise com os dados
   */
  static async getAll<T>(endpoint: string): Promise<T[]> {
    const token = await getAccessToken();
    const response = await fetch(`${this.baseUrl}/${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Obtém um item específico por ID
   * @param endpoint Endpoint da API
   * @param id ID do recurso
   * @returns Promise com os dados
   */
  static async getById<T>(endpoint: string, id: string): Promise<T> {
    const token = await getAccessToken();
    const response = await fetch(`${this.baseUrl}/${endpoint}/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Cria um novo recurso
   * @param endpoint Endpoint da API
   * @param data Dados do recurso
   * @returns Promise com a resposta
   */
  static async create<T, R>(endpoint: string, data: T): Promise<R> {
    const token = await getAccessToken();
    const response = await fetch(`${this.baseUrl}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Atualiza um recurso existente
   * @param endpoint Endpoint da API
   * @param id ID do recurso
   * @param data Dados atualizados
   * @returns Promise com a resposta
   */
  static async update<T, R>(endpoint: string, id: string, data: T): Promise<R> {
    const token = await getAccessToken();
    const response = await fetch(`${this.baseUrl}/${endpoint}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Remove um recurso
   * @param endpoint Endpoint da API
   * @param id ID do recurso
   * @returns Promise com a resposta
   */
  static async delete(endpoint: string, id: string): Promise<void> {
    const token = await getAccessToken();
    const response = await fetch(`${this.baseUrl}/${endpoint}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  }
}
