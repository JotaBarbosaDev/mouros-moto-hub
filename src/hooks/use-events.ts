
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
      return [];
    }

    // Map database events to frontend Event type
    return data.map(event => ({
      id: event.id,
      title: event.title,
      date: new Date(event.start_date).toLocaleDateString('pt-PT'),
      location: event.location,
      image: event.poster_url || '',
      thumbnail: event.thumbnail_url || event.poster_url || '',
      type: mapEventType(event.title),
      description: event.description,
      participants: 0, // Will be updated with registrations count
      maxParticipants: event.maximum_participants || undefined,
      isFeatured: false,
      membersOnly: event.members_only,
      registrationDeadline: event.end_date ? new Date(event.end_date).toISOString() : undefined,
      registrationOpen: event.registration_open,
    }));
  };

  // Map event type from title or other properties (placeholder logic)
  const mapEventType = (title: string): 'trail' | 'estrada' | 'encontro' | 'solidario' => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('trail')) return 'trail';
    if (lowerTitle.includes('estrada')) return 'estrada';
    if (lowerTitle.includes('solidari')) return 'solidario';
    return 'encontro';
  };

  // Create a new event
  const createEvent = async (eventData: Omit<Event, 'id'>): Promise<Event> => {
    // Transform frontend event data to database format
    const { data, error } = await supabase
      .from('events')
      .insert({
        title: eventData.title,
        start_date: new Date(eventData.date).toISOString(),
        end_date: eventData.registrationDeadline || null,
        location: eventData.location,
        description: eventData.description,
        poster_url: eventData.image || null,
        thumbnail_url: eventData.thumbnail || null,
        maximum_participants: eventData.maxParticipants || null,
        members_only: eventData.membersOnly || false,
        registration_open: eventData.registrationOpen || false,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o evento.',
        variant: 'destructive',
      });
      throw error;
    }

    toast({
      title: 'Sucesso',
      description: 'Evento criado com sucesso.',
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
      isFeatured: false,
      membersOnly: data.members_only,
      registrationDeadline: data.end_date ? new Date(data.end_date).toISOString() : undefined,
      registrationOpen: data.registration_open,
    };
  };

  // Update an event
  const updateEvent = async (eventData: Event): Promise<Event> => {
    const { data, error } = await supabase
      .from('events')
      .update({
        title: eventData.title,
        start_date: new Date(eventData.date).toISOString(),
        end_date: eventData.registrationDeadline ? new Date(eventData.registrationDeadline).toISOString() : null,
        location: eventData.location,
        description: eventData.description,
        poster_url: eventData.image || null,
        thumbnail_url: eventData.thumbnail || null,
        maximum_participants: eventData.maxParticipants || null,
        members_only: eventData.membersOnly || false,
        registration_open: eventData.registrationOpen || false,
      })
      .eq('id', eventData.id)
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
      isFeatured: false,
      membersOnly: data.members_only,
      registrationDeadline: data.end_date ? new Date(data.end_date).toISOString() : undefined,
      registrationOpen: data.registration_open,
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

  // Fix here - Convert to string if it's a number
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
    }
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

  return {
    events: eventsQuery.data || [],
    isLoading: eventsQuery.isLoading,
    isError: eventsQuery.isError,
    createEvent: createEventMutation.mutate,
    updateEvent: updateEventMutation.mutate,
    deleteEvent: deleteEventMutation.mutate,
    registerForEvent: registerForEventMutation.mutate
  };
};
