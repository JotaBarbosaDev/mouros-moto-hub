// Middleware de rate limiting e throttling para APIs
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

/**
 * Rate limiter geral para APIs
 * Limite adaptável baseado no ambiente
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 1000 em dev, 100 em prod
  message: {
    error: 'Muitas requisições',
    details: 'Você excedeu o limite de requisições. Tente novamente em 15 minutos.',
    retryAfter: '15 minutos'
  },
  standardHeaders: true, // Retorna rate limit info nos headers `RateLimit-*`
  legacyHeaders: false, // Desabilita headers `X-RateLimit-*`
  handler: (req, res) => {
    res.status(429).json({
      error: 'Rate limit excedido',
      details: 'Muitas requisições do seu IP. Tente novamente em 15 minutos.',
      retryAfter: Math.round(req.rateLimit.resetTime - Date.now() / 1000)
    });
  }
});

/**
 * Rate limiter para autenticação
 * Limite adaptável baseado no ambiente
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'production' ? 5 : 50, // 50 em dev, 5 em prod
  message: {
    error: 'Muitas tentativas de autenticação',
    details: 'Você excedeu o limite de tentativas de login. Tente novamente em 15 minutos.',
    retryAfter: '15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Não conta requisições bem-sucedidas
  handler: (req, res) => {
    res.status(429).json({
      error: 'Muitas tentativas de login',
      details: 'Você excedeu o limite de tentativas de autenticação. Tente novamente em 15 minutos.',
      retryAfter: Math.round(req.rateLimit.resetTime - Date.now() / 1000)
    });
  }
});

/**
 * Rate limiter para criação de recursos
 * Limite adaptável baseado no ambiente
 */
const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: process.env.NODE_ENV === 'production' ? 20 : 200, // 200 em dev, 20 em prod
  message: {
    error: 'Muitas criações',
    details: 'Você excedeu o limite de criação de recursos. Tente novamente em 1 hora.',
    retryAfter: '1 hora'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Limite de criação excedido',
      details: 'Você excedeu o limite de criação de recursos. Tente novamente em 1 hora.',
      retryAfter: Math.round(req.rateLimit.resetTime - Date.now() / 1000)
    });
  }
});

/**
 * Rate limiter para operações administrativas
 * Limite adaptável baseado no ambiente
 */
const adminLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: process.env.NODE_ENV === 'production' ? 50 : 500, // 500 em dev, 50 em prod
  message: {
    error: 'Muitas operações administrativas',
    details: 'Você excedeu o limite de operações administrativas. Tente novamente em 1 hora.',
    retryAfter: '1 hora'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Limite administrativo excedido',
      details: 'Você excedeu o limite de operações administrativas. Tente novamente em 1 hora.',
      retryAfter: Math.round(req.rateLimit.resetTime - Date.now() / 1000)
    });
  }
});

/**
 * Throttling progressivo para APIs intensivas
 * Reduz a velocidade de resposta conforme aumenta o número de requisições
 */
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutos
  delayAfter: 50, // Após 50 requests na janela, começar a atrasar
  delayMs: (used, req) => (used - 50) * 500, // Função de delay progressivo
  maxDelayMs: 5000, // Delay máximo de 5 segundos
});

/**
 * Rate limiter específico para busca/consulta
 * Limite adaptável baseado no ambiente
 */
const searchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'production' ? 200 : 2000, // 2000 em dev, 200 em prod
  message: {
    error: 'Muitas consultas',
    details: 'Você excedeu o limite de consultas. Tente novamente em 15 minutos.',
    retryAfter: '15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Limite de consultas excedido',
      details: 'Você excedeu o limite de consultas. Tente novamente em 15 minutos.',
      retryAfter: Math.round(req.rateLimit.resetTime - Date.now() / 1000)
    });
  }
});

module.exports = {
  generalLimiter,
  authLimiter,
  createLimiter,
  adminLimiter,
  speedLimiter,
  searchLimiter
};
