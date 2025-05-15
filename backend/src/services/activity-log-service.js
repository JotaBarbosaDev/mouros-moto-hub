// Serviço para registrar logs de atividades
const { supabaseAdmin } = require('../config/supabase');

/**
 * Serviço para registro de logs de atividades no sistema
 */
const activityLogService = {
  /**
   * Registra uma atividade no sistema
   * @param {Object} logData - Dados do log
   * @param {string} logData.userId - ID do usuário que realizou a ação
   * @param {string} logData.username - Nome do usuário que realizou a ação
   * @param {string} logData.action - Ação realizada (CREATE, UPDATE, DELETE, VIEW)
   * @param {string} logData.entityType - Tipo de entidade afetada (MEMBER, VEHICLE, EVENT)
   * @param {string} logData.entityId - ID da entidade afetada
   * @param {Object} logData.details - Detalhes adicionais (dados antigos/novos)
   * @param {string} logData.ipAddress - Endereço IP de onde a ação foi realizada
   * @returns {Promise<Object>} - O log criado
   */
  async log({
    userId,
    username,
    action,
    entityType,
    entityId,
    details,
    ipAddress
  }) {
    try {
      // Estrutura do log para inserção na tabela
      const logEntry = {
        user_id: userId,
        username,
        action: action.toUpperCase(),
        entity_type: entityType.toUpperCase(),
        entity_id: entityId,
        details: details || {},
        ip_address: ipAddress
      };

      // Verificar se a tabela de logs existe
      try {
        const { error: tableCheckError } = await supabaseAdmin
          .from('activity_logs')
          .select('id')
          .limit(1);
          
        if (tableCheckError) {
          console.error('A tabela activity_logs pode não existir:', tableCheckError);
          return null;
        }
      } catch (checkError) {
        console.error('Erro ao verificar existência da tabela activity_logs:', checkError);
        return null;
      }
      
      // Inserindo no Supabase
      const { data, error } = await supabaseAdmin
        .from('activity_logs')
        .insert(logEntry)
        .select()
        .single();

      if (error) {
        console.error('Erro ao registrar log de atividade:', error);
        // Não interromper o fluxo da aplicação se houver erro no log
        return null;
      }

      console.log('Log de atividade registrado com sucesso:', logEntry.action, logEntry.entity_type);
      return data;
    } catch (error) {
      console.error('Exceção ao registrar log de atividade:', error);
      // Não interromper o fluxo da aplicação se houver erro no log
      return null;
    }
  },

  /**
   * Recupera logs de atividade filtrados por vários critérios
   * @param {Object} filters - Filtros para busca de logs
   * @returns {Promise<Array>} - Lista de logs
   */
  async getLogs(filters = {}) {
    try {
      let query = supabaseAdmin
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
      console.error('Exceção ao buscar logs de atividade:', error);
      throw error;
    }
  },

  /**
   * Recupera os últimos logs de atividade
   * @param {number} limit - Quantidade de logs a retornar
   * @returns {Promise<Array>} - Lista de logs
   */
  async getRecentLogs(limit = 20) {
    return this.getLogs({ limit });
  },

  /**
   * Recupera logs de atividade relacionados a uma entidade específica
   * @param {string} entityType - Tipo de entidade
   * @param {string} entityId - ID da entidade
   * @param {number} limit - Quantidade de logs a retornar
   * @returns {Promise<Array>} - Lista de logs
   */
  async getEntityLogs(entityType, entityId, limit = 50) {
    return this.getLogs({
      entityType,
      entityId,
      limit
    });
  }
};

module.exports = activityLogService;
