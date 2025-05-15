// Servidor Express principal para o backend
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

// Importar rotas
const membersRoutes = require('./routes/members');
const authRoutes = require('./routes/auth');
const vehiclesRoutes = require('./routes/vehicles');
const barRoutes = require('./routes/bar');
const eventsRoutes = require('./routes/events');
const adminRoutes = require('./routes/admin');
const inventoryRoutes = require('./routes/inventory');
const activityLogsRoutes = require('./routes/activity-logs');

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

// Carregar documentação Swagger
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));

// Configuração de CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:8080'];
app.use(cors({
  origin: function (origin, callback) {
    // Permitir requisições sem origem (como chamadas de API diretamente do navegador)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`Origem bloqueada pelo CORS: ${origin}`);
      callback(new Error(`Bloqueado pelo CORS. Origem: ${origin} não está na lista de origens permitidas: ${allowedOrigins.join(', ')}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos para teste
app.use(express.static(path.join(__dirname, '../public')));

// Rotas de API
app.use('/api/members', membersRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehiclesRoutes);
app.use('/api/bar', barRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/activity-logs', activityLogsRoutes);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rota de verificação de saúde
app.get('/api/health', (req, res) => {
  res.json({ 
    status: "ok",
    message: "API está funcionando!",
    timestamp: new Date().toISOString() 
  });
});

// Rota principal
app.get('/', (req, res) => {
  res.json({
    message: 'Mouros Moto Hub API',
    docs: '/api-docs',
    version: '1.0.0'
  });
});

// Tratamento de erros global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: err.message
  });
});

// Iniciar o servidor
app.listen(PORT, HOST, () => {
  console.log(`Servidor rodando em http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
  console.log(`Documentação Swagger disponível em http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}/api-docs`);
});
