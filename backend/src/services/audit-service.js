// backend/src/services/audit-service.js - Serviço Avançado de Auditoria
const { supabaseAdmin } = require('../config/supabase');

/**
 * Mapeamento de categorias para prioridades
 */
const CATEGORY_SEVERITY_MAP = {
  'authentication': 'high',
  'member_management': 'medium',
  'financial': 'high',
  'events': 'low',
  'store': 'medium',
  'vehicles': 'low',
  'system_config': 'critical',
  'reports': 'low',
  'communications': 'low',
  'data_operations': 'high',
  'maintenance': 'medium'
};

/**
 * Configurações GDPR para retenção de dados
 */
const GDPR_RETENTION_POLICIES = {
  'authentication': { days: 2555, autoAnonymize: true }, // 7 anos
  'member_management': { days: 2555, autoAnonymize: true },
  'financial': { days: 2555, autoAnonymize: false }, // Dados financeiros não são anonimizados
  'events': { days: 1095, autoAnonymize: true }, // 3 anos
  'store': { days: 1095, autoAnonymize: true },
  'vehicles': { days: 1095, autoAnonymize: true },
  'system_config': { days: 2555, autoAnonymize: false },
  'reports': { days: 1095, autoAnonymize: true },
  'communications': { days: 365, autoAnonymize: true }, // 1 ano
  'data_operations': { days: 2555, autoAnonymize: false },
  'maintenance': { days: 365, autoAnonymize: true }
};

/**
 * Serviço avançado de auditoria
 */
class AdvancedAuditService {
  
  /**
   * Registar log de auditoria com categorização avançada
   */
  async logActivity({
    userId,
    userEmail,
    userRole,
    sessionId,
    ipAddress,
    userAgent,
    category,
    action,
    resourceType,
    resourceId,
    description,
    oldValues,
    newValues,
    metadata,
    requestMethod,
    requestUrl,
    responseStatus,
    executionTimeMs,
    tags = []
  }) {
    try {
      // Determinar severidade baseada na categoria e ação
      const severity = this.determineSeverity(category, action, responseStatus);
      
      // Verificar se contém dados sensíveis
      const isSensitive = this.checkSensitiveData({ oldValues, newValues, metadata, userEmail });
      
      // Determinar se requer atenção
      const requiresAttention = this.requiresAttention(severity, action, responseStatus);
      
      // Calcular data de retenção GDPR
      const gdprRetentionDate = this.calculateRetentionDate(category);
      
      // Preparar dados do log
      const auditLogData = {
        timestamp: new Date().toISOString(),
        user_id: userId || null,
        user_email: userEmail || null,
        user_role: userRole || null,
        session_id: sessionId || null,
        ip_address: ipAddress || 'unknown',
        user_agent: userAgent || null,
        category: category || 'data_operations',
        action: action || 'UNKNOWN',
        resource_type: resourceType || null,
        resource_id: resourceId || null,
        description: description || '',
        old_values: oldValues ? JSON.stringify(oldValues) : null,
        new_values: newValues ? JSON.stringify(newValues) : null,
        metadata: metadata ? JSON.stringify(metadata) : null,
        request_method: requestMethod || null,
        request_url: requestUrl || null,
        response_status: responseStatus || null,
        execution_time_ms: executionTimeMs || null,
        severity: severity,
        is_sensitive: isSensitive,
        requires_attention: requiresAttention,
        tags: tags.length > 0 ? JSON.stringify(tags) : null,
        gdpr_retention_date: gdprRetentionDate,
        anonymized: false
      };

      // Inserir na tabela de logs de auditoria
      const { data, error } = await supabaseAdmin
        .from('system_audit_logs')
        .insert(auditLogData)
        .select()
        .single();

      if (error) {
        console.error('Erro ao inserir log de auditoria:', error);
        return null;
      }

      // Verificar se deve disparar alertas
      await this.checkAlertRules(auditLogData);

      console.log(`Log de auditoria registrado: ${category}/${action} - ${severity}`);
      return data;

    } catch (error) {
      console.error('Erro no serviço de auditoria:', error);
      return null;
    }
  }

  /**
   * Obter logs de auditoria com filtros avançados
   */
  async getLogs({
    categories = [],
    severity = [],
    userId = null,
    userRoles = [],
    dateFrom = null,
    dateTo = null,
    searchTerm = null,
    tags = [],
    isSensitive = null,
    requiresAttention = null,
    page = 0,
    limit = 50
  } = {}) {
    try {
      let query = supabaseAdmin
        .from('system_audit_logs')
        .select('*', { count: 'exact' })
        .order('timestamp', { ascending: false });

      // Aplicar filtros
      if (categories.length > 0) {
        query = query.in('category', categories);
      }

      if (severity.length > 0) {
        query = query.in('severity', severity);
      }

      if (userId) {
        query = query.eq('user_id', userId);
      }

      if (userRoles.length > 0) {
        query = query.in('user_role', userRoles);
      }

      if (dateFrom) {
        query = query.gte('timestamp', dateFrom);
      }

      if (dateTo) {
        query = query.lte('timestamp', dateTo);
      }

      if (searchTerm) {
        query = query.or(`description.ilike.%${searchTerm}%,action.ilike.%${searchTerm}%`);
      }

      if (isSensitive !== null) {
        query = query.eq('is_sensitive', isSensitive);
      }

      if (requiresAttention !== null) {
        query = query.eq('requires_attention', requiresAttention);
      }

      // Paginação
      const offset = page * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      return {
        logs: data || [],
        total: count || 0,
        hasNext: count > offset + limit
      };

    } catch (error) {
      console.error('Erro ao obter logs de auditoria:', error);
      throw error;
    }
  }

  /**
   * Obter estatísticas de auditoria
   */
  async getStats(dateFrom, dateTo) {
    try {
      let query = supabaseAdmin
        .from('system_audit_logs')
        .select('category, severity, action, user_id, user_email');

      if (dateFrom) {
        query = query.gte('timestamp', dateFrom);
      }

      if (dateTo) {
        query = query.lte('timestamp', dateTo);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Processar estatísticas
      const stats = {
        totalLogs: data.length,
        logsByCategory: {},
        logsBySeverity: {},
        logsByUser: {},
        topActions: {},
        recentAlerts: 0 // TODO: implementar contagem de alertas
      };

      // Contar por categoria
      data.forEach(log => {
        stats.logsByCategory[log.category] = (stats.logsByCategory[log.category] || 0) + 1;
        stats.logsBySeverity[log.severity] = (stats.logsBySeverity[log.severity] || 0) + 1;
        stats.topActions[log.action] = (stats.topActions[log.action] || 0) + 1;
        
        if (log.user_email) {
          const userKey = `${log.user_id}-${log.user_email}`;
          stats.logsByUser[userKey] = (stats.logsByUser[userKey] || 0) + 1;
        }
      });

      // Converter objetos em arrays ordenadas
      stats.logsByUser = Object.entries(stats.logsByUser)
        .map(([key, count]) => {
          const [userId, userEmail] = key.split('-');
          return { userId, userEmail, count };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      stats.topActions = Object.entries(stats.topActions)
        .map(([action, count]) => ({ action, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return stats;

    } catch (error) {
      console.error('Erro ao obter estatísticas de auditoria:', error);
      throw error;
    }
  }

  /**
   * Compliance GDPR - Anonimizar dados pessoais
   */
  async anonymizePersonalData(userId, retainFinancialData = false) {
    try {
      const updateData = {
        user_email: '[ANONYMIZED]',
        ip_address: '[ANONYMIZED]',
        user_agent: '[ANONYMIZED]',
        anonymized: true
      };

      let query = supabaseAdmin
        .from('system_audit_logs')
        .update(updateData)
        .eq('user_id', userId);

      // Se não deve reter dados financeiros, anonimizar também
      if (!retainFinancialData) {
        query = query.neq('category', 'financial');
      }

      const { error } = await query;

      if (error) {
        throw error;
      }

      console.log(`Dados pessoais anonimizados para usuário: ${userId}`);
      return true;

    } catch (error) {
      console.error('Erro na anonimização GDPR:', error);
      throw error;
    }
  }

  /**
   * Verificar regras de alerta
   */
  async checkAlertRules(auditLogData) {
    try {
      // TODO: Implementar sistema de alertas
      // Por agora, apenas verificamos condições críticas básicas
      
      if (auditLogData.severity === 'critical') {
        console.warn('🚨 ALERTA CRÍTICO:', auditLogData.action, auditLogData.description);
        
        // Inserir alerta na tabela (se existir)
        await this.insertAlert({
          rule_name: 'Critical Security Alert',
          triggered_by_log_id: auditLogData.id,
          severity: 'critical',
          message: `Ação crítica detectada: ${auditLogData.action}`,
          timestamp: new Date().toISOString()
        });
      }

      // Verificar tentativas de login falhadas consecutivas
      if (auditLogData.action === 'LOGIN_FAILED') {
        await this.checkFailedLoginAttempts(auditLogData.ip_address);
      }

      // Verificar acesso a dados sensíveis
      if (auditLogData.is_sensitive && auditLogData.category === 'data_operations') {
        console.warn('🔐 Acesso a dados sensíveis:', auditLogData.description);
      }

    } catch (error) {
      console.error('Erro ao verificar regras de alerta:', error);
    }
  }

  /**
   * Verificar tentativas de login falhadas consecutivas
   */
  async checkFailedLoginAttempts(ipAddress) {
    try {
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
      
      const { data, error } = await supabaseAdmin
        .from('system_audit_logs')
        .select('*')
        .eq('action', 'LOGIN_FAILED')
        .eq('ip_address', ipAddress)
        .gte('timestamp', fifteenMinutesAgo);

      if (error) {
        throw error;
      }

      if (data && data.length >= 5) {
        console.warn(`🚨 ALERTA: ${data.length} tentativas de login falhadas do IP ${ipAddress} nos últimos 15 minutos`);
        
        await this.insertAlert({
          rule_name: 'Multiple Failed Logins',
          severity: 'high',
          message: `${data.length} tentativas de login falhadas do IP ${ipAddress}`,
          timestamp: new Date().toISOString()
        });
      }

    } catch (error) {
      console.error('Erro ao verificar tentativas de login falhadas:', error);
    }
  }

  /**
   * Inserir alerta na tabela
   */
  async insertAlert(alertData) {
    try {
      const { error } = await supabaseAdmin
        .from('audit_alerts')
        .insert(alertData);

      if (error && error.code !== '42P01') { // Ignorar se tabela não existe
        console.error('Erro ao inserir alerta:', error);
      }
    } catch (error) {
      console.error('Erro ao inserir alerta:', error);
    }
  }

  /**
   * Determinar severidade do log
   */
  determineSeverity(category, action, responseStatus) {
    // Ações críticas
    if (action?.includes('DELETE') || action?.includes('ADMIN_') || category === 'system_config') {
      return 'critical';
    }

    // Erros de servidor
    if (responseStatus >= 500) {
      return 'high';
    }

    // Erros de autorização
    if (responseStatus === 403 || responseStatus === 401 || action?.includes('ACCESS_DENIED')) {
      return 'high';
    }

    // Usar mapeamento de categoria
    return CATEGORY_SEVERITY_MAP[category] || 'medium';
  }

  /**
   * Verificar se contém dados sensíveis
   */
  checkSensitiveData({ oldValues, newValues, metadata, userEmail }) {
    const sensitivePalterns = ['password', 'email', 'phone', 'address', 'cpf', 'nif'];
    
    const checkObject = (obj) => {
      if (!obj || typeof obj !== 'object') return false;
      
      const objString = JSON.stringify(obj).toLowerCase();
      return sensitivePalterns.some(pattern => objString.includes(pattern));
    };

    return checkObject(oldValues) || 
           checkObject(newValues) || 
           checkObject(metadata) || 
           (userEmail && userEmail !== '[ANONYMIZED]');
  }

  /**
   * Determinar se o log requer atenção
   */
  requiresAttention(severity, action, responseStatus) {
    return severity === 'critical' || 
           severity === 'high' || 
           (responseStatus >= 400 && responseStatus < 500) ||
           action?.includes('FAILED') ||
           action?.includes('DENIED');
  }

  /**
   * Calcular data de retenção GDPR
   */
  calculateRetentionDate(category) {
    const policy = GDPR_RETENTION_POLICIES[category] || GDPR_RETENTION_POLICIES['data_operations'];
    const retentionDate = new Date();
    retentionDate.setDate(retentionDate.getDate() + policy.days);
    return retentionDate.toISOString();
  }
}

// Instância singleton
const advancedAuditService = new AdvancedAuditService();

module.exports = advancedAuditService;
