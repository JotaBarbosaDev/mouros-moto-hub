// Sistema de auditoria avançado para logs de segurança
const activityLogService = require('../services/activity-log-service');

/**
 * Classe para gerenciar logs de auditoria de segurança
 */
class SecurityAuditLogger {
  
  /**
   * Log de tentativas de autenticação
   */
  static async logAuthAttempt(req, success, userInfo = {}) {
    const details = {
      success,
      ip: req.ip || req.connection?.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      email: req.body?.email || userInfo.email || 'unknown',
      timestamp: new Date().toISOString(),
      headers: {
        origin: req.get('Origin'),
        referer: req.get('Referer'),
        'x-forwarded-for': req.get('X-Forwarded-For')
      }
    };

    if (!success) {
      details.reason = userInfo.reason || 'Credenciais inválidas';
      details.attempt = userInfo.attempt || 1;
    }

    try {
      await activityLogService.log({
        userId: userInfo.userId || null,
        username: details.email,
        action: success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED',
        entityType: 'AUTH',
        entityId: userInfo.userId || null,
        details,
        ipAddress: details.ip,
        severity: success ? 'INFO' : 'WARNING'
      });
    } catch (error) {
      console.error('Erro ao registrar log de auditoria de auth:', error);
    }
  }

  /**
   * Log de ações administrativas
   */
  static async logAdminAction(req, action, targetEntity, details = {}) {
    const user = req.user || {};
    const auditDetails = {
      adminUser: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      action,
      targetEntity,
      ip: req.ip || req.connection?.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      timestamp: new Date().toISOString(),
      requestData: {
        method: req.method,
        path: req.path,
        params: req.params,
        body: this.sanitizeBody(req.body)
      },
      ...details
    };

    try {
      await activityLogService.log({
        userId: user.id,
        username: user.email || 'admin',
        action: `ADMIN_${action.toUpperCase()}`,
        entityType: 'ADMIN_ACTION',
        entityId: targetEntity?.id || null,
        details: auditDetails,
        ipAddress: auditDetails.ip,
        severity: 'HIGH'
      });
    } catch (error) {
      console.error('Erro ao registrar log de auditoria admin:', error);
    }
  }

  /**
   * Log de tentativas de acesso negado
   */
  static async logAccessDenied(req, reason, userInfo = {}) {
    const details = {
      reason,
      ip: req.ip || req.connection?.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
      user: userInfo,
      headers: {
        authorization: req.get('Authorization') ? '[REDACTED]' : 'none',
        origin: req.get('Origin'),
        referer: req.get('Referer')
      }
    };

    try {
      await activityLogService.log({
        userId: userInfo.id || null,
        username: userInfo.email || 'anonymous',
        action: 'ACCESS_DENIED',
        entityType: 'SECURITY',
        entityId: null,
        details,
        ipAddress: details.ip,
        severity: 'WARNING'
      });
    } catch (error) {
      console.error('Erro ao registrar log de acesso negado:', error);
    }
  }

  /**
   * Log de atividades suspeitas
   */
  static async logSuspiciousActivity(req, activityType, details = {}) {
    const auditDetails = {
      activityType,
      ip: req.ip || req.connection?.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
      headers: {
        origin: req.get('Origin'),
        referer: req.get('Referer'),
        'x-forwarded-for': req.get('X-Forwarded-For')
      },
      ...details
    };

    try {
      await activityLogService.log({
        userId: null,
        username: 'system_security',
        action: 'SUSPICIOUS_ACTIVITY',
        entityType: 'SECURITY',
        entityId: null,
        details: auditDetails,
        ipAddress: auditDetails.ip,
        severity: 'CRITICAL'
      });
    } catch (error) {
      console.error('Erro ao registrar atividade suspeita:', error);
    }
  }

  /**
   * Log de rate limiting
   */
  static async logRateLimit(req, limitType, details = {}) {
    const auditDetails = {
      limitType,
      ip: req.ip || req.connection?.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
      rateLimitInfo: req.rateLimit || {},
      ...details
    };

    try {
      await activityLogService.log({
        userId: req.user?.id || null,
        username: req.user?.email || 'anonymous',
        action: 'RATE_LIMIT_EXCEEDED',
        entityType: 'SECURITY',
        entityId: null,
        details: auditDetails,
        ipAddress: auditDetails.ip,
        severity: 'WARNING'
      });
    } catch (error) {
      console.error('Erro ao registrar rate limit:', error);
    }
  }

  /**
   * Log de operações de dados sensíveis
   */
  static async logSensitiveDataAccess(req, dataType, operation, targetId = null) {
    const user = req.user || {};
    const details = {
      dataType,
      operation,
      targetId,
      userId: user.id,
      userEmail: user.email,
      ip: req.ip || req.connection?.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method
    };

    try {
      await activityLogService.log({
        userId: user.id,
        username: user.email || 'unknown',
        action: `SENSITIVE_DATA_${operation.toUpperCase()}`,
        entityType: dataType.toUpperCase(),
        entityId: targetId,
        details,
        ipAddress: details.ip,
        severity: 'HIGH'
      });
    } catch (error) {
      console.error('Erro ao registrar acesso a dados sensíveis:', error);
    }
  }

  /**
   * Sanitizar dados do corpo da requisição para logs
   */
  static sanitizeBody(body) {
    if (!body || typeof body !== 'object') return body;

    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  /**
   * Middleware para log automático de operações sensíveis
   */
  static auditMiddleware(dataType, operation) {
    return async (req, res, next) => {
      // Guardar o método original
      const originalSend = res.send;
      
      res.send = function(body) {
        // Restaurar método original
        res.send = originalSend;
        
        // Log apenas se a operação foi bem-sucedida
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const targetId = req.params?.id || 
                          (typeof body === 'string' ? JSON.parse(body)?.id : body?.id) ||
                          null;
          
          SecurityAuditLogger.logSensitiveDataAccess(req, dataType, operation, targetId)
            .catch(error => console.error('Erro no middleware de auditoria:', error));
        }
        
        // Enviar resposta
        return originalSend.call(this, body);
      };
      
      next();
    };
  }
}

module.exports = SecurityAuditLogger;
