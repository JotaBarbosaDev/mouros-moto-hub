import { fetchWithAuth, getApiBaseUrl } from '@/utils/api';
import { Event, EventParticipant } from '@/types/event';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventResponse = any; // TODO: Implementar uma tipagem mais forte para a resposta da API

/**
 * Serviço para gerenciamento de eventos
 */
export const eventService = {
  /**
   * Busca todos os eventos
   */
  getAll: async (): Promise<Event[]> => {
    const apiUrl = `${getApiBaseUrl()}/events`;
    const response = await fetchWithAuth(apiUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((event: EventResponse) => {
      // Campos principais
      const startDate = event.start_date ? new Date(event.start_date) : null;
      const formattedDate = startDate ? 
        `${String(startDate.getDate()).padStart(2, '0')}/${String(startDate.getMonth() + 1).padStart(2, '0')}/${startDate.getFullYear()}`
        : '';
      
      return {
        id: event.id,
        title: event.title,
        description: event.description || '',
        location: event.location || '',
        startDate,
        endDate: event.end_date ? new Date(event.end_date) : null,
        type: event.type || 'encontro',
        imageUrl: event.image_url || '',
        image: event.image_url || '',
        isPublic: event.is_public,
        status: event.status || 'scheduled',
        creatorId: event.creator_id,
        createdAt: event.created_at ? new Date(event.created_at) : new Date(),
        updatedAt: event.updated_at ? new Date(event.updated_at) : new Date(),
        
        // Campos para compatibilidade
        date: formattedDate,
        _isoDate: event.start_date,
        membersOnly: !event.is_public,
        isFeatured: event.is_featured || false,
        registrationOpen: event.registration_open || false,
        maxParticipants: event.max_participants || undefined
      };
    });
  },
  
  /**
   * Busca um evento pelo ID
   */
  getById: async (id: string): Promise<Event> => {
    const apiUrl = `${getApiBaseUrl()}/events/${id}`;
    const response = await fetchWithAuth(apiUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const event: EventResponse = await response.json();
    const startDate = event.start_date ? new Date(event.start_date) : null;
    const formattedDate = startDate ? 
      `${String(startDate.getDate()).padStart(2, '0')}/${String(startDate.getMonth() + 1).padStart(2, '0')}/${startDate.getFullYear()}`
      : '';
    
    return {
      id: event.id,
      title: event.title,
      description: event.description || '',
      location: event.location || '',
      startDate,
      endDate: event.end_date ? new Date(event.end_date) : null,
      type: event.type || 'encontro',
      imageUrl: event.image_url || '',
      image: event.image_url || '',
      isPublic: event.is_public,
      status: event.status || 'scheduled',
      creatorId: event.creator_id,
      createdAt: event.created_at ? new Date(event.created_at) : new Date(),
      updatedAt: event.updated_at ? new Date(event.updated_at) : new Date(),
      
      // Campos para compatibilidade
      date: formattedDate,
      _isoDate: event.start_date,
      membersOnly: !event.is_public,
      isFeatured: event.is_featured || false,
      registrationOpen: event.registration_open || false,
      maxParticipants: event.max_participants || undefined,
      
      // Participantes
      participants: event.event_participants?.map((p: any) => ({
        eventId: id,
        memberId: p.member_id,
        memberName: p.members?.name || '',
        memberUsername: p.members?.username || ''
      })) || []
    };
  },
  
  /**
   * Cria um novo evento
   */
  create: async (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> => {
    const apiUrl = `${getApiBaseUrl()}/events`;
    
    // Adapta os dados para o formato esperado pelo backend
    const payload = {
      title: event.title,
      description: event.description || '',
      location: event.location || '',
      start_date: event.startDate,
      end_date: event.endDate,
      type: event.type || 'encontro',
      image_url: event.imageUrl || event.image || '',
      is_public: event.isPublic,
      status: event.status || 'scheduled',
      creator_id: event.creatorId,
      is_featured: event.isFeatured || false,
      registration_open: event.registrationOpen || false,
      max_participants: event.maxParticipants
    };
    
    const response = await fetchWithAuth(apiUrl, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createdEvent: EventResponse = await response.json();
    const startDate = createdEvent.start_date ? new Date(createdEvent.start_date) : null;
    const formattedDate = startDate ? 
      `${String(startDate.getDate()).padStart(2, '0')}/${String(startDate.getMonth() + 1).padStart(2, '0')}/${startDate.getFullYear()}`
      : '';
    
    return {
      id: createdEvent.id,
      title: createdEvent.title,
      description: createdEvent.description || '',
      location: createdEvent.location || '',
      startDate,
      endDate: createdEvent.end_date ? new Date(createdEvent.end_date) : null,
      type: createdEvent.type || 'encontro',
      imageUrl: createdEvent.image_url || '',
      image: createdEvent.image_url || '',
      isPublic: createdEvent.is_public,
      status: createdEvent.status || 'scheduled',
      creatorId: createdEvent.creator_id,
      createdAt: createdEvent.created_at ? new Date(createdEvent.created_at) : new Date(),
      updatedAt: createdEvent.updated_at ? new Date(createdEvent.updated_at) : new Date(),
      
      // Campos para compatibilidade
      date: formattedDate,
      _isoDate: createdEvent.start_date,
      membersOnly: !createdEvent.is_public,
      isFeatured: createdEvent.is_featured || false,
      registrationOpen: createdEvent.registration_open || false,
      maxParticipants: createdEvent.max_participants || undefined
    };
  },
  
  /**
   * Atualiza um evento existente
   */
  update: async (id: string, event: Event): Promise<Event> => {
    const apiUrl = `${getApiBaseUrl()}/events/${id}`;
    
    // Adapta os dados para o formato esperado pelo backend
    const payload = {
      title: event.title,
      description: event.description || '',
      location: event.location || '',
      start_date: event.startDate,
      end_date: event.endDate,
      type: event.type || 'encontro',
      image_url: event.imageUrl || event.image || '',
      is_public: event.isPublic,
      status: event.status || 'scheduled',
      is_featured: event.isFeatured || false,
      registration_open: event.registrationOpen || false,
      max_participants: event.maxParticipants
    };
    
    const response = await fetchWithAuth(apiUrl, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatedEvent: EventResponse = await response.json();
    const startDate = updatedEvent.start_date ? new Date(updatedEvent.start_date) : null;
    const formattedDate = startDate ? 
      `${String(startDate.getDate()).padStart(2, '0')}/${String(startDate.getMonth() + 1).padStart(2, '0')}/${startDate.getFullYear()}`
      : '';
    
    return {
      id: updatedEvent.id,
      title: updatedEvent.title,
      description: updatedEvent.description || '',
      location: updatedEvent.location || '',
      startDate,
      endDate: updatedEvent.end_date ? new Date(updatedEvent.end_date) : null,
      type: updatedEvent.type || 'encontro',
      imageUrl: updatedEvent.image_url || '',
      image: updatedEvent.image_url || '',
      isPublic: updatedEvent.is_public,
      status: updatedEvent.status || 'scheduled',
      creatorId: updatedEvent.creator_id,
      createdAt: updatedEvent.created_at ? new Date(updatedEvent.created_at) : new Date(),
      updatedAt: updatedEvent.updated_at ? new Date(updatedEvent.updated_at) : new Date(),
      
      // Campos para compatibilidade
      date: formattedDate,
      _isoDate: updatedEvent.start_date,
      membersOnly: !updatedEvent.is_public,
      isFeatured: updatedEvent.is_featured || false,
      registrationOpen: updatedEvent.registration_open || false,
      maxParticipants: updatedEvent.max_participants || undefined
    };
  },
  
  /**
   * Remove um evento
   */
  delete: async (id: string): Promise<void> => {
    const apiUrl = `${getApiBaseUrl()}/events/${id}`;
    const response = await fetchWithAuth(apiUrl, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  },
  
  /**
   * Busca os participantes de um evento
   */
  getParticipants: async (eventId: string): Promise<EventParticipant[]> => {
    const apiUrl = `${getApiBaseUrl()}/events/${eventId}/participants`;
    const response = await fetchWithAuth(apiUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((participant: any) => ({
      eventId: eventId,
      memberId: participant.member_id,
      memberName: participant.member_name || '',
      memberUsername: participant.member_username || ''
    }));
  },
  
  /**
   * Adiciona um participante a um evento
   */
  addParticipant: async (eventId: string, memberId: string): Promise<void> => {
    const apiUrl = `${getApiBaseUrl()}/events/${eventId}/participants`;
    const response = await fetchWithAuth(apiUrl, {
      method: 'POST',
      body: JSON.stringify({ memberId })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  },
  
  /**
   * Remove um participante de um evento
   */
  removeParticipant: async (eventId: string, memberId: string): Promise<void> => {
    const apiUrl = `${getApiBaseUrl()}/events/${eventId}/participants/${memberId}`;
    const response = await fetchWithAuth(apiUrl, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  },
  
  /**
   * Registra um participante externo em um evento
   */
  registerParticipant: async (eventId: string, participant: { name: string; email: string; phone: string }): Promise<void> => {
    const apiUrl = `${getApiBaseUrl()}/events/${eventId}/registrations`;
    const response = await fetchWithAuth(apiUrl, {
      method: 'POST',
      body: JSON.stringify({
        name: participant.name,
        email: participant.email,
        phone: participant.phone
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  }
};
