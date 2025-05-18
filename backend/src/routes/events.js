// Rotas para gerenciamento de eventos
const express = require('express');
const eventsController = require('../controllers/events');
const authMiddleware = require('../middlewares/auth');
const { logActivity } = require('../middleware/activity-logger');

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas de eventos
router.use(authMiddleware.authenticate);

// Rotas para eventos
router.get('/', 
  logActivity({ entityType: 'EVENT' }),
  eventsController.getAllEvents
);

router.get('/:id', 
  logActivity({ entityType: 'EVENT', getEntityId: (req) => req.params.id }),
  eventsController.getEventById
);

router.post('/', 
  logActivity({ entityType: 'EVENT' }),
  eventsController.createEvent
);

router.put('/:id', 
  logActivity({ entityType: 'EVENT', getEntityId: (req) => req.params.id }),
  eventsController.updateEvent
);

router.delete('/:id', 
  logActivity({ entityType: 'EVENT', getEntityId: (req) => req.params.id }),
  eventsController.deleteEvent
);

// Rotas para participantes de eventos
router.get('/:id/participants', 
  logActivity({ entityType: 'EVENT_PARTICIPANT', getEntityId: (req) => req.params.id }),
  eventsController.getEventParticipants
);

router.post('/:id/participants', 
  logActivity({ entityType: 'EVENT_PARTICIPANT', getEntityId: (req) => req.params.id }),
  eventsController.addEventParticipant
);

router.delete('/:id/participants/:memberId', 
  logActivity({ 
    entityType: 'EVENT_PARTICIPANT', 
    getEntityId: (req) => `${req.params.id}_${req.params.memberId}`
  }),
  eventsController.removeEventParticipant
);

// Exportar o router
module.exports = router;
