// Sistema centralizado de tratamento de erros
const SecurityAuditLogger = require('./security-audit');

/**
 * Classe para categorização e tratamento de erros
 */
class ErrorHandler {
  
  /**
   * Determinar se o erro deve ser logado como crítico
   */
  static isCriticalError(error) {
    const criticalPatterns = [
      /database/i,
      /connection/i,
      /timeout/i,
      /supabase/i,
      /jwt/i,
      /auth/i
    ];
    
    return criticalPatterns.some(pattern => 
      pattern.test(error.message) || pattern.test(error.name)
    );
  }

  /**
   * Determinar se o erro contém informações sensíveis
   */
  static containsSensitiveInfo(error) {
    const sensitivePatterns = [
      /password/i,
      /token/i,
      /secret/i,
      /key/i,
      /credential/i
    ];
    
    return sensitivePatterns.some(pattern => 
      pattern.test(error.message) || pattern.test(error.stack)
    );
  }

  /**
   * Sanitizar mensagem de erro para resposta ao cliente
   */
  static sanitizeErrorMessage(error, isProduction = true) {
    if (!isProduction) {
      return error.message;
    }

    // Em produção, sanitizar mensagens que podem revelar informações do sistema
    const dangerousPatterns = [
      { pattern: /database|db|sql/i, replacement: 'Erro interno do banco de dados' },
      { pattern: /supabase|postgres/i, replacement: 'Erro de conexão com o serviço' },
      { pattern: /jwt|token/i, replacement: 'Erro de autenticação' },
      { pattern: /file not found|enoent/i, replacement: 'Recurso não encontrado' },
      { pattern: /permission denied|eacces/i, replacement: 'Acesso negado' },
      { pattern: /connection.*refused|econnrefused/i, replacement: 'Serviço temporariamente indisponível' }
    ];

    for (const { pattern, replacement } of dangerousPatterns) {
      if (pattern.test(error.message)) {
        return replacement;
      }
    }

    return error.message;
  }

  /**
   * Determinar código de status HTTP apropriado
   */
  static getStatusCode(error) {
    // Se já tem um status code definido
    if (error.statusCode || error.status) {
      return error.statusCode || error.status;
    }

    // Determinar baseado no tipo/mensagem do erro
    if (error.name === 'ValidationError') return 400;
    if (error.name === 'CastError') return 400;
    if (error.name === 'UnauthorizedError') return 401;
    if (error.name === 'JsonWebTokenError') return 401;
    if (error.name === 'TokenExpiredError') return 401;
    if (error.name === 'ForbiddenError') return 403;
    if (error.name === 'NotFoundError') return 404;
    if (error.name === 'ConflictError') return 409;
    if (error.name === 'TooManyRequestsError') return 429;

    // Verificar mensagem do erro
    if (/not found/i.test(error.message)) return 404;
    if (/unauthorized|invalid.*token/i.test(error.message)) return 401;
    if (/forbidden|access.*denied/i.test(error.message)) return 403;
    if (/validation|invalid.*input/i.test(error.message)) return 400;
    if (/duplicate|already.*exists/i.test(error.message)) return 409;
    if (/rate.*limit|too.*many/i.test(error.message)) return 429;

    // Erro interno por padrão
    return 500;
  }

  /**
   * Formatar resposta de erro padronizada
   */
  static formatErrorResponse(error, req, isProduction = true) {
    const statusCode = this.getStatusCode(error);
    const sanitizedMessage = this.sanitizeErrorMessage(error, isProduction);
    
    const baseResponse = {
      error: sanitizedMessage,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method
    };

    // Em desenvolvimento, incluir mais detalhes
    if (!isProduction) {
      baseResponse.details = {
        name: error.name,
        stack: error.stack,
        originalMessage: error.message
      };
    }

    // Adicionar ID de correlação se disponível
    if (req.correlationId) {
      baseResponse.correlationId = req.correlationId;
    }

    return { statusCode, response: baseResponse };
  }
}

/**
 * Middleware principal de tratamento de erros
 */
const errorHandler = (error, req, res, next) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Log do erro detalhado
  console.error('Erro capturado:', {
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    user: req.user?.id || 'anonymous',
    timestamp: new Date().toISOString()
  });

  // Log de auditoria para erros críticos
  if (ErrorHandler.isCriticalError(error)) {
    SecurityAuditLogger.logSuspiciousActivity(req, 'CRITICAL_ERROR', {
      errorName: error.name,
      errorMessage: error.message,
      stack: error.stack
    }).catch(auditError => {
      console.error('Erro ao registrar auditoria de erro crítico:', auditError);
    });
  }

  // Formatar resposta
  const { statusCode, response } = ErrorHandler.formatErrorResponse(error, req, isProduction);

  // Enviar resposta
  res.status(statusCode).json(response);
};

/**
 * Middleware para capturar erros assíncronos
 */
const asyncErrorHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Middleware para tratar 404 (rotas não encontradas)
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Rota não encontrada: ${req.method} ${req.path}`);
  error.name = 'NotFoundError';
  error.statusCode = 404;
  
  // Log de tentativa de acesso a rota inexistente
  SecurityAuditLogger.logSuspiciousActivity(req, 'ROUTE_NOT_FOUND', {
    attemptedRoute: `${req.method} ${req.path}`,
    queryParams: req.query
  }).catch(auditError => {
    console.error('Erro ao registrar tentativa de rota inexistente:', auditError);
  });

  next(error);
};

/**
 * Middleware para adicionar ID de correlação às requisições
 */
const correlationIdMiddleware = (req, res, next) => {
  // Gerar ID único para a requisição
  req.correlationId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Adicionar aos headers de resposta
  res.setHeader('X-Correlation-ID', req.correlationId);
  
  next();
};

/**
 * Middleware para validação de entrada básica
 */
const inputValidationMiddleware = (req, res, next) => {
  try {
    // Validar tamanho do corpo da requisição
    const bodySize = JSON.stringify(req.body || {}).length;
    if (bodySize > 1024 * 1024) { // 1MB
      const error = new Error('Corpo da requisição muito grande');
      error.name = 'ValidationError';
      error.statusCode = 413;
      throw error;
    }

    // Validar presença de campos obrigatórios baseado na rota
    if (req.method === 'POST' || req.method === 'PUT') {
      if (req.path.includes('/auth/login') && (!req.body.email || !req.body.password)) {
        const error = new Error('Email e senha são obrigatórios');
        error.name = 'ValidationError';
        error.statusCode = 400;
        throw error;
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  ErrorHandler,
  errorHandler,
  asyncErrorHandler,
  notFoundHandler,
  correlationIdMiddleware,
  inputValidationMiddleware
};
