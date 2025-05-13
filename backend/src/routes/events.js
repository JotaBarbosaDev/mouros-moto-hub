// Rotas para gerenciamento de eventos
const express = require('express');
const eventsController = require('../controllers/events');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas de eventos
router.use(authMiddleware.authenticate);

// Rotas para eventos
router.get('/', eventsController.getAllEvents);
router.get('/:id', eventsController.getEventById);
router.post('/', eventsController.createEvent);
router.put('/:id', eventsController.updateEvent);
router.delete('/:id', eventsController.deleteEvent);

// Rotas para participantes de eventos
router.get('/:id/participants', eventsController.getEventParticipants);
router.post('/:id/participants', eventsController.addEventParticipant);
router.delete('/:id/participants/:memberId', eventsController.removeEventParticipant);

// Exportar o router
module.exports = router;
