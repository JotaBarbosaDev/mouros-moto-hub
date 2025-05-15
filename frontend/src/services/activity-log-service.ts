import { supabase } from '@/integrations/supabase/client';

// Tipos para o serviço de logs
export interface ActivityLog {
  id: string;
  user_id?: string;
  username?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: any;
  ip_address?: string;
  created_at: string;
}

export interface LogFilters {
  userId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  fromDate?: string;
  toDate?: string;
  limit?: number;
  offset?: number;
}

/**
 * Serviço para gerenciamento de logs de atividade
 */
export const activityLogService = {
  /**
   * Obtém os logs de atividade com filtros opcionais
   */
  async getLogs(filters: LogFilters = {}): Promise<ActivityLog[]> {
    try {
      let query = supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Aplicar filtros se fornecidos
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }
      
      if (filters.action) {
        query = query.eq('action', filters.action.toUpperCase());
      }
      
      if (filters.entityType) {
        query = query.eq('entity_type', filters.entityType.toUpperCase());
      }
      
      if (filters.entityId) {
        query = query.eq('entity_id', filters.entityId);
      }
      
      if (filters.fromDate) {
        query = query.gte('created_at', filters.fromDate);
      }
      
      if (filters.toDate) {
        query = query.lte('created_at', filters.toDate);
      }
      
      // Limite e paginação
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Erro ao buscar logs de atividade:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Erro ao processar busca de logs:', error);
      throw error;
    }
  },
  
  /**
   * Obtém os logs recentes
   * @param {number} limit - Quantidade máxima de logs
   * @returns {Promise<Array>} - Lista de logs
   */
  async getRecentLogs(limit = 20) {
    return this.getLogs({ limit });
  },
  
  /**
   * Obtém os logs relacionados a uma entidade específica
   * @param {string} entityType - Tipo de entidade (MEMBER, VEHICLE)
   * @param {string} entityId - ID da entidade
   * @param {number} limit - Quantidade máxima de logs
   * @returns {Promise<Array>} - Lista de logs
   */
  async getEntityLogs(entityType, entityId, limit = 50) {
    return this.getLogs({
      entityType,
      entityId,
      limit
    });
  },
  
  /**
   * Registra uma atividade no sistema
   * @param {Object} logData - Dados do log
   * @returns {Promise<Object>} - O log criado
   */
  async createLog(logData) {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .insert({
          user_id: logData.userId,
          username: logData.username,
          action: logData.action.toUpperCase(),
          entity_type: logData.entityType.toUpperCase(),
          entity_id: logData.entityId,
          details: logData.details || {},
          ip_address: logData.ipAddress || null
        })
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao criar log de atividade:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Erro ao processar criação de log:', error);
      throw error;
    }
  }
};
