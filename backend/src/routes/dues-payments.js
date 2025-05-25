// Rotas para gerenciamento de pagamentos de quotas
const express = require('express');
const duesPaymentsController = require('../controllers/dues-payments');
const authMiddleware = require('../middlewares/auth');
const { logActivity } = require('../middleware/activity-logger');
const { auditFinancial } = require('../middleware/advanced-audit');

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas de pagamentos de quotas
router.use(authMiddleware.authenticate);

// Obter todos os pagamentos de quotas
router.get('/', 
  auditFinancial,
  logActivity({ entityType: 'DUES_PAYMENT' }),
  duesPaymentsController.getAllDuesPayments
);

// Obter pagamentos de quotas de um membro específico
// IMPORTANTE: Rotas mais específicas devem vir antes das rotas mais genéricas
router.get('/member/:memberId', 
  auditFinancial,
  logActivity({ entityType: 'MEMBER', getEntityId: (req) => req.params.memberId }),
  duesPaymentsController.getDuesPaymentsByMemberId
);

// Obter pagamento de quota específico por ID
router.get('/:id', 
  auditFinancial,
  logActivity({ entityType: 'DUES_PAYMENT', getEntityId: (req) => req.params.id }),
  duesPaymentsController.getDuesPaymentById
);

// Criar novo pagamento de quota
router.post('/', 
  logActivity({ entityType: 'DUES_PAYMENT' }),
  duesPaymentsController.createDuesPayment
);

// Atualizar pagamento de quota existente
router.put('/:id', 
  logActivity({ entityType: 'DUES_PAYMENT', getEntityId: (req) => req.params.id }),
  duesPaymentsController.updateDuesPayment
);

// Excluir pagamento de quota
router.delete('/:id', 
  logActivity({ entityType: 'DUES_PAYMENT', getEntityId: (req) => req.params.id }),
  duesPaymentsController.deleteDuesPayment
);

module.exports = router;
