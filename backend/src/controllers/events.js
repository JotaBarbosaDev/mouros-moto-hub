// Controlador para gerenciamento de eventos
const { supabase } = require('../config/supabase');
const activityLogService = require('../services/activity-log-service');

// Obter todos os eventos
exports.getAllEvents = async (req, res) => {
  try {
    // Opcionalmente filtrar por data (eventos futuros)
    const { future, past, limit } = req.query;
    let query = supabase.from('events').select('*');

    const today = new Date().toISOString();
    
    // Filtrar por eventos futuros ou passados, se solicitado
    if (future === 'true') {
      query = query.gte('start_date', today);
    } else if (past === 'true') {
      query = query.lt('start_date', today);
    }
    
    // Ordenar por data
    query = query.order('start_date', { ascending: future === 'true' });
    
    // Limitar resultados se solicitado
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data, error } = await query;

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    res.status(500).json({ error: 'Erro ao buscar eventos', details: error.message });
  }
};

// Obter evento específico pelo ID
exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar o evento
    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (!event) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }
    
    res.status(200).json(event);
  } catch (error) {
    console.error(`Erro ao buscar evento ${req.params.id}:`, error);
    res.status(500).json({ error: 'Erro ao buscar evento', details: error.message });
  }
};

// Criar novo evento
exports.createEvent = async (req, res) => {
  try {
    console.log('[DEBUG] Recebendo requisição para criar evento:', req.body);
    
    // Compatibilidade com formato do frontend: aceita tanto camelCase quanto snake_case
    const eventData = {
      title: req.body.title,
      description: req.body.description,
      location: req.body.location,
      start_date: req.body.start_date || req.body.startDate,
      end_date: req.body.end_date || req.body.endDate,
      type: req.body.type || 'encontro',
      image_url: req.body.image_url || req.body.imageUrl || req.body.image,
      created_by: req.body.creator_id || req.body.creatorId || req.user?.id,
      capacity: req.body.capacity || req.body.max_participants,
      price: req.body.price || 0,
      registration_deadline: req.body.registration_deadline || req.body.registrationDeadline,
      is_public: req.body.is_public !== undefined ? req.body.is_public : (req.body.isPublic !== false), // padrão é público
      is_featured: req.body.is_featured !== undefined ? req.body.is_featured : req.body.isFeatured || false,
      registration_open: req.body.registration_open !== undefined ? req.body.registration_open : req.body.registrationOpen || false
    };
    
    // Inserir o novo evento
    const { data: event, error } = await supabase
      .from('events')
      .insert(eventData)
      .select()
      .single();
    
    if (error) throw error;
    
    // Registrar a atividade de criação de evento
    console.log('[DEBUG] Evento criado com sucesso, registrando atividade', event.id);
    const user = req.user || {};
    try {
      // Verificar se o serviço está disponível
      if (typeof activityLogService !== 'undefined' && activityLogService && typeof activityLogService.log === 'function') {
        await activityLogService.log({
          userId: user.id,
          username: user.email || user.username || 'anônimo',
          action: 'CREATE',
          entityType: 'EVENT',
          entityId: event.id,
          details: { 
            eventTitle: event.title,
            eventType: event.type,
            eventDate: event.start_date
          },
          ipAddress: req.ip || req.connection?.remoteAddress || 'unknown'
        }).catch(err => {
          console.error('[DEBUG] Erro ao registrar log (capturado em catch do log):', err);
        });
      } else {
        console.error('[DEBUG] Serviço de log não está disponível:', typeof activityLogService);
      }
    } catch (logError) {
      // Apenas logar o erro, não impedir a criação do evento
      console.error('[DEBUG] Erro ao registrar log de criação de evento:', logError);
    }
    
    res.status(201).json(event);
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    res.status(500).json({ error: 'Erro ao criar evento', details: error.message });
  }
};

// Atualizar evento
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se o evento existe
    const { data: existingEvent, error: fetchError } = await supabase
      .from('events')
      .select('id')
      .eq('id', id)
      .single();
    
    if (fetchError || !existingEvent) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }
    
    // Preparar dados para atualização
    const eventData = {};
    
    // Só incluir campos que foram enviados no request
    if (req.body.title !== undefined) eventData.title = req.body.title;
    if (req.body.description !== undefined) eventData.description = req.body.description;
    if (req.body.location !== undefined) eventData.location = req.body.location;
    if (req.body.startDate !== undefined) eventData.start_date = req.body.startDate;
    if (req.body.endDate !== undefined) eventData.end_date = req.body.endDate;
    if (req.body.type !== undefined) eventData.type = req.body.type;
    if (req.body.imageUrl !== undefined) eventData.image_url = req.body.imageUrl;
    if (req.body.capacity !== undefined) eventData.capacity = req.body.capacity;
    if (req.body.price !== undefined) eventData.price = req.body.price;
    if (req.body.registrationDeadline !== undefined) eventData.registration_deadline = req.body.registrationDeadline;
    if (req.body.isPublic !== undefined) eventData.is_public = req.body.isPublic;
    
    // Adicionar data de atualização
    eventData.updated_at = new Date().toISOString();
    
    // Atualizar o evento
    const { data: updatedEvent, error: updateError } = await supabase
      .from('events')
      .update(eventData)
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) throw updateError;
    
    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error(`Erro ao atualizar evento ${req.params.id}:`, error);
    res.status(500).json({ error: 'Erro ao atualizar evento', details: error.message });
  }
};

// Excluir evento
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Primeiro, excluir registros relacionados
    // Participantes do evento
    await supabase
      .from('event_participants')
      .delete()
      .eq('event_id', id);
    
    // Excluir o evento
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.status(200).json({ message: 'Evento excluído com sucesso' });
  } catch (error) {
    console.error(`Erro ao excluir evento ${req.params.id}:`, error);
    res.status(500).json({ error: 'Erro ao excluir evento', details: error.message });
  }
};

// Participantes do evento

// Obter participantes de um evento
exports.getEventParticipants = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se o evento existe
    const { data: eventExists, error: eventError } = await supabase
      .from('events')
      .select('id')
      .eq('id', id)
      .single();
    
    if (eventError || !eventExists) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }
    
    // Buscar participantes com dados do membro
    const { data, error } = await supabase
      .from('event_participants')
      .select(`
        *,
        member:member_id (
          id,
          name,
          memberNumber
        )
      `)
      .eq('event_id', id);
    
    if (error) throw error;
    
    // Formatar resposta
    const participants = data.map(p => ({
      id: p.id,
      eventId: p.event_id,
      memberId: p.member_id,
      registrationDate: p.created_at,
      hasPaid: p.has_paid,
      attendance: p.attendance,
      member: p.member ? {
        id: p.member.id,
        name: p.member.name,
        memberNumber: p.member.memberNumber
      } : null
    }));
    
    res.status(200).json(participants);
  } catch (error) {
    console.error(`Erro ao buscar participantes do evento ${req.params.id}:`, error);
    res.status(500).json({ error: 'Erro ao buscar participantes do evento', details: error.message });
  }
};

// Adicionar participante a um evento
exports.addEventParticipant = async (req, res) => {
  try {
    const { id } = req.params;
    const { memberId, hasPaid = false } = req.body;
    
    if (!memberId) {
      return res.status(400).json({ error: 'ID do membro é obrigatório' });
    }
    
    // Verificar se o evento existe
    const { data: eventExists, error: eventError } = await supabase
      .from('events')
      .select('id')
      .eq('id', id)
      .single();
    
    if (eventError || !eventExists) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }
    
    // Verificar se o membro existe
    const { data: memberExists, error: memberError } = await supabase
      .from('members')
      .select('id')
      .eq('id', memberId)
      .single();
    
    if (memberError || !memberExists) {
      return res.status(404).json({ error: 'Membro não encontrado' });
    }
    
    // Verificar se o membro já está inscrito
    const { data: existingRegistration, error: checkError } = await supabase
      .from('event_participants')
      .select('id')
      .eq('event_id', id)
      .eq('member_id', memberId)
      .single();
    
    if (existingRegistration) {
      return res.status(409).json({ error: 'Membro já está inscrito neste evento' });
    }
    
    // Adicionar participante
    const { data: participant, error } = await supabase
      .from('event_participants')
      .insert({
        event_id: id,
        member_id: memberId,
        has_paid: hasPaid
      })
      .select('*, member:member_id(id, name, memberNumber)')
      .single();
    
    if (error) throw error;
    
    res.status(201).json({
      id: participant.id,
      eventId: participant.event_id,
      memberId: participant.member_id,
      registrationDate: participant.created_at,
      hasPaid: participant.has_paid,
      attendance: participant.attendance,
      member: participant.member ? {
        id: participant.member.id,
        name: participant.member.name,
        memberNumber: participant.member.memberNumber
      } : null
    });
  } catch (error) {
    console.error(`Erro ao adicionar participante ao evento ${req.params.id}:`, error);
    res.status(500).json({ error: 'Erro ao adicionar participante', details: error.message });
  }
};

// Remover participante de um evento
exports.removeEventParticipant = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    
    // Verificar se a inscrição existe
    const { data: registration, error: checkError } = await supabase
      .from('event_participants')
      .select('id')
      .eq('event_id', id)
      .eq('member_id', memberId)
      .single();
    
    if (checkError || !registration) {
      return res.status(404).json({ error: 'Inscrição não encontrada' });
    }
    
    // Remover participante
    const { error } = await supabase
      .from('event_participants')
      .delete()
      .eq('event_id', id)
      .eq('member_id', memberId);
    
    if (error) throw error;
    
    res.status(200).json({ message: 'Participante removido com sucesso' });
  } catch (error) {
    console.error(`Erro ao remover participante do evento ${req.params.id}:`, error);
    res.status(500).json({ error: 'Erro ao remover participante', details: error.message });
  }
};
