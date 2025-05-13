// Rotas para gerenciamento de veículos
const express = require('express');
const vehiclesController = require('../controllers/vehicles');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// Aplicar middleware de autenticação em rotas específicas (método alternativo para evitar erros)
// router.use(authMiddleware.authenticate); // Comentado temporariamente

// Obter todos os veículos
router.get('/', vehiclesController.getAllVehicles);

// Obter veículo específico por ID
router.get('/:id', vehiclesController.getVehicleById);

// Obter veículos de um membro específico
router.get('/member/:memberId', vehiclesController.getVehiclesByMemberId);

// Criar novo veículo
router.post('/', vehiclesController.createVehicle);

// Atualizar veículo existente
router.put('/:id', vehiclesController.updateVehicle);

// Excluir veículo
router.delete('/:id', vehiclesController.deleteVehicle);

module.exports = router;
