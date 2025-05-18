// Rotas para administração
const express = require('express');
const authMiddleware = require('../middlewares/auth');
const { logActivity } = require('../middleware/activity-logger');

const router = express.Router();

// Aplicar middleware de autenticação e verificação de admin
router.use(authMiddleware.authenticate);
router.use(authMiddleware.isAdmin);

// Rota temporária
router.get('/', 
  logActivity({ entityType: 'ADMIN' }),
  (req, res) => {
    res.status(200).json({ message: 'Rota de administração - em desenvolvimento' });
  }
);

// Exportar o router
module.exports = router;
