import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Event } from '@/types/events';

export const useEvents = () => {
  const queryClient = useQueryClient();

  // Fetch all events
  const getEvents = async (): Promise<Event[]> => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('start_date', { ascending: true });

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os eventos.',
        variant: 'destructive',
      });
      throw error;
    }

    if (!data || data.length === 0) {
      console.log("Nenhum evento encontrado na base de dados");
      return [];
    }
    
    console.log("Eventos carregados do Supabase:", data);

    // Map database events to frontend Event type
    return data.map(event => {
      const startDate = new Date(event.start_date);
      
      // Converte para o formato dd/MM/yyyy
      const dateFormatted = `${String(startDate.getDate()).padStart(2, '0')}/${String(startDate.getMonth() + 1).padStart(2, '0')}/${startDate.getFullYear()}`;
      
      // Determinação do tipo de evento baseado no tipo definido no banco ou no título
      let eventType: Event['type'] = 'encontro'; // Default
      
      if (event.type) {
        // Normalizar o tipo (remover traços e converter para underscore)
        const normalizedType = event.type.replace('-', '_').toLowerCase();
        
        // Verificar se é um tipo válido
        if (normalizedType === 'trail' || normalizedType === 'estrada' || 
            normalizedType === 'encontro' || normalizedType === 'solidario' ||
            normalizedType === 'visita' || normalizedType === 'visita_recebida' ||
            normalizedType === 'concentracao' || normalizedType === 'interno') {
          eventType = normalizedType as Event['type'];
        } else {
          eventType = mapEventType(event.title);
        }
      } else {
        eventType = mapEventType(event.title);
      }
      
      return {
        id: event.id,
        title: event.title,
        date: dateFormatted,
        location: event.location || '',
        image: event.poster_url || '',
        thumbnail: event.thumbnail_url || event.poster_url || '',
        type: eventType,
        description: event.description || '',
        participants: 0, // Will be updated with registrations count
        maxParticipants: event.maximum_participants || undefined,
        isFeatured: event.published || false,
        membersOnly: event.members_only || false,
        registrationDeadline: event.end_date ? new Date(event.end_date).toISOString() : undefined,
        registrationOpen: event.registration_open || false,
      };
    });
  };

  // Map event type from title or other properties
  const mapEventType = (title: string): Event['type'] => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('trail')) return 'trail';
    if (lowerTitle.includes('estrada')) return 'estrada';
    if (lowerTitle.includes('solidari')) return 'solidario';
    if (lowerTitle.includes('visita')) {
      if (lowerTitle.includes('recebida')) return 'visita_recebida';
      return 'visita';
    }
    if (lowerTitle.includes('concentra')) return 'concentracao';
    if (lowerTitle.includes('intern')) return 'interno';
    return 'encontro';
  };

  // Create a new event
  const createEvent = async (eventData: Omit<Event, 'id'> & { _isoDate?: string }): Promise<Event> => {
    console.log("Iniciando criação de evento com dados:", eventData);
    
    // Use a data ISO armazenada se disponível ou faz parse da data no formato PT
    let startDate: string;
    if (eventData._isoDate) {
      startDate = eventData._isoDate;
    } else {
      // Converter formato dd/MM/yyyy para data ISO
      const dateParts = eventData.date.split('/');
      if (dateParts.length === 3) {
        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1; // mês começa em 0 em JavaScript
        const year = parseInt(dateParts[2], 10);
        startDate = new Date(year, month, day).toISOString();
      } else {
        // Fallback, mas isso provavelmente resultará em erro
        startDate = new Date(eventData.date).toISOString();
      }
    }
    
    // Garantir que end_date sempre é pelo menos igual ou maior que start_date
    let endDate;
    if (eventData.registrationDeadline) {
      const parsedDeadline = new Date(eventData.registrationDeadline);
      // Verificar se a data é válida e posterior à data de início
      if (!isNaN(parsedDeadline.getTime()) && parsedDeadline >= new Date(startDate)) {
        endDate = eventData.registrationDeadline;
      } else {
        // Se a data não for válida ou for anterior à data de início
        const startDateObj = new Date(startDate);
        // Definir end_date como start_date + 1 dia para garantir que é sempre posterior
        startDateObj.setDate(startDateObj.getDate() + 1);
        endDate = startDateObj.toISOString();
      }
    } else {
      // Se não tiver uma data de deadline, definir como start_date + 1 dia
      const startDateObj = new Date(startDate);
      startDateObj.setDate(startDateObj.getDate() + 1);
      endDate = startDateObj.toISOString();
    }
    
    // Transform frontend event data to database format
    const { data, error } = await supabase
      .from('events')
      .insert({
        title: eventData.title,
        start_date: startDate,
        end_date: endDate, // Sempre será pelo menos 1 dia depois da data de início
        location: eventData.location,
        description: eventData.description || '', // Garante uma string vazia em vez de null
        poster_url: eventData.image || null,
        thumbnail_url: eventData.thumbnail || null,
        maximum_participants: eventData.maxParticipants || null,
        members_only: eventData.membersOnly || false,
        registration_open: eventData.registrationOpen || false,
        published: eventData.isFeatured || false, // Campo published mapeado para isFeatured
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar evento:', error);
      console.log('Dados enviados para API:', {
        title: eventData.title,
        start_date: startDate,
        end_date: endDate,
        location: eventData.location,
        description: eventData.description,
        poster_url: eventData.image || null,
        thumbnail_url: eventData.thumbnail || null,
        maximum_participants: eventData.maxParticipants || null,
        members_only: eventData.membersOnly || false,
        registration_open: eventData.registrationOpen || false,
      });
      
      toast({
        title: 'Erro',
        description: `Não foi possível criar o evento: ${error.message || error.details || JSON.stringify(error)}`,
        variant: 'destructive',
      });
      throw error;
    }

    toast({
      title: 'Sucesso',
      description: 'Evento criado com sucesso.',
    });
    
    // Invalidar o cache para forçar uma nova consulta
    console.log("Invalidando cache de consulta de eventos após criação bem-sucedida");
    queryClient.invalidateQueries({ queryKey: ['events'] });
    
    const newEvent = {
      id: data.id,
      title: data.title,
      date: new Date(data.start_date).toLocaleDateString('pt-PT'),
      location: data.location,
      image: data.poster_url || '',
      thumbnail: data.thumbnail_url || data.poster_url || '',
      type: mapEventType(data.title),
      description: data.description,
      participants: 0,
      maxParticipants: data.maximum_participants || undefined,
      isFeatured: data.published || false,
      membersOnly: data.members_only,
      registrationDeadline: data.end_date ? new Date(data.end_date).toISOString() : undefined,
      registrationOpen: data.registration_open || false,
    };
    
    console.log("Evento criado com sucesso:", newEvent);
    return newEvent;
  };

  // Update an event
  const updateEvent = async (eventData: Event): Promise<Event> => {
    // Garantir que a start_date seja uma data ISO válida
    const startDate = new Date(eventData.date).toISOString();
    
    // Garantir que end_date sempre é pelo menos igual ou maior que start_date
    let endDate;
    if (eventData.registrationDeadline) {
      const parsedDeadline = new Date(eventData.registrationDeadline);
      if (!isNaN(parsedDeadline.getTime()) && parsedDeadline >= new Date(startDate)) {
        endDate = parsedDeadline.toISOString();
      } else {
        // Se a data não for válida ou for anterior à data de início
        const startDateObj = new Date(startDate);
        // Definir end_date como start_date + 1 dia para garantir que é sempre posterior
        startDateObj.setDate(startDateObj.getDate() + 1);
        endDate = startDateObj.toISOString();
      }
    } else {
      // Se não tiver uma data de deadline, definir como start_date + 1 dia
      const startDateObj = new Date(startDate);
      startDateObj.setDate(startDateObj.getDate() + 1);
      endDate = startDateObj.toISOString();
    }
    
    const { data, error } = await supabase
      .from('events')
      .update({
        title: eventData.title,
        start_date: startDate,
        end_date: endDate,
        location: eventData.location,
        description: eventData.description || '', // Garantir que não seja null
        poster_url: eventData.image || null,
        thumbnail_url: eventData.thumbnail || null,
        maximum_participants: eventData.maxParticipants || null,
        members_only: eventData.membersOnly || false,
        registration_open: eventData.registrationOpen || false,
      })
      .eq('id', eventData.id.toString())
      .select()
      .single();

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o evento.',
        variant: 'destructive',
      });
      throw error;
    }

    toast({
      title: 'Sucesso',
      description: 'Evento atualizado com sucesso.',
    });

    return {
      id: data.id,
      title: data.title,
      date: new Date(data.start_date).toLocaleDateString('pt-PT'),
      location: data.location,
      image: data.poster_url || '',
      thumbnail: data.thumbnail_url || data.poster_url || '',
      type: mapEventType(data.title),
      description: data.description,
      participants: 0,
      maxParticipants: data.maximum_participants || undefined,
      isFeatured: data.published || false,
      membersOnly: data.members_only,
      registrationDeadline: data.end_date ? new Date(data.end_date).toISOString() : undefined,
      registrationOpen: data.registration_open || false,
    };
  };

  // Delete an event
  const deleteEvent = async (eventId: string): Promise<void> => {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível eliminar o evento.',
        variant: 'destructive',
      });
      throw error;
    }

    toast({
      title: 'Sucesso',
      description: 'Evento eliminado com sucesso.',
    });
  };

  // Register for an event
  const registerForEvent = async (
    eventId: string, 
    registrationData: { name: string; email: string; phone: string; }
  ): Promise<void> => {
    // First, check if this is a member registration
    const { data: memberData } = await supabase
      .from('members')
      .select('id')
      .eq('email', registrationData.email)
      .single();
    
    const memberId = memberData?.id || null;
    
    // Insert registration
    const { error } = await supabase
      .from('event_registrations')
      .insert({
        event_id: eventId,
        member_id: memberId,
        external_name: memberId ? null : registrationData.name,
        external_email: memberId ? null : registrationData.email,
        external_phone: memberId ? null : registrationData.phone,
        status: 'confirmed'
      });

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível efectuar a inscrição.',
        variant: 'destructive',
      });
      throw error;
    }

    toast({
      title: 'Sucesso',
      description: 'Inscrição realizada com sucesso.',
    });
  };

  // Count event registrations
  const getEventRegistrationsCount = async (eventId: string): Promise<number> => {
    const { count, error } = await supabase
      .from('event_registrations')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', eventId);

    if (error) {
      console.error('Error counting registrations:', error);
      return 0;
    }

    return count || 0;
  };

  // Update registrations count for events
  const updateEventRegistrations = async (events: Event[]): Promise<Event[]> => {
    const updatedEvents = [...events];
    
    for (let i = 0; i < updatedEvents.length; i++) {
      const event = updatedEvents[i];
      const count = await getEventRegistrationsCount(event.id.toString());
      updatedEvents[i] = { ...event, participants: count };
    }
    
    return updatedEvents;
  };

  // React Query hooks
  const eventsQuery = useQuery({
    queryKey: ['events'],
    queryFn: getEvents,
    select: async (data) => {
      return await updateEventRegistrations(data);
    },
    staleTime: 1000 * 60, // 1 minuto
    refetchInterval: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  const createEventMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    }
  });

  const updateEventMutation = useMutation({
    mutationFn: updateEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    }
  });

  const deleteEventMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    }
  });

  const registerForEventMutation = useMutation({
    mutationFn: ({ eventId, registrationData }: { 
      eventId: string; 
      registrationData: { name: string; email: string; phone: string; }
    }) => registerForEvent(eventId, registrationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    }
  });

  // Wrapper para usar a mutation com o createEvent
  const createEventWithMutation = async (eventData: Omit<Event, 'id'> & { _isoDate?: string }): Promise<Event> => {
    console.log("Chamando createEvent através da mutation");
    return createEvent(eventData);
  };

  return {
    events: eventsQuery.data || [],
    isLoading: eventsQuery.isLoading,
    isError: eventsQuery.isError,
    refetch: eventsQuery.refetch,  // Adicionando refetch para recarregar eventos manualmente
    createEvent: createEventWithMutation,  // Usar nossa função que já implementa invalidação de cache
    updateEvent: updateEventMutation.mutateAsync,  // Usar mutateAsync para permitir await
    deleteEvent: deleteEventMutation.mutateAsync,
    registerForEvent: (eventId: string, registrationData: { name: string; email: string; phone: string }) => 
      registerForEventMutation.mutateAsync({ eventId, registrationData })
  };
};
