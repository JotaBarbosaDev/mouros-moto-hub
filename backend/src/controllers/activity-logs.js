// Controlador para gerenciamento de logs de atividades
const activityLogService = require('../services/activity-log-service');

// Obter logs com filtragem
const getLogs = async (req, res) => {
  try {
    // Construir filtros a partir dos parâmetros da requisição
    const filters = {
      userId: req.query.userId,
      action: req.query.action,
      entityType: req.query.entityType,
      entityId: req.query.entityId,
      fromDate: req.query.fromDate,
      toDate: req.query.toDate,
      limit: req.query.limit ? parseInt(req.query.limit) : 50,
      offset: req.query.offset ? parseInt(req.query.offset) : 0
    };

    const logs = await activityLogService.getLogs(filters);
    res.json(logs);
  } catch (error) {
    console.error('Erro ao obter logs:', error);
    res.status(500).json({
      error: 'Erro ao consultar logs',
      details: error.message
    });
  }
};

// Obter logs recentes
const getRecentLogs = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    const logs = await activityLogService.getRecentLogs(limit);
    res.json(logs);
  } catch (error) {
    console.error('Erro ao obter logs recentes:', error);
    res.status(500).json({
      error: 'Erro ao consultar logs recentes',
      details: error.message
    });
  }
};

// Obter logs de uma entidade específica
const getEntityLogs = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit) : 50;
    
    const logs = await activityLogService.getEntityLogs(entityType, entityId, limit);
    res.json(logs);
  } catch (error) {
    console.error('Erro ao obter logs da entidade:', error);
    res.status(500).json({
      error: 'Erro ao consultar logs da entidade',
      details: error.message
    });
  }
};

// Exportar controladores para uso nas rotas
module.exports = {
  getLogs,
  getRecentLogs,
  getEntityLogs
};
