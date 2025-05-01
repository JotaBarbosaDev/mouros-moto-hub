
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Event, ScheduleItem, StopPoint, Participant } from '@/types/events';

export const useEvents = () => {
  const queryClient = useQueryClient();

  // Fetch all events with their details
  const getEvents = async (): Promise<Event[]> => {
    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .order('start_date', { ascending: true });

    if (eventsError) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os eventos.',
        variant: 'destructive',
      });
      throw eventsError;
    }

    if (!eventsData || eventsData.length === 0) {
      return [];
    }

    const eventIds = eventsData.map(event => event.id);

    // Fetch schedule items for all events
    const { data: scheduleData, error: scheduleError } = await supabase
      .from('event_schedule')
      .select('*')
      .in('event_id', eventIds)
      .order('start_time', { ascending: true });

    if (scheduleError) {
      console.error('Error fetching event schedules:', scheduleError);
    }

    // Fetch stops for all events
    const { data: stopsData, error: stopsError } = await supabase
      .from('event_stops')
      .select('*')
      .in('event_id', eventIds)
      .order('order_index', { ascending: true });

    if (stopsError) {
      console.error('Error fetching event stops:', stopsError);
    }

    // Fetch registrations for all events
    const { data: registrationsData, error: registrationsError } = await supabase
      .from('event_registrations')
      .select(`
        *,
        members:member_id (name, member_number),
        vehicles:vehicle_id (brand, model, displacement)
      `)
      .in('event_id', eventIds);

    if (registrationsError) {
      console.error('Error fetching event registrations:', registrationsError);
    }

    // Group related data by event_id
    const scheduleByEventId: Record<string, ScheduleItem[]> = {};
    const stopsByEventId: Record<string, StopPoint[]> = {};
    const registrationsByEventId: Record<string, Participant[]> = {};
    const participantCountByEventId: Record<string, number> = {};

    // Process schedule data
    (scheduleData || []).forEach(item => {
      if (!scheduleByEventId[item.event_id]) {
        scheduleByEventId[item.event_id] = [];
      }
      
      scheduleByEventId[item.event_id].push({
        time: new Date(item.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        description: item.title + (item.description ? `: ${item.description}` : '')
      });
    });

    // Process stops data
    (stopsData || []).forEach(stop => {
      if (!stopsByEventId[stop.event_id]) {
        stopsByEventId[stop.event_id] = [];
      }
      
      stopsByEventId[stop.event_id].push({
        name: stop.name,
        description: stop.description || '',
        image: stop.photo_url
      });
    });

    // Process registrations data
    (registrationsData || []).forEach(registration => {
      if (!participantCountByEventId[registration.event_id]) {
        participantCountByEventId[registration.event_id] = 0;
      }
      participantCountByEventId[registration.event_id]++;
      
      if (!registrationsByEventId[registration.event_id]) {
        registrationsByEventId[registration.event_id] = [];
      }
      
      let participantName = registration.external_name || '';
      let memberNumber: number | undefined = undefined;
      let motorcycle: { id?: string; make: string; model: string; engineSize: number } | undefined = undefined;
      
      if (registration.members) {
        participantName = registration.members.name;
        memberNumber = parseInt(registration.members.member_number);
      }
      
      if (registration.vehicles) {
        motorcycle = {
          make: registration.vehicles.brand,
          model: registration.vehicles.model,
          engineSize: registration.vehicles.displacement
        };
      }
      
      registrationsByEventId[registration.event_id].push({
        id: registration.id,
        name: participantName,
        memberNumber,
        motorcycle
      });
    });

    // Map events with their related data
    return eventsData.map(event => ({
      id: event.id,
      title: event.title,
      date: new Date(event.start_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
      location: event.location,
      image: event.poster_url || '',
      thumbnail: event.thumbnail_url,
      type: 'encontro', // Default type - adjust as needed
      description: event.description,
      participants: participantCountByEventId[event.id] || 0,
      maxParticipants: event.maximum_participants,
      membersOnly: event.members_only,
      registrationDeadline: event.registration_open ? event.end_date : undefined,
      schedule: scheduleByEventId[event.id] || [],
      stops: stopsByEventId[event.id] || [],
      startPoint: event.location,
      endPoint: event.location,
      registeredParticipants: registrationsByEventId[event.id] || [],
      isFeatured: event.published
    }));
  };

  // Create a new event
  const createEvent = async (eventData: Omit<Event, 'id' | 'participants' | 'registeredParticipants'>): Promise<Event> => {
    // Format date strings
    const startDate = typeof eventData.date === 'string' 
      ? new Date(eventData.date) 
      : eventData.date;

    // Calculate end date if not provided (default to 2 hours after start)
    const endDate = eventData.registrationDeadline 
      ? new Date(eventData.registrationDeadline) 
      : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

    // Insert the event
    const { data, error } = await supabase
      .from('events')
      .insert({
        title: eventData.title,
        description: eventData.description,
        location: eventData.location,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        poster_url: eventData.image || null,
        thumbnail_url: eventData.thumbnail || null,
        members_only: eventData.membersOnly || false,
        registration_open: eventData.registrationDeadline !== undefined,
        maximum_participants: eventData.maxParticipants,
        published: eventData.isFeatured || false
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

    const eventId = data.id;

    // Insert schedule items if provided
    if (eventData.schedule && eventData.schedule.length > 0) {
      const scheduleToInsert = eventData.schedule.map((item, index) => {
        // Parse time (assuming format like "14:30")
        const [hours, minutes] = item.time.split(':').map(Number);
        const itemDate = new Date(startDate);
        itemDate.setHours(hours, minutes, 0);

        return {
          event_id: eventId,
          title: item.description,
          description: '',
          start_time: itemDate.toISOString()
        };
      });

      const { error: scheduleError } = await supabase
        .from('event_schedule')
        .insert(scheduleToInsert);

      if (scheduleError) {
        console.error('Error inserting schedule:', scheduleError);
      }
    }

    // Insert stops if provided
    if (eventData.stops && eventData.stops.length > 0) {
      const stopsToInsert = eventData.stops.map((stop, index) => ({
        event_id: eventId,
        name: stop.name,
        description: stop.description,
        location: eventData.location, // Default to event location
        photo_url: stop.image || null,
        order_index: index
      }));

      const { error: stopsError } = await supabase
        .from('event_stops')
        .insert(stopsToInsert);

      if (stopsError) {
        console.error('Error inserting stops:', stopsError);
      }
    }

    toast({
      title: 'Sucesso',
      description: 'Evento criado com sucesso.',
    });

    // Return the created event
    return {
      ...eventData,
      id: eventId,
      participants: 0,
      registeredParticipants: []
    };
  };

  // Update an existing event
  const updateEvent = async (eventData: Event): Promise<Event> => {
    // Format date strings
    const startDate = typeof eventData.date === 'string' 
      ? new Date(eventData.date) 
      : eventData.date;

    // Calculate end date if not provided (default to 2 hours after start)
    const endDate = eventData.registrationDeadline 
      ? new Date(eventData.registrationDeadline) 
      : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

    // Update the event
    const { data, error } = await supabase
      .from('events')
      .update({
        title: eventData.title,
        description: eventData.description,
        location: eventData.location,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        poster_url: eventData.image || null,
        thumbnail_url: eventData.thumbnail || null,
        members_only: eventData.membersOnly || false,
        registration_open: eventData.registrationDeadline !== undefined,
        maximum_participants: eventData.maxParticipants,
        published: eventData.isFeatured || false
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

    return eventData;
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
        description: 'Não foi possível excluir o evento.',
        variant: 'destructive',
      });
      throw error;
    }

    toast({
      title: 'Sucesso',
      description: 'Evento excluído com sucesso.',
    });
  };

  // Register a participant for an event
  const registerParticipant = async (eventId: string, data: {
    memberId?: string;
    externalName?: string;
    externalEmail?: string;
    externalPhone?: string;
    vehicleId?: string;
    notes?: string;
  }): Promise<void> => {
    const { error } = await supabase
      .from('event_registrations')
      .insert({
        event_id: eventId,
        member_id: data.memberId || null,
        external_name: data.externalName || null,
        external_email: data.externalEmail || null,
        external_phone: data.externalPhone || null,
        vehicle_id: data.vehicleId || null,
        notes: data.notes || null
      });

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar o participante.',
        variant: 'destructive',
      });
      throw error;
    }

    toast({
      title: 'Sucesso',
      description: 'Inscrição realizada com sucesso.',
    });
  };

  // Cancel a registration
  const cancelRegistration = async (registrationId: string): Promise<void> => {
    const { error } = await supabase
      .from('event_registrations')
      .update({ status: 'cancelled' })
      .eq('id', registrationId);

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível cancelar a inscrição.',
        variant: 'destructive',
      });
      throw error;
    }

    toast({
      title: 'Sucesso',
      description: 'Inscrição cancelada com sucesso.',
    });
  };

  // React Query hooks
  const eventsQuery = useQuery({
    queryKey: ['events'],
    queryFn: getEvents
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

  const registerParticipantMutation = useMutation({
    mutationFn: ({ eventId, data }: { eventId: string; data: Parameters<typeof registerParticipant>[1] }) =>
      registerParticipant(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    }
  });

  const cancelRegistrationMutation = useMutation({
    mutationFn: cancelRegistration,
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
    registerParticipant: registerParticipantMutation.mutate,
    cancelRegistration: cancelRegistrationMutation.mutate,
  };
};
