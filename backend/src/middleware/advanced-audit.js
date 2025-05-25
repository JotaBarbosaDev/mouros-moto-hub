// backend/src/middleware/advanced-audit.js - Middleware Avançado de Auditoria
const advancedAuditService = require('../services/audit-service');

/**
 * Middleware avançado de auditoria que intercepta todas as requisições
 * e registra automaticamente logs detalhados
 */
class AdvancedAuditMiddleware {
  
  /**
   * Criar middleware de auditoria para uma categoria específica
   */
  static createAuditMiddleware(category, resourceType = null) {
    return async (req, res, next) => {
      const startTime = Date.now();
      
      // Capturar dados da requisição
      const auditData = {
        sessionId: req.headers['x-session-id'] || req.sessionID,
        ipAddress: req.ip || req.connection?.remoteAddress || 'unknown',
        userAgent: req.get('User-Agent'),
        category: category,
        resourceType: resourceType,
        requestMethod: req.method,
        requestUrl: req.originalUrl || req.url,
        metadata: {
          params: req.params,
          query: req.query,
          bodyKeys: req.body ? Object.keys(req.body) : []
        }
      };

      // Adicionar dados do utilizador se autenticado
      if (req.user) {
        auditData.userId = req.user.id;
        auditData.userEmail = req.user.email;
        auditData.userRole = req.user.role || 'socio';
      }

      // Interceptar resposta para capturar dados adicionais
      const originalSend = res.send;
      const originalJson = res.json;
      
      res.send = function(body) {
        res.send = originalSend;
        
        // Registrar log após resposta
        setImmediate(() => {
          AdvancedAuditMiddleware.logAfterResponse(auditData, req, res, startTime, body);
        });
        
        return originalSend.call(this, body);
      };

      res.json = function(body) {
        res.json = originalJson;
        
        // Registrar log após resposta
        setImmediate(() => {
          AdvancedAuditMiddleware.logAfterResponse(auditData, req, res, startTime, body);
        });
        
        return originalJson.call(this, body);
      };

      next();
    };
  }

  /**
   * Registrar log após resposta ser enviada
   */
  static async logAfterResponse(baseAuditData, req, res, startTime, responseBody) {
    try {
      const executionTime = Date.now() - startTime;
      
      // Determinar ação baseada no método e URL
      const action = AdvancedAuditMiddleware.determineAction(req.method, req.url, res.statusCode);
      
      // Determinar ID do recurso se possível
      const resourceId = req.params?.id || 
                        (typeof responseBody === 'object' && responseBody?.id) ||
                        null;

      // Preparar descrição
      const description = AdvancedAuditMiddleware.generateDescription(
        action, 
        baseAuditData.resourceType || baseAuditData.category, 
        resourceId,
        res.statusCode
      );

      // Capturar valores antigos e novos para operações de atualização
      let oldValues = null;
      let newValues = null;
      
      if (req.method === 'PUT' || req.method === 'PATCH') {
        oldValues = req.originalData; // Será definido por middleware específico
        newValues = req.body;
      } else if (req.method === 'POST') {
        newValues = req.body;
      }

      // Sanitizar dados sensíveis
      if (oldValues) {
        oldValues = AdvancedAuditMiddleware.sanitizeSensitiveData(oldValues);
      }
      if (newValues) {
        newValues = AdvancedAuditMiddleware.sanitizeSensitiveData(newValues);
      }

      // Registrar log de auditoria
      await advancedAuditService.logActivity({
        ...baseAuditData,
        action,
        resourceId,
        description,
        oldValues,
        newValues,
        responseStatus: res.statusCode,
        executionTimeMs: executionTime,
        tags: AdvancedAuditMiddleware.generateTags(req, res)
      });

    } catch (error) {
      console.error('Erro no middleware de auditoria avançada:', error);
    }
  }

  /**
   * Middleware específico para capturar dados originais antes de atualizações
   */
  static captureOriginalData(tableName, idField = 'id') {
    return async (req, res, next) => {
      if ((req.method === 'PUT' || req.method === 'PATCH') && req.params[idField]) {
        try {
          const { supabaseAdmin } = require('../config/supabase');
          
          const { data, error } = await supabaseAdmin
            .from(tableName)
            .select('*')
            .eq(idField, req.params[idField])
            .single();
            
          if (!error && data) {
            req.originalData = data;
          }
        } catch (error) {
          console.error('Erro ao capturar dados originais:', error);
        }
      }
      next();
    };
  }

  /**
   * Determinar ação baseada no método HTTP e resposta
   */
  static determineAction(method, url, statusCode) {
    const urlLower = url.toLowerCase();
    
    // Mapeamento específico por URL
    if (urlLower.includes('/login')) return statusCode >= 400 ? 'LOGIN_FAILED' : 'LOGIN_SUCCESS';
    if (urlLower.includes('/logout')) return 'LOGOUT';
    if (urlLower.includes('/register')) return statusCode >= 400 ? 'REGISTER_FAILED' : 'REGISTER_SUCCESS';
    if (urlLower.includes('/approve')) return 'APPROVE';
    if (urlLower.includes('/reject')) return 'REJECT';
    if (urlLower.includes('/export')) return 'EXPORT';
    if (urlLower.includes('/backup')) return 'BACKUP';
    if (urlLower.includes('/config')) return 'CONFIG_UPDATE';
    
    // Mapeamento por método HTTP
    switch (method) {
      case 'GET':
        return statusCode >= 400 ? 'ACCESS_DENIED' : 'VIEW';
      case 'POST':
        return statusCode >= 400 ? 'CREATE_FAILED' : 'CREATE';
      case 'PUT':
      case 'PATCH':
        return statusCode >= 400 ? 'UPDATE_FAILED' : 'UPDATE';
      case 'DELETE':
        return statusCode >= 400 ? 'DELETE_FAILED' : 'DELETE';
      default:
        return 'UNKNOWN';
    }
  }

  /**
   * Gerar descrição legível
   */
  static generateDescription(action, resourceType, resourceId, statusCode) {
    const resourceName = resourceType || 'recurso';
    const idPart = resourceId ? ` (ID: ${resourceId})` : '';
    
    const actionMap = {
      'VIEW': `Visualização de ${resourceName}${idPart}`,
      'CREATE': `Criação de ${resourceName}${idPart}`,
      'UPDATE': `Atualização de ${resourceName}${idPart}`,
      'DELETE': `Eliminação de ${resourceName}${idPart}`,
      'LOGIN_SUCCESS': 'Login realizado com sucesso',
      'LOGIN_FAILED': 'Tentativa de login falhada',
      'LOGOUT': 'Logout realizado',
      'REGISTER_SUCCESS': 'Registo realizado com sucesso',
      'REGISTER_FAILED': 'Tentativa de registo falhada',
      'ACCESS_DENIED': `Acesso negado a ${resourceName}${idPart}`,
      'APPROVE': `Aprovação de ${resourceName}${idPart}`,
      'REJECT': `Rejeição de ${resourceName}${idPart}`,
      'EXPORT': `Exportação de dados de ${resourceName}`,
      'BACKUP': 'Solicitação de backup',
      'CONFIG_UPDATE': 'Atualização de configurações'
    };

    let description = actionMap[action] || `${action} em ${resourceName}${idPart}`;
    
    if (statusCode >= 400) {
      description += ` (Erro ${statusCode})`;
    }
    
    return description;
  }

  /**
   * Gerar tags para classificação
   */
  static generateTags(req, res) {
    const tags = [];
    
    // Tags baseadas no status
    if (res.statusCode >= 400) {
      tags.push('error');
    }
    if (res.statusCode >= 500) {
      tags.push('server_error');
    }
    if (res.statusCode === 401 || res.statusCode === 403) {
      tags.push('unauthorized');
    }
    
    // Tags baseadas na URL
    if (req.url.includes('/admin/')) {
      tags.push('admin');
    }
    if (req.url.includes('/api/')) {
      tags.push('api');
    }
    
    // Tags baseadas no método
    if (req.method === 'DELETE') {
      tags.push('deletion');
    }
    if (req.method === 'POST') {
      tags.push('creation');
    }
    
    return tags;
  }

  /**
   * Sanitizar dados sensíveis para logs
   */
  static sanitizeSensitiveData(data) {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sensitiveFields = [
      'password', 'senha', 'token', 'secret', 'key', 'authorization',
      'credit_card', 'cartao', 'nif', 'cpf', 'ssn'
    ];

    const sanitized = { ...data };
    
    const sanitizeRecursive = (obj) => {
      if (Array.isArray(obj)) {
        return obj.map(item => sanitizeRecursive(item));
      }
      
      if (obj !== null && typeof obj === 'object') {
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
          const keyLower = key.toLowerCase();
          
          if (sensitiveFields.some(field => keyLower.includes(field))) {
            result[key] = '[REDACTED]';
          } else if (typeof value === 'object') {
            result[key] = sanitizeRecursive(value);
          } else {
            result[key] = value;
          }
        }
        return result;
      }
      
      return obj;
    };

    return sanitizeRecursive(sanitized);
  }
}

/**
 * Middleware factory para diferentes categorias
 */
const createCategoryMiddleware = {
  authentication: () => AdvancedAuditMiddleware.createAuditMiddleware('authentication'),
  memberManagement: () => AdvancedAuditMiddleware.createAuditMiddleware('member_management', 'member'),
  financial: () => AdvancedAuditMiddleware.createAuditMiddleware('financial', 'transaction'),
  events: () => AdvancedAuditMiddleware.createAuditMiddleware('events', 'event'),
  store: () => AdvancedAuditMiddleware.createAuditMiddleware('store', 'product'),
  vehicles: () => AdvancedAuditMiddleware.createAuditMiddleware('vehicles', 'vehicle'),
  systemConfig: () => AdvancedAuditMiddleware.createAuditMiddleware('system_config', 'config'),
  reports: () => AdvancedAuditMiddleware.createAuditMiddleware('reports', 'report'),
  communications: () => AdvancedAuditMiddleware.createAuditMiddleware('communications', 'message'),
  dataOperations: () => AdvancedAuditMiddleware.createAuditMiddleware('data_operations', 'data'),
  maintenance: () => AdvancedAuditMiddleware.createAuditMiddleware('maintenance', 'operation')
};

module.exports = {
  AdvancedAuditMiddleware,
  createCategoryMiddleware,
  auditAuth: createCategoryMiddleware.authentication,
  auditMembers: createCategoryMiddleware.memberManagement,
  auditFinancial: createCategoryMiddleware.financial,
  auditEvents: createCategoryMiddleware.events,
  auditStore: createCategoryMiddleware.store,
  auditVehicles: createCategoryMiddleware.vehicles,
  auditConfig: createCategoryMiddleware.systemConfig,
  auditReports: createCategoryMiddleware.reports,
  auditCommunications: createCategoryMiddleware.communications,
  auditData: createCategoryMiddleware.dataOperations,
  auditMaintenance: createCategoryMiddleware.maintenance
};
