// Middleware para registrar atividades de autenticação
const activityLogService = require('../services/activity-log-service');

/**
 * Middleware para registrar atividades relacionadas à autenticação
 */
const logAuthActivity = (action) => {
  return async (req, res, next) => {
    // Guardar o método original de envio de resposta
    const originalSend = res.send;
    
    // Capturar o IP do cliente
    const ipAddress = req.ip || 
                    req.connection?.remoteAddress || 
                    req.headers['x-forwarded-for'] || 
                    'unknown';
    
    try {
      // Substituir o método send para capturar o status e corpo da resposta
      res.send = function(body) {
        // Restaurar o método original para evitar loops
        res.send = originalSend;
        
        // Processar apenas respostas bem-sucedidas (2xx)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // Preparar os detalhes
          const details = {
            email: req.body.email, // Captura apenas o email, não a senha
            path: req.path,
            status: res.statusCode
          };
          
          // Obter o ID do usuário e nome se disponível
          let userId = null;
          let username = null;
          
          // Tentar extrair do corpo da resposta se for JSON
          try {
            const parsedBody = typeof body === 'string' ? JSON.parse(body) : body;
            
            // Para login bem-sucedido
            if (parsedBody && parsedBody.user) {
              userId = parsedBody.user.id;
              username = parsedBody.user.email || parsedBody.user.name;
            }
            // Para registro bem-sucedido
            else if (parsedBody && parsedBody.id) {
              userId = parsedBody.id;
              username = parsedBody.email || parsedBody.name;
            }
          } catch (e) {
            // Silenciosamente falhar e continuar sem ID
          }
          
          // Registrar a atividade de autenticação
          activityLogService.log({
            userId: userId,
            username: username || req.body.email || 'anônimo',
            action,
            entityType: 'AUTH',
            entityId: userId,
            details,
            ipAddress
          }).catch(err => console.error('Erro ao registrar log de autenticação:', err));
        }
        
        // Continuar com a resposta original
        return originalSend.call(res, body);
      };
    } catch (error) {
      console.error('Erro no middleware de logging de autenticação:', error);
    }
    
    // Continuar para o próximo middleware
    next();
  };
};

module.exports = {
  logAuthActivity
};
