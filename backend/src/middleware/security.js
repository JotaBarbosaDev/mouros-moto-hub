// Middleware de segurança geral para proteção de headers e configurações
const helmet = require('helmet');
const morgan = require('morgan');

/**
 * Configuração do Helmet para headers de segurança
 */
const securityHeaders = helmet({
  // Habilitar HSTS (HTTP Strict Transport Security)
  hsts: {
    maxAge: 31536000, // 1 ano
    includeSubDomains: true,
    preload: true
  },
  
  // Configurar Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://*.supabase.co'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  
  // Outras configurações de segurança
  crossOriginEmbedderPolicy: false, // Pode interferir com APIs
  crossOriginResourcePolicy: { policy: "cross-origin" },
  
  // Remover headers que revelam informações do servidor
  hidePoweredBy: true,
  
  // Configurar referrer policy
  referrerPolicy: { policy: "same-origin" },
  
  // Prevenir MIME type sniffing
  noSniff: true,
  
  // Configurar X-Frame-Options
  frameguard: { action: 'deny' },
  
  // Prevenir ataques XSS
  xssFilter: true
});

/**
 * Configuração de logging de acesso
 */
const accessLogger = morgan('combined', {
  // Log apenas erros 4xx e 5xx
  skip: function (req, res) {
    return res.statusCode < 400;
  }
});

/**
 * Log de todas as requisições em desenvolvimento
 */
const devLogger = morgan('dev');

/**
 * Middleware personalizado para adicionar headers de segurança específicos
 */
const customSecurityHeaders = (req, res, next) => {
  // Adicionar header personalizado para identificar a API
  res.setHeader('X-API-Version', '1.0.0');
  
  // Controlar cache para APIs sensíveis
  if (req.path.includes('/auth') || req.path.includes('/admin')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  // Headers adicionais de segurança
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  
  next();
};

/**
 * Middleware para sanitização básica de entrada
 */
const inputSanitizer = (req, res, next) => {
  // Sanitizar headers perigosos
  const dangerousHeaders = ['x-forwarded-host', 'x-forwarded-server'];
  dangerousHeaders.forEach(header => {
    if (req.headers[header]) {
      delete req.headers[header];
    }
  });
  
  // Limitar tamanho do corpo da requisição (já configurado no express.json)
  // Mas podemos adicionar validação adicional aqui se necessário
  
  next();
};

/**
 * Middleware para detectar tentativas de ataque
 */
const attackDetection = (req, res, next) => {
  const userAgent = req.get('User-Agent') || '';
  const referer = req.get('Referer') || '';
  
  // Detectar user agents suspeitos
  const suspiciousPatterns = [
    /sqlmap/i,
    /nikto/i,
    /nessus/i,
    /openvas/i,
    /burp/i,
    /scanner/i,
    /crawl/i
  ];
  
  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(userAgent) || pattern.test(referer)
  );
  
  if (isSuspicious) {
    console.warn(`Atividade suspeita detectada - IP: ${req.ip}, User-Agent: ${userAgent}`);
    return res.status(403).json({
      error: 'Acesso negado',
      details: 'Atividade suspeita detectada'
    });
  }
  
  next();
};

module.exports = {
  securityHeaders,
  accessLogger,
  devLogger,
  customSecurityHeaders,
  inputSanitizer,
  attackDetection
};
