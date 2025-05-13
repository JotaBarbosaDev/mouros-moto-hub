// Rotas para administração
const express = require('express');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// Aplicar middleware de autenticação e verificação de admin
// router.use(authMiddleware.authenticate); // Comentado para evitar erros durante desenvolvimento
// router.use(authMiddleware.isAdmin); // Comentado para evitar erros durante desenvolvimento

// Rota temporária
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Rota de administração - em desenvolvimento' });
});

// Exportar o router
module.exports = router;
