// Rotas para gerenciamento de bar
const express = require('express');
const barController = require('../controllers/bar');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas do bar
router.use(authMiddleware.authenticate);

// Rotas para produtos do bar
router.get('/products', barController.getAllProducts);
router.get('/products/:id', barController.getProductById);
router.post('/products', barController.createProduct);
router.put('/products/:id', barController.updateProduct);
router.delete('/products/:id', barController.deleteProduct);
router.patch('/products/:id/stock', barController.updateProductStock);

// Rotas para vendas do bar
router.get('/sales', barController.getAllSales);
router.get('/sales/:id', barController.getSaleById);
router.post('/sales', barController.createSale);
router.put('/sales/:id', barController.updateSale);
router.delete('/sales/:id', barController.deleteSale);

// Exportar o router
module.exports = router;
