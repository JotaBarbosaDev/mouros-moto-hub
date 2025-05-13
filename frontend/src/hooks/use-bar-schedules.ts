
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface BarSchedule {
  id: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const useBarSchedules = () => {
  const queryClient = useQueryClient();

  // Fetch all bar schedules
  const getSchedules = async (): Promise<BarSchedule[]> => {
    const { data, error } = await supabase
      .from('bar_schedules')
      .select('*')
      .order('start_date', { ascending: false });

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as escalas.',
        variant: 'destructive',
      });
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map(schedule => ({
      id: schedule.id,
      name: schedule.name,
      description: schedule.description,
      startDate: new Date(schedule.start_date),
      endDate: new Date(schedule.end_date),
      createdAt: new Date(schedule.created_at),
      updatedAt: new Date(schedule.updated_at)
    }));
  };

  // Create a new schedule
  const createSchedule = async (scheduleData: Omit<BarSchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<BarSchedule> => {
    const { data, error } = await supabase
      .from('bar_schedules')
      .insert({
        name: scheduleData.name,
        description: scheduleData.description,
        start_date: scheduleData.startDate.toISOString(),
        end_date: scheduleData.endDate.toISOString()
      })
      .select()
      .single();

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a escala.',
        variant: 'destructive',
      });
      throw error;
    }

    toast({
      title: 'Sucesso',
      description: 'Escala criada com sucesso.',
    });

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      startDate: new Date(data.start_date),
      endDate: new Date(data.end_date),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  };

  // Update an existing schedule
  const updateSchedule = async (scheduleData: BarSchedule): Promise<BarSchedule> => {
    const { data, error } = await supabase
      .from('bar_schedules')
      .update({
        name: scheduleData.name,
        description: scheduleData.description,
        start_date: scheduleData.startDate.toISOString(),
        end_date: scheduleData.endDate.toISOString(),
      })
      .eq('id', scheduleData.id)
      .select()
      .single();

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a escala.',
        variant: 'destructive',
      });
      throw error;
    }

    toast({
      title: 'Sucesso',
      description: 'Escala atualizada com sucesso.',
    });

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      startDate: new Date(data.start_date),
      endDate: new Date(data.end_date),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  };

  // Delete a schedule
  const deleteSchedule = async (scheduleId: string): Promise<void> => {
    const { error } = await supabase
      .from('bar_schedules')
      .delete()
      .eq('id', scheduleId);

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a escala.',
        variant: 'destructive',
      });
      throw error;
    }

    toast({
      title: 'Sucesso',
      description: 'Escala excluída com sucesso.',
    });
  };

  // React Query hooks
  const schedulesQuery = useQuery({
    queryKey: ['barSchedules'],
    queryFn: getSchedules
  });

  const createScheduleMutation = useMutation({
    mutationFn: createSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barSchedules'] });
    }
  });

  const updateScheduleMutation = useMutation({
    mutationFn: updateSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barSchedules'] });
    }
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: deleteSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barSchedules'] });
    }
  });

  return {
    schedules: schedulesQuery.data || [],
    isLoading: schedulesQuery.isLoading,
    isError: schedulesQuery.isError,
    createSchedule: createScheduleMutation.mutate,
    updateSchedule: updateScheduleMutation.mutate,
    deleteSchedule: deleteScheduleMutation.mutate
  };
};
