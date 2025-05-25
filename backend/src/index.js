// Servidor Express principal para o backend
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const { ensureVehicleColumns } = require('./utils/fix-columns');

// Importar middlewares de segurança
const { generalLimiter, authLimiter, createLimiter, adminLimiter, searchLimiter } = require('./middleware/rate-limiter');
const { securityHeaders, accessLogger, devLogger, customSecurityHeaders, inputSanitizer, attackDetection } = require('./middleware/security');
const { errorHandler, notFoundHandler, correlationIdMiddleware, inputValidationMiddleware } = require('./middleware/error-handler');

// Importar rotas
const membersRoutes = require('./routes/members');
const authRoutes = require('./routes/auth');
const vehiclesRoutes = require('./routes/vehicles');
const barRoutes = require('./routes/bar');
const eventsRoutes = require('./routes/events');
const adminRoutes = require('./routes/admin');
const inventoryRoutes = require('./routes/inventory');
const activityLogsRoutes = require('./routes/activity-logs');
const duesPaymentsRoutes = require('./routes/dues-payments');
const auditRoutes = require('./routes/audit');

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';
const isProduction = process.env.NODE_ENV === 'production';

// Carregar documentação Swagger
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));

// ===== MIDDLEWARES DE SEGURANÇA =====

// 1. Headers de segurança (deve vir primeiro)
app.use(securityHeaders);
app.use(customSecurityHeaders);

// 2. Middleware de correlação de ID para tracking
app.use(correlationIdMiddleware);

// 3. Logging de acesso
if (isProduction) {
  app.use(accessLogger); // Log apenas erros em produção
} else {
  app.use(devLogger); // Log completo em desenvolvimento
}

// 4. Middlewares de segurança de entrada
app.use(inputSanitizer);
app.use(attackDetection);

// 5. Rate limiting global (aplicado de forma condicional)
if (process.env.NODE_ENV === 'production') {
  app.use(generalLimiter);
  console.log('🛡️  Rate limiting global ativado (modo produção)');
} else {
  console.log('🔧 Rate limiting global desativado (modo desenvolvimento)');
}

// ===== CONFIGURAÇÃO DE CORS =====
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:5173', 
  'http://localhost:8080', 
  'http://localhost:8081', 
  'http://localhost:8082', 
  'http://localhost:8083',
  'http://localhost:3000',
  'http://127.0.0.1:8080',
  'http://127.0.0.1:5173'
];

console.log('🌐 CORS configurado para as seguintes origens:', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requisições sem origem (como chamadas de API diretamente do navegador ou Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`⚠️  Origem bloqueada pelo CORS: ${origin}`);
      console.log(`   Origens permitidas: ${allowedOrigins.join(', ')}`);
      callback(new Error(`Bloqueado pelo CORS. Origem: ${origin} não está na lista de origens permitidas: ${allowedOrigins.join(', ')}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  optionsSuccessStatus: 200, // Para suportar browsers antigos
  preflightContinue: false
}));

// ===== MIDDLEWARES PADRÃO =====
app.use(express.json({ limit: '10mb' })); // Limite de 10MB para o corpo das requisições
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(inputValidationMiddleware);

// Servir arquivos estáticos para teste
app.use(express.static(path.join(__dirname, '../public')));

// ===== ROTAS DE API COM RATE LIMITING ESPECÍFICO =====

// Rotas de autenticação com rate limiting restritivo
app.use('/api/auth', authLimiter, authRoutes);

// Rotas administrativas com rate limiting específico
app.use('/api/admin', adminLimiter, adminRoutes);

// Rotas que envolvem criação de recursos (rate limiting só em produção)
const applyCreateLimiter = process.env.NODE_ENV === 'production' ? createLimiter : (req, res, next) => next();
app.use('/api/members', applyCreateLimiter, membersRoutes);
app.use('/api/vehicles', applyCreateLimiter, vehiclesRoutes);
app.use('/api/events', applyCreateLimiter, eventsRoutes);
app.use('/api/dues-payments', applyCreateLimiter, duesPaymentsRoutes);

// Rotas de consulta com rate limiting mais permissivo (só em produção)
const applySearchLimiter = process.env.NODE_ENV === 'production' ? searchLimiter : (req, res, next) => next();
app.use('/api/bar', applySearchLimiter, barRoutes);
app.use('/api/inventory', applySearchLimiter, inventoryRoutes);
app.use('/api/activity-logs', applySearchLimiter, activityLogsRoutes);

// Rotas de auditoria com rate limiting específico para admins
app.use('/api/audit', adminLimiter, auditRoutes);

// ===== ROTAS UTILITÁRIAS =====

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rota de verificação de saúde (sem rate limiting)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: "ok",
    message: "API está funcionando!",
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    cors: {
      allowedOrigins: allowedOrigins
    },
    rateLimiting: {
      enabled: process.env.NODE_ENV === 'production',
      mode: process.env.NODE_ENV === 'production' ? 'strict' : 'permissive'
    }
  });
});

// Rota para resetar rate limits (apenas em desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
  app.post('/api/dev/reset-rate-limits', (req, res) => {
    try {
      // Esta é uma funcionalidade para desenvolvimento apenas
      res.json({
        message: 'Rate limits resetados com sucesso (modo desenvolvimento)',
        timestamp: new Date().toISOString(),
        note: 'Esta funcionalidade só está disponível em desenvolvimento'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Erro ao resetar rate limits',
        details: error.message
      });
    }
  });
}

// Rota principal
app.get('/', (req, res) => {
  res.json({
    message: 'Mouros Moto Hub API',
    docs: '/api-docs',
    version: '1.0.0',
    security: {
      rateLimit: 'Enabled',
      cors: 'Configured',
      headers: 'Secured'
    }
  });
});

// ===== TRATAMENTO DE ERROS =====

// Middleware para rotas não encontradas
app.use(notFoundHandler);

// Middleware de tratamento de erros global (deve ser o último)
app.use(errorHandler);

// ===== INICIALIZAÇÃO DO SERVIDOR =====

// Verificar e corrigir problemas com colunas antes de iniciar o servidor
console.log('🔧 Verificando a estrutura das tabelas do banco de dados...');
ensureVehicleColumns()
  .then(() => {
    console.log('✅ Verificação de tabelas concluída.');
    console.log('🔒 Configurações de segurança aplicadas:');
    console.log('   - Rate limiting configurado');
    console.log('   - Headers de segurança aplicados');
    console.log('   - Middleware de auditoria ativo');
    console.log('   - Tratamento centralizado de erros ativo');
    
    // Iniciar o servidor
    app.listen(PORT, HOST, () => {
      console.log(`🚀 Servidor rodando em http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
      console.log(`📚 Documentação Swagger disponível em http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}/api-docs`);
      console.log(`🛡️  Modo de segurança: ${isProduction ? 'PRODUÇÃO' : 'DESENVOLVIMENTO'}`);
    });
  })
  .catch(error => {
    console.error('❌ Erro ao verificar tabelas:', error);
    console.log('⚠️  Iniciando servidor mesmo com erros nas tabelas...');
    
    // Iniciar o servidor mesmo em caso de erro na verificação
    app.listen(PORT, HOST, () => {
      console.log(`🚀 Servidor rodando em http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
      console.log(`📚 Documentação Swagger disponível em http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}/api-docs`);
      console.log(`🛡️  Modo de segurança: ${isProduction ? 'PRODUÇÃO' : 'DESENVOLVIMENTO'}`);
    });
  });
