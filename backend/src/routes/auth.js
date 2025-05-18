// Rotas para autenticação
const express = require('express');
const authController = require('../controllers/auth');
const authMiddleware = require('../middlewares/auth');
const { logAuthActivity } = require('../middleware/auth-logger');

const router = express.Router();

// Rota de login
router.post('/login', logAuthActivity('LOGIN'), authController.login);

// Rota de registro (pode ser desativada em produção se o registro for apenas administrativo)
router.post('/register', logAuthActivity('REGISTER'), authController.register);

// Rota de logout (não é realmente necessária com JWT, mas mantida para consistência)
router.post('/logout', logAuthActivity('LOGOUT'), authController.logout);

// Rota protegida para obter o perfil do usuário atual
router.get('/me', authMiddleware.authenticate, authController.getProfile);

module.exports = router;
