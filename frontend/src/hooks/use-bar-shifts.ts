
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface BarShift {
  id: string;
  scheduleId: string;
  memberId: string;
  memberName?: string;
  startTime: Date;
  endTime: Date;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export const useBarShifts = () => {
  const queryClient = useQueryClient();

  // Fetch all bar shifts with member information
  const getBarShifts = async (scheduleId?: string): Promise<BarShift[]> => {
    let query = supabase
      .from('bar_shifts')
      .select(`
        *,
        members:member_id (name)
      `)
      .order('start_time', { ascending: true });
    
    if (scheduleId) {
      query = query.eq('schedule_id', scheduleId);
    }

    const { data, error } = await query;

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os turnos do bar.',
        variant: 'destructive',
      });
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map(shift => ({
      id: shift.id,
      scheduleId: shift.schedule_id,
      memberId: shift.member_id,
      memberName: shift.members?.name || 'Membro não encontrado',
      startTime: new Date(shift.start_time),
      endTime: new Date(shift.end_time),
      status: shift.status as 'scheduled' | 'completed' | 'cancelled',
      notes: shift.notes
    }));
  };

  // Create a new bar shift
  const createBarShift = async (shiftData: Omit<BarShift, 'id' | 'memberName'>): Promise<BarShift> => {
    // Check if member already has a shift on this day
    const shiftDate = new Date(shiftData.startTime);
    const startOfDay = new Date(shiftDate.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(shiftDate.setHours(23, 59, 59, 999)).toISOString();
    
    const { data: existingShifts } = await supabase
      .from('bar_shifts')
      .select('id')
      .eq('member_id', shiftData.memberId)
      .gte('start_time', startOfDay)
      .lte('start_time', endOfDay);
    
    if (existingShifts && existingShifts.length > 0) {
      toast({
        title: 'Erro',
        description: 'Este membro já tem um turno nesta data.',
        variant: 'destructive',
      });
      throw new Error('Member already has a shift on this date');
    }

    const { data, error } = await supabase
      .from('bar_shifts')
      .insert({
        schedule_id: shiftData.scheduleId,
        member_id: shiftData.memberId,
        start_time: shiftData.startTime.toISOString(),
        end_time: shiftData.endTime.toISOString(),
        status: shiftData.status,
        notes: shiftData.notes
      })
      .select(`
        *,
        members:member_id (name)
      `)
      .single();

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o turno.',
        variant: 'destructive',
      });
      throw error;
    }

    toast({
      title: 'Sucesso',
      description: 'Turno criado com sucesso.',
    });

    return {
      id: data.id,
      scheduleId: data.schedule_id,
      memberId: data.member_id,
      memberName: data.members?.name || 'Membro não encontrado',
      startTime: new Date(data.start_time),
      endTime: new Date(data.end_time),
      status: data.status as 'scheduled' | 'completed' | 'cancelled',
      notes: data.notes
    };
  };

  // Update a bar shift
  const updateBarShift = async (shiftData: BarShift): Promise<BarShift> => {
    const { data, error } = await supabase
      .from('bar_shifts')
      .update({
        member_id: shiftData.memberId,
        start_time: shiftData.startTime.toISOString(),
        end_time: shiftData.endTime.toISOString(),
        status: shiftData.status,
        notes: shiftData.notes
      })
      .eq('id', shiftData.id)
      .select(`
        *,
        members:member_id (name)
      `)
      .single();

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o turno.',
        variant: 'destructive',
      });
      throw error;
    }

    toast({
      title: 'Sucesso',
      description: 'Turno atualizado com sucesso.',
    });

    return {
      id: data.id,
      scheduleId: data.schedule_id,
      memberId: data.member_id,
      memberName: data.members?.name || 'Membro não encontrado',
      startTime: new Date(data.start_time),
      endTime: new Date(data.end_time),
      status: data.status as 'scheduled' | 'completed' | 'cancelled',
      notes: data.notes
    };
  };

  // Delete a bar shift
  const deleteBarShift = async (shiftId: string): Promise<void> => {
    const { error } = await supabase
      .from('bar_shifts')
      .delete()
      .eq('id', shiftId);

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o turno.',
        variant: 'destructive',
      });
      throw error;
    }

    toast({
      title: 'Sucesso',
      description: 'Turno excluído com sucesso.',
    });
  };

  // Update shift status
  const updateShiftStatus = async (shiftId: string, status: 'scheduled' | 'completed' | 'cancelled'): Promise<void> => {
    const { error } = await supabase
      .from('bar_shifts')
      .update({ status })
      .eq('id', shiftId);

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status do turno.',
        variant: 'destructive',
      });
      throw error;
    }

    toast({
      title: 'Sucesso',
      description: 'Status do turno atualizado com sucesso.',
    });
  };

  // React Query hooks
  const getShiftsForSchedule = (scheduleId: string) => {
    return useQuery({
      queryKey: ['barShifts', scheduleId],
      queryFn: () => getBarShifts(scheduleId),
      enabled: !!scheduleId
    });
  };

  const shiftsQuery = useQuery({
    queryKey: ['barShifts'],
    queryFn: () => getBarShifts()
  });

  const createShiftMutation = useMutation({
    mutationFn: createBarShift,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['barShifts'] });
      queryClient.invalidateQueries({ queryKey: ['barShifts', data.scheduleId] });
    }
  });

  const updateShiftMutation = useMutation({
    mutationFn: updateBarShift,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['barShifts'] });
      queryClient.invalidateQueries({ queryKey: ['barShifts', data.scheduleId] });
    }
  });

  const deleteShiftMutation = useMutation({
    mutationFn: deleteBarShift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barShifts'] });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ shiftId, status }: { shiftId: string; status: 'scheduled' | 'completed' | 'cancelled' }) =>
      updateShiftStatus(shiftId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barShifts'] });
    }
  });

  // Fetch all shifts regardless of schedule
  const getAllShifts = async (): Promise<BarShift[]> => {
    const { data, error } = await supabase
      .from('bar_shifts')
      .select(`
        *,
        members:member_id (name)
      `)
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching all bar shifts:', error);
      return [];
    }

    return (data || []).map(shift => ({
      id: shift.id,
      scheduleId: shift.schedule_id,
      memberId: shift.member_id,
      memberName: shift.members?.name || 'Membro não encontrado',
      startTime: new Date(shift.start_time),
      endTime: new Date(shift.end_time),
      status: shift.status as 'scheduled' | 'completed' | 'cancelled',
      notes: shift.notes
    }));
  };

  return {
    shifts: shiftsQuery.data || [],
    isLoading: shiftsQuery.isLoading,
    isError: shiftsQuery.isError,
    getShiftsForSchedule,
    getAllShifts,
    createShift: createShiftMutation.mutate,
    updateShift: updateShiftMutation.mutate,
    deleteShift: deleteShiftMutation.mutate,
    updateShiftStatus: updateStatusMutation.mutate
  };
};
