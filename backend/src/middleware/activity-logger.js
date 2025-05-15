// Middleware para registro de atividades
const activityLogService = require('../services/activity-log-service');

/**
 * Middleware para registrar atividades CRUD automaticamente
 * @param {Object} options - Opções de configuração
 * @param {string} options.entityType - Tipo de entidade (MEMBER, VEHICLE, etc)
 * @param {Function} options.getEntityId - Função para extrair o ID da entidade da requisição
 * @returns {Function} Middleware Express
 */
const logActivity = (options) => {
  return async (req, res, next) => {
    // Guardar o método original de envio de resposta
    const originalSend = res.send;
    
    try {
      // Determinar a ação com base no método HTTP
      let action;
      switch (req.method) {
        case 'POST':
          action = 'CREATE';
          break;
        case 'PUT':
        case 'PATCH':
          action = 'UPDATE';
          break;
        case 'DELETE':
          action = 'DELETE';
          break;
        default:
          action = 'VIEW';
      }
      
      // Extrair informações do usuário autenticado
      const user = req.user || {};
      
      // Capturar o IP do cliente
      const ipAddress = req.ip || 
                        req.connection?.remoteAddress || 
                        req.headers['x-forwarded-for'] || 
                        'unknown';
      
      // Substituir o método send para capturar o status e corpo da resposta
      res.send = function(body) {
        // Restaurar o método original para evitar loops
        res.send = originalSend;
        
        // Processar apenas respostas bem-sucedidas (2xx)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // Preparar os detalhes
          const details = {
            requestBody: req.body,
            method: req.method,
            path: req.path,
            params: req.params,
            query: req.query,
            status: res.statusCode
          };
          
          // Obter o ID da entidade
          let entityId;
          if (typeof options.getEntityId === 'function') {
            entityId = options.getEntityId(req, res, body);
          } else if (req.params.id) {
            entityId = req.params.id;
          } else if (body && body.id) {
            // Tentar extrair do corpo da resposta se for JSON
            try {
              const parsedBody = typeof body === 'string' ? JSON.parse(body) : body;
              entityId = parsedBody.id;
            } catch (e) {
              // Silenciosamente falhar e continuar sem ID
            }
          }
          
          // Registrar a atividade
          activityLogService.log({
            userId: user.id,
            username: user.email || user.username || 'sistema',
            action,
            entityType: options.entityType,
            entityId,
            details,
            ipAddress
          }).catch(err => console.error('Erro ao registrar log de atividade:', err));
        }
        
        // Continuar com a resposta original
        return originalSend.call(res, body);
      };
    } catch (error) {
      console.error('Erro no middleware de logging:', error);
    }
    
    // Continuar para o próximo middleware
    next();
  };
};

module.exports = {
  logActivity
};
