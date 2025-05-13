// Rotas para gerenciamento de inventário
const express = require('express');
const inventoryController = require('../controllers/inventory');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// Aplicar middleware de autenticação para rotas específicas (método alternativo para evitar erros)
// router.use(authMiddleware.authenticate); // Comentado temporariamente

// Itens do inventário
router.get('/', inventoryController.getAllItems);
router.get('/:id', inventoryController.getItemById);
router.post('/', inventoryController.createItem);
router.put('/:id', inventoryController.updateItem);
router.delete('/:id', inventoryController.deleteItem);

// Operações de quantidade
router.post('/:id/add', inventoryController.addQuantity);
router.post('/:id/remove', inventoryController.removeQuantity);

// Histórico de movimentações
router.get('/:id/history', inventoryController.getItemHistory);

module.exports = router;
