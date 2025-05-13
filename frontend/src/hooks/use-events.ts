import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import { Event } from '@/types/events';
import { Event as EventModel } from '@/types/event';
import { eventService } from '@/services/event-service';

export const useEvents = () => {
  const queryClient = useQueryClient();

  // Fetch all events
  const getEvents = async (): Promise<Event[]> => {
    try {
      const events = await eventService.getAll();
      // Mapeando para o formato esperado pelo frontend
      return events.map(event => ({
        id: event.id,
        title: event.title,
        date: event.date || '',
        location: event.location || '',
        image: event.imageUrl || event.image || '',
        thumbnail: event.imageUrl || event.thumbnail || '',
        type: event.type || 'encontro',
        description: event.description || '',
        participants: 0, // Será atualizado posteriormente
        maxParticipants: event.maxParticipants,
        isFeatured: event.isFeatured || false,
        membersOnly: event.membersOnly || !event.isPublic,
        registrationDeadline: event.endDate ? event.endDate.toISOString() : undefined,
        registrationOpen: event.registrationOpen || false,
        _isoDate: event.startDate ? event.startDate.toISOString() : undefined
      }));
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os eventos.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Função para converter entre os dois tipos de Event
  const convertToEventModel = (eventData: Omit<Event, 'id'> & { _isoDate?: string }): Omit<EventModel, 'id' | 'createdAt' | 'updatedAt'> => {
    // Criar uma data a partir da string
    let startDate: Date;
    if (eventData._isoDate) {
      startDate = new Date(eventData._isoDate);
    } else {
      // Converter formato dd/MM/yyyy para data
      const dateParts = eventData.date.split('/');
      if (dateParts.length === 3) {
        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1; // mês começa em 0 em JavaScript
        const year = parseInt(dateParts[2], 10);
        startDate = new Date(year, month, day);
      } else {
        startDate = new Date(eventData.date);
      }
    }
    
    // Garantir que endDate sempre é pelo menos igual ou maior que startDate
    let endDate: Date;
    if (eventData.registrationDeadline) {
      endDate = new Date(eventData.registrationDeadline);
      if (isNaN(endDate.getTime()) || endDate < startDate) {
        // Se a data não for válida ou for anterior à startDate
        endDate = new Date(startDate.getTime());
        endDate.setDate(endDate.getDate() + 1);
      }
    } else {
      // Se não tiver uma data de deadline, definir como startDate + 1 dia
      endDate = new Date(startDate.getTime());
      endDate.setDate(endDate.getDate() + 1);
    }
    
    return {
      title: eventData.title,
      description: eventData.description || '',
      location: eventData.location || '',
      startDate: startDate,
      endDate: endDate,
      type: eventData.type || 'encontro',
      imageUrl: eventData.image || '',
      isPublic: !eventData.membersOnly,
      status: 'scheduled',
      creatorId: '1', // Usando um ID padrão temporário - isso deve ser substituído pelo ID do usuário logado
      maxParticipants: eventData.maxParticipants,
      registrationOpen: eventData.registrationOpen || false,
      isFeatured: eventData.isFeatured || false
    };
  };

  // Create a new event
  const createEvent = async (eventData: Omit<Event, 'id'> & { _isoDate?: string }): Promise<Event> => {
    try {
      const eventModelData = convertToEventModel(eventData);
      const createdEvent = await eventService.create(eventModelData);
      
      // Converter de volta para o formato esperado pelo frontend
      const formattedDate = createdEvent.startDate ? 
        `${String(createdEvent.startDate.getDate()).padStart(2, '0')}/${String(createdEvent.startDate.getMonth() + 1).padStart(2, '0')}/${createdEvent.startDate.getFullYear()}`
        : '';
        
      return {
        id: createdEvent.id,
        title: createdEvent.title,
        date: formattedDate,
        location: createdEvent.location || '',
        image: createdEvent.imageUrl || '',
        thumbnail: createdEvent.imageUrl || '',
        type: createdEvent.type,
        description: createdEvent.description || '',
        participants: 0,
        maxParticipants: createdEvent.maxParticipants,
        isFeatured: createdEvent.isFeatured || false,
        membersOnly: !createdEvent.isPublic,
        registrationDeadline: createdEvent.endDate ? createdEvent.endDate.toISOString() : undefined,
        registrationOpen: createdEvent.registrationOpen || false,
        _isoDate: createdEvent.startDate ? createdEvent.startDate.toISOString() : undefined
      };
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o evento.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Update an event
  const updateEvent = async (eventData: Event): Promise<Event> => {
    try {
      // Criar um objeto completo com todos os campos necessários
      const eventModelData: EventModel = {
        ...convertToEventModel(eventData),
        id: eventData.id.toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const updatedEvent = await eventService.update(eventData.id.toString(), eventModelData as EventModel);
      
      // Converter de volta para o formato esperado pelo frontend
      const formattedDate = updatedEvent.startDate ? 
        `${String(updatedEvent.startDate.getDate()).padStart(2, '0')}/${String(updatedEvent.startDate.getMonth() + 1).padStart(2, '0')}/${updatedEvent.startDate.getFullYear()}`
        : '';
        
      return {
        id: updatedEvent.id,
        title: updatedEvent.title,
        date: formattedDate,
        location: updatedEvent.location || '',
        image: updatedEvent.imageUrl || '',
        thumbnail: updatedEvent.imageUrl || '',
        type: updatedEvent.type,
        description: updatedEvent.description || '',
        participants: 0,
        maxParticipants: updatedEvent.maxParticipants,
        isFeatured: updatedEvent.isFeatured || false,
        membersOnly: !updatedEvent.isPublic,
        registrationDeadline: updatedEvent.endDate ? updatedEvent.endDate.toISOString() : undefined,
        registrationOpen: updatedEvent.registrationOpen || false,
        _isoDate: updatedEvent.startDate ? updatedEvent.startDate.toISOString() : undefined
      };
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o evento.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Delete an event
  const deleteEvent = async (eventId: string): Promise<void> => {
    try {
      await eventService.delete(eventId);
      toast({
        title: 'Sucesso',
        description: 'Evento eliminado com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível eliminar o evento.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Register for an event
  const registerForEvent = async (
    eventId: string, 
    registrationData: { name: string; email: string; phone: string; }
  ): Promise<void> => {
    try {
      await eventService.registerParticipant(eventId, {
        name: registrationData.name,
        email: registrationData.email,
        phone: registrationData.phone
      });
      toast({
        title: 'Sucesso',
        description: 'Inscrição realizada com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível efetuar a inscrição.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // React Query hooks
  const eventsQuery = useQuery({
    queryKey: ['events'],
    queryFn: getEvents,
    staleTime: 1000 * 60, // 1 minuto
    refetchInterval: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  const createEventMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: 'Sucesso',
        description: 'Evento criado com sucesso.',
      });
    }
  });

  const updateEventMutation = useMutation({
    mutationFn: updateEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: 'Sucesso',
        description: 'Evento atualizado com sucesso.',
      });
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
  const createEventWithMutation = (eventData: Omit<Event, 'id'> & { _isoDate?: string }): Promise<Event> => {
    return createEventMutation.mutateAsync(eventData);
  };

  return {
    events: eventsQuery.data || [],
    isLoading: eventsQuery.isLoading,
    isError: eventsQuery.isError,
    refetch: eventsQuery.refetch,
    createEvent: createEventWithMutation,
    updateEvent: updateEventMutation.mutateAsync,
    deleteEvent: deleteEventMutation.mutateAsync,
    registerForEvent: (eventId: string, registrationData: { name: string; email: string; phone: string }) => 
      registerForEventMutation.mutateAsync({ eventId, registrationData })
  };
};
