// Hook para buscar escalas de bar diretamente, sem usar React Query
import { supabase } from '@/integrations/supabase/client';

export interface BarShift {
  id: string;
  scheduleId: string;
  memberId: string;
  memberName?: string;
  assignedMemberName?: string; // Campo adicional para compatibilidade
  startTime: Date;
  endTime: Date;
  date?: Date; // Campo adicional para compatibilidade com calendário
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  description?: string; // Campo adicional para compatibilidade
}

// Hook simples que não depende do React Query
export const useBarShiftsDirect = () => {
  // Busca todas as escalas
  const getAllShifts = async (): Promise<BarShift[]> => {
    try {
      const { data, error } = await supabase
        .from('bar_shifts')
        .select(`
          *,
          members:member_id (name)
        `)
        .order('start_time', { ascending: true });
  
      if (error) {
        console.error('Erro ao buscar escalas do bar:', error);
        return [];
      }
  
      return (data || []).map(shift => {
        const startTime = new Date(shift.start_time);
        return {
          id: shift.id,
          scheduleId: shift.schedule_id,
          memberId: shift.member_id,
          memberName: shift.members?.name || 'Membro não encontrado',
          assignedMemberName: shift.members?.name || 'Membro não encontrado', 
          startTime,
          endTime: new Date(shift.end_time),
          date: startTime, // Adicionando para facilitar uso no calendário
          status: shift.status as 'scheduled' | 'completed' | 'cancelled',
          notes: shift.notes,
          description: shift.notes || 'Turno de bar'
        };
      });
    } catch (err) {
      console.error("Erro ao buscar escalas:", err);
      return [];
    }
  };

  return {
    getAllShifts
  };
};
