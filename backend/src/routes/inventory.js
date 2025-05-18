// Rotas para gerenciamento de inventário
const express = require('express');
const inventoryController = require('../controllers/inventory');
const authMiddleware = require('../middlewares/auth');
const { logActivity } = require('../middleware/activity-logger');

const router = express.Router();

// Aplicar middleware de autenticação para rotas específicas (método alternativo para evitar erros)
router.use(authMiddleware.authenticate);

// Itens do inventário
router.get('/', 
  logActivity({ entityType: 'INVENTORY' }),
  inventoryController.getAllItems
);

router.get('/:id', 
  logActivity({ entityType: 'INVENTORY', getEntityId: (req) => req.params.id }),
  inventoryController.getItemById
);

router.post('/', 
  logActivity({ entityType: 'INVENTORY' }),
  inventoryController.createItem
);

router.put('/:id', 
  logActivity({ entityType: 'INVENTORY', getEntityId: (req) => req.params.id }),
  inventoryController.updateItem
);

router.delete('/:id', 
  logActivity({ entityType: 'INVENTORY', getEntityId: (req) => req.params.id }),
  inventoryController.deleteItem
);

// Operações de quantidade
router.post('/:id/add', 
  logActivity({ entityType: 'INVENTORY', getEntityId: (req) => req.params.id }),
  inventoryController.addQuantity
);

router.post('/:id/remove', 
  logActivity({ entityType: 'INVENTORY', getEntityId: (req) => req.params.id }),
  inventoryController.removeQuantity
);

// Histórico de movimentações
router.get('/:id/history', 
  logActivity({ entityType: 'INVENTORY_HISTORY', getEntityId: (req) => req.params.id }),
  inventoryController.getItemHistory
);

module.exports = router;
