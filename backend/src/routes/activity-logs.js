// Rotas para logs de atividades
const express = require('express');
const router = express.Router();
const activityLogsController = require('../controllers/activity-logs');
const authMiddleware = require('../middlewares/auth');

// Todas as rotas de logs exigem autenticação e permissão de administrador
router.use(authMiddleware.authenticate);
router.use(authMiddleware.isAdmin);

// Obter todos os logs (com filtragem)
router.get('/', activityLogsController.getLogs);

// Obter logs recentes
router.get('/recent', activityLogsController.getRecentLogs);

// Obter logs de uma entidade específica
router.get('/:entityType/:entityId', activityLogsController.getEntityLogs);

module.exports = router;
