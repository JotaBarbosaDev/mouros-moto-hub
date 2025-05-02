
import { useState, useEffect } from 'react';
import { format, differenceInCalendarDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MembersLayout } from '@/components/layouts/MembersLayout';
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useBarSchedules, BarSchedule } from '@/hooks/use-bar-schedules';
import { useBarShifts, BarShift } from '@/hooks/use-bar-shifts';
import { ShiftList } from '@/components/scale/ShiftList';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ScheduleForm } from '@/components/scale/ScheduleForm';
import { ShiftForm } from '@/components/scale/ShiftForm';

const Scale = () => {
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>("");
  const [openScheduleDialog, setOpenScheduleDialog] = useState(false);
  const [openShiftDialog, setOpenShiftDialog] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<BarSchedule | undefined>(undefined);
  const [editingShift, setEditingShift] = useState<BarShift | undefined>(undefined);
  
  const { schedules, isLoading: isLoadingSchedules, createSchedule, updateSchedule, deleteSchedule } = useBarSchedules();
  const { getShiftsForSchedule, createShift, updateShift, deleteShift, updateShiftStatus } = useBarShifts();
  
  const { toast } = useToast();
  
  // Get shifts for the selected schedule
  const selectedScheduleShiftsQuery = getShiftsForSchedule(selectedScheduleId);
  const shifts = selectedScheduleShiftsQuery.data || [];
  const isLoadingShifts = selectedScheduleShiftsQuery.isLoading;
  
  // Get selected schedule details
  const selectedSchedule = schedules.find(s => s.id === selectedScheduleId);
  
  // Set the first schedule as selected if none is selected and schedules are loaded
  useEffect(() => {
    if (!selectedScheduleId && schedules.length > 0 && !isLoadingSchedules) {
      setSelectedScheduleId(schedules[0].id);
    }
  }, [schedules, selectedScheduleId, isLoadingSchedules]);
  
  // Handle schedule creation
  const handleCreateSchedule = (data: any) => {
    createSchedule(data, {
      onSuccess: (newSchedule) => {
        setSelectedScheduleId(newSchedule.id);
        setOpenScheduleDialog(false);
        toast({
          title: "Escala criada",
          description: `A escala "${newSchedule.name}" foi criada com sucesso.`
        });
      }
    });
  };
  
  // Handle schedule update
  const handleUpdateSchedule = (data: any) => {
    if (editingSchedule) {
      updateSchedule(
        { ...data, id: editingSchedule.id },
        {
          onSuccess: () => {
            setOpenScheduleDialog(false);
            setEditingSchedule(undefined);
            toast({
              title: "Escala atualizada",
              description: "A escala foi atualizada com sucesso."
            });
          }
        }
      );
    }
  };
  
  // Handle shift creation
  const handleCreateShift = (data: any) => {
    const startDate = new Date(data.date);
    const [startHour, startMinute] = data.startTime.split(':').map(Number);
    startDate.setHours(startHour, startMinute, 0);
    
    const endDate = new Date(data.date);
    const [endHour, endMinute] = data.endTime.split(':').map(Number);
    endDate.setHours(endHour, endMinute, 0);
    
    // If end time is earlier than start time, it means it ends the next day
    if (endDate < startDate) {
      endDate.setDate(endDate.getDate() + 1);
    }
    
    createShift(
      {
        scheduleId: selectedScheduleId,
        memberId: data.memberId,
        startTime: startDate,
        endTime: endDate,
        status: 'scheduled',
        notes: data.notes
      },
      {
        onSuccess: () => {
          setOpenShiftDialog(false);
          toast({
            title: "Turno adicionado",
            description: "O turno foi adicionado com sucesso à escala."
          });
        },
        onError: (error) => {
          toast({
            title: "Erro",
            description: error.message,
            variant: "destructive"
          });
        }
      }
    );
  };
  
  // Handle shift update
  const handleUpdateShift = (data: any) => {
    if (editingShift) {
      const startDate = new Date(data.date);
      const [startHour, startMinute] = data.startTime.split(':').map(Number);
      startDate.setHours(startHour, startMinute, 0);
      
      const endDate = new Date(data.date);
      const [endHour, endMinute] = data.endTime.split(':').map(Number);
      endDate.setHours(endHour, endMinute, 0);
      
      // If end time is earlier than start time, it means it ends the next day
      if (endDate < startDate) {
        endDate.setDate(endDate.getDate() + 1);
      }
      
      updateShift(
        {
          ...editingShift,
          memberId: data.memberId,
          startTime: startDate,
          endTime: endDate,
          notes: data.notes
        },
        {
          onSuccess: () => {
            setOpenShiftDialog(false);
            setEditingShift(undefined);
            toast({
              title: "Turno atualizado",
              description: "O turno foi atualizado com sucesso."
            });
          }
        }
      );
    }
  };
  
  // Handle opening the edit shift dialog
  const handleEditShift = (shift: BarShift) => {
    setEditingShift(shift);
    setOpenShiftDialog(true);
  };
  
  // Handle deleting a shift
  const handleDeleteShift = (shiftId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este turno?')) {
      deleteShift(shiftId, {
        onSuccess: () => {
          toast({
            title: "Turno excluído",
            description: "O turno foi excluído com sucesso."
          });
        }
      });
    }
  };
  
  // Calculate schedule stats
  const calculateScheduleStats = (schedule?: BarSchedule) => {
    if (!schedule) return { totalDays: 0, shiftsCount: 0 };
    
    const totalDays = differenceInCalendarDays(schedule.endDate, schedule.startDate) + 1;
    const shiftsCount = shifts.length;
    
    return { totalDays, shiftsCount };
  };
  
  const { totalDays, shiftsCount } = calculateScheduleStats(selectedSchedule);
  
  return (
    <MembersLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-4xl font-display text-mouro-black">
            Escala <span className="text-mouro-red">Semanal</span>
          </h1>
          <div className="flex gap-2">
            <Dialog open={openScheduleDialog} onOpenChange={setOpenScheduleDialog}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-mouro-red hover:bg-mouro-red/90" 
                  onClick={() => setEditingSchedule(undefined)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Escala
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>{editingSchedule ? 'Editar Escala' : 'Nova Escala'}</DialogTitle>
                  <DialogDescription>
                    {editingSchedule 
                      ? 'Atualize os detalhes da escala existente.'
                      : 'Defina o nome, descrição e período da nova escala.'
                    }
                  </DialogDescription>
                </DialogHeader>
                <ScheduleForm 
                  onSubmit={editingSchedule ? handleUpdateSchedule : handleCreateSchedule} 
                  initialData={editingSchedule}
                />
              </DialogContent>
            </Dialog>
            
            {selectedSchedule && (
              <Dialog open={openShiftDialog} onOpenChange={setOpenShiftDialog}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline"
                    onClick={() => setEditingShift(undefined)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Turno
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>{editingShift ? 'Editar Turno' : 'Novo Turno'}</DialogTitle>
                    <DialogDescription>
                      {editingShift 
                        ? 'Atualize os detalhes do turno existente.'
                        : 'Adicione um novo turno à escala atual.'
                      }
                    </DialogDescription>
                  </DialogHeader>
                  <ShiftForm 
                    onSubmit={editingShift ? handleUpdateShift : handleCreateShift}
                    initialData={editingShift}
                    scheduleId={selectedScheduleId}
                    minDate={selectedSchedule?.startDate}
                    maxDate={selectedSchedule?.endDate}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {isLoadingSchedules ? (
          <div className="flex justify-center items-center h-64">
            <p>Carregando escalas...</p>
          </div>
        ) : schedules.length === 0 ? (
          <Card className="text-center py-12 bg-slate-50">
            <CardContent>
              <h3 className="text-xl font-medium text-slate-900 mb-2">Nenhuma escala criada</h3>
              <p className="text-sm text-slate-500 mb-6">
                Não há escalas disponíveis. Clique em "Nova Escala" para criar sua primeira escala.
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-mouro-red hover:bg-mouro-red/90" 
                    onClick={() => setOpenScheduleDialog(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Escala
                  </Button>
                </DialogTrigger>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <div className="w-full md:w-auto">
                  <Select value={selectedScheduleId} onValueChange={setSelectedScheduleId}>
                    <SelectTrigger className="w-full md:w-[300px]">
                      <SelectValue placeholder="Selecione uma escala" />
                    </SelectTrigger>
                    <SelectContent>
                      {schedules.map(schedule => (
                        <SelectItem key={schedule.id} value={schedule.id}>
                          {schedule.name} ({format(new Date(schedule.startDate), 'dd/MM/yyyy')} - {format(new Date(schedule.endDate), 'dd/MM/yyyy')})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedSchedule && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setEditingSchedule(selectedSchedule);
                        setOpenScheduleDialog(true);
                      }}
                    >
                      Editar Escala
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        if (window.confirm('Tem certeza que deseja excluir esta escala? Todos os turnos associados serão removidos.')) {
                          deleteSchedule(selectedSchedule.id, {
                            onSuccess: () => {
                              if (schedules.length > 1) {
                                const otherScheduleId = schedules.find(s => s.id !== selectedSchedule.id)?.id;
                                if (otherScheduleId) setSelectedScheduleId(otherScheduleId);
                              } else {
                                setSelectedScheduleId("");
                              }
                              toast({
                                title: "Escala excluída",
                                description: "A escala foi excluída com sucesso."
                              });
                            }
                          });
                        }
                      }}
                    >
                      Excluir Escala
                    </Button>
                  </div>
                )}
              </div>
              
              {selectedSchedule && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Detalhes da Escala</CardTitle>
                      <CardDescription>{selectedSchedule.name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-2">{selectedSchedule.description || "Sem descrição"}</p>
                      <div className="text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Início:</span>
                          <span>{format(new Date(selectedSchedule.startDate), "dd/MM/yyyy")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Fim:</span>
                          <span>{format(new Date(selectedSchedule.endDate), "dd/MM/yyyy")}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Período</CardTitle>
                      <CardDescription>Total de dias</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{totalDays} dias</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Turnos</CardTitle>
                      <CardDescription>Total de turnos alocados</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{shiftsCount}</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
            
            {selectedSchedule ? (
              isLoadingShifts ? (
                <div className="flex justify-center items-center h-64">
                  <p>Carregando turnos...</p>
                </div>
              ) : (
                <ShiftList
                  shifts={shifts}
                  onEditShift={handleEditShift}
                  onDeleteShift={handleDeleteShift}
                  onUpdateStatus={(shiftId, status) => {
                    updateShiftStatus({ shiftId, status });
                  }}
                />
              )
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-lg">
                <p className="text-slate-500">Selecione uma escala para visualizar os turnos.</p>
              </div>
            )}
          </>
        )}
      </div>
    </MembersLayout>
  );
};

export default Scale;
