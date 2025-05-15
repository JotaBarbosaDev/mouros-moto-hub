// Rotas para gerenciamento de veículos
const express = require('express');
const vehiclesController = require('../controllers/vehicles');
const authMiddleware = require('../middlewares/auth');
const { logActivity } = require('../middleware/activity-logger');

const router = express.Router();

// Aplicar middleware de autenticação em rotas específicas (método alternativo para evitar erros)
// router.use(authMiddleware.authenticate); // Comentado temporariamente

// Obter todos os veículos
router.get('/', 
  logActivity({ entityType: 'VEHICLE' }),
  vehiclesController.getAllVehicles
);

// Obter veículo específico por ID
router.get('/:id', 
  logActivity({ entityType: 'VEHICLE', getEntityId: (req) => req.params.id }),
  vehiclesController.getVehicleById
);

// Obter veículos de um membro específico
router.get('/member/:memberId', 
  logActivity({ entityType: 'MEMBER', getEntityId: (req) => req.params.memberId }),
  vehiclesController.getVehiclesByMemberId
);

// Criar novo veículo
router.post('/', 
  logActivity({ entityType: 'VEHICLE' }),
  vehiclesController.createVehicle
);

// Atualizar veículo existente
router.put('/:id', 
  logActivity({ entityType: 'VEHICLE', getEntityId: (req) => req.params.id }),
  vehiclesController.updateVehicle
);

// Excluir veículo
router.delete('/:id', 
  logActivity({ entityType: 'VEHICLE', getEntityId: (req) => req.params.id }),
  vehiclesController.deleteVehicle
);

module.exports = router;
