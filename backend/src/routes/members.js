// Rotas para gerenciamento de membros
const express = require('express');
const membersController = require('../controllers/members');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// Aplicar middleware de autenticação em rotas protegidas
const protectedRoutes = [router.route('/'), router.route('/:id')];
protectedRoutes.forEach(route => {
  route.all(authMiddleware.authenticate);
});

// Obter todos os membros
router.get('/', membersController.getAllMembers);

// Obter membro específico por ID
router.get('/:id', membersController.getMemberById);

// Criar novo membro (apenas administradores)
router.post('/', authMiddleware.isAdmin, membersController.createMember);

// Atualizar membro existente
router.put('/:id', membersController.updateMember);

// Atualização parcial (PATCH)
router.patch('/:id', membersController.updateMember);

// Excluir membro (apenas administradores)
router.delete('/:id', authMiddleware.isAdmin, membersController.deleteMember);

module.exports = router;
