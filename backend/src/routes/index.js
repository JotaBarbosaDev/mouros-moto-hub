// Arquivo de agregação de rotas
const express = require('express');
const router = express.Router();

// Importar todas as rotas
const membersRoutes = require('./members');
const vehiclesRoutes = require('./vehicles');
const activityLogsRoutes = require('./activity-logs');

// Registrar rotas
router.use('/members', membersRoutes);
router.use('/vehicles', vehiclesRoutes);
router.use('/logs', activityLogsRoutes);

module.exports = router;
