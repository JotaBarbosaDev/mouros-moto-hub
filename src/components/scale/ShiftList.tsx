
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, X, Edit, Trash } from 'lucide-react';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarShift } from '@/hooks/use-bar-shifts';

interface ShiftListProps {
  shifts: BarShift[];
  onEditShift: (shift: BarShift) => void;
  onDeleteShift: (shiftId: string) => void;
  onUpdateStatus: (shiftId: string, status: 'scheduled' | 'completed' | 'cancelled') => void;
}

export function ShiftList({ shifts, onEditShift, onDeleteShift, onUpdateStatus }: ShiftListProps) {
  const groupShiftsByDate = (shifts: BarShift[]) => {
    const grouped: Record<string, BarShift[]> = {};
    
    shifts.forEach(shift => {
      const dateString = format(new Date(shift.startTime), 'yyyy-MM-dd');
      if (!grouped[dateString]) {
        grouped[dateString] = [];
      }
      grouped[dateString].push(shift);
    });
    
    return Object.entries(grouped)
      .map(([dateString, shifts]) => ({
        date: new Date(dateString),
        shifts,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  };
  
  const groupedShifts = groupShiftsByDate(shifts);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-amber-500';
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return 'Agendado';
    }
  };
  
  return (
    <div className="space-y-6">
      {groupedShifts.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 rounded-lg">
          <p className="text-slate-500">Nenhum turno encontrado para esta escala.</p>
          <p className="text-sm text-slate-400">Clique em "Adicionar Turno" para começar.</p>
        </div>
      ) : (
        groupedShifts.map(({ date, shifts }) => (
          <div key={date.toISOString()} className="bg-white rounded-lg overflow-hidden shadow">
            <div className="bg-mouro-red text-white p-4">
              <h3 className="font-medium">
                {format(date, "EEEE", { locale: ptBR })} - {format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Membro</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Observações</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shifts.map(shift => (
                  <TableRow key={shift.id}>
                    <TableCell>
                      <div className="font-medium">{shift.memberName}</div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(shift.startTime), 'HH:mm')} - {format(new Date(shift.endTime), 'HH:mm')}
                    </TableCell>
                    <TableCell>
                      {shift.notes || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(shift.status)}>
                        {getStatusText(shift.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUpdateStatus(shift.id, 'completed')}
                          disabled={shift.status === 'completed'}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUpdateStatus(shift.id, shift.status === 'cancelled' ? 'scheduled' : 'cancelled')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditShift(shift)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDeleteShift(shift.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ))
      )}
    </div>
  );
}
