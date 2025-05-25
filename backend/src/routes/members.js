// Rotas para gerenciamento de membros
const express = require('express');
const membersController = require('../controllers/members');
const authMiddleware = require('../middlewares/auth');
const { logActivity } = require('../middleware/activity-logger');
const { auditMembers } = require('../middleware/advanced-audit');

const router = express.Router();

// Aplicar middleware de autenticação em rotas protegidas
const protectedRoutes = [router.route('/'), router.route('/:id')];
protectedRoutes.forEach(route => {
  route.all(authMiddleware.authenticate);
});

// Obter todos os membros
router.get('/', 
  auditMembers,
  logActivity({ entityType: 'MEMBER' }),
  membersController.getAllMembers
);

// Obter membro específico por ID
router.get('/:id', 
  auditMembers,
  logActivity({ entityType: 'MEMBER', getEntityId: (req) => req.params.id }),
  membersController.getMemberById
);

// Criar novo membro (apenas administradores)
router.post('/', 
  authMiddleware.isAdmin,
  auditMembers,
  logActivity({ entityType: 'MEMBER' }),
  membersController.createMember
);

// Atualizar membro existente
router.put('/:id', 
  auditMembers,
  logActivity({ entityType: 'MEMBER', getEntityId: (req) => req.params.id }),
  membersController.updateMember
);

// Atualização parcial (PATCH)
router.patch('/:id', 
  auditMembers,
  logActivity({ entityType: 'MEMBER', getEntityId: (req) => req.params.id }),
  membersController.updateMember
);

// Excluir membro (apenas administradores)
router.delete('/:id', 
  authMiddleware.isAdmin,
  auditMembers,
  logActivity({ entityType: 'MEMBER', getEntityId: (req) => req.params.id }),
  membersController.deleteMember
);

module.exports = router;
