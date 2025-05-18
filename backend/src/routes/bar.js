// Rotas para gerenciamento de bar
const express = require('express');
const barController = require('../controllers/bar');
const authMiddleware = require('../middlewares/auth');
const { logActivity } = require('../middleware/activity-logger');

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas do bar
router.use(authMiddleware.authenticate);

// Rotas para produtos do bar
router.get('/products', 
  logActivity({ entityType: 'BAR_PRODUCT' }),
  barController.getAllProducts
);

router.get('/products/:id', 
  logActivity({ entityType: 'BAR_PRODUCT', getEntityId: (req) => req.params.id }),
  barController.getProductById
);

router.post('/products', 
  logActivity({ entityType: 'BAR_PRODUCT' }),
  barController.createProduct
);

router.put('/products/:id', 
  logActivity({ entityType: 'BAR_PRODUCT', getEntityId: (req) => req.params.id }),
  barController.updateProduct
);

router.delete('/products/:id', 
  logActivity({ entityType: 'BAR_PRODUCT', getEntityId: (req) => req.params.id }),
  barController.deleteProduct
);

router.patch('/products/:id/stock', 
  logActivity({ entityType: 'BAR_PRODUCT', getEntityId: (req) => req.params.id }),
  barController.updateProductStock
);

// Rotas para vendas do bar
router.get('/sales', 
  logActivity({ entityType: 'BAR_SALE' }),
  barController.getAllSales
);

router.get('/sales/:id', 
  logActivity({ entityType: 'BAR_SALE', getEntityId: (req) => req.params.id }),
  barController.getSaleById
);

router.post('/sales', 
  logActivity({ entityType: 'BAR_SALE' }),
  barController.createSale
);

router.put('/sales/:id', 
  logActivity({ entityType: 'BAR_SALE', getEntityId: (req) => req.params.id }),
  barController.updateSale
);

router.delete('/sales/:id', 
  logActivity({ entityType: 'BAR_SALE', getEntityId: (req) => req.params.id }),
  barController.deleteSale
);

// Exportar o router
module.exports = router;
