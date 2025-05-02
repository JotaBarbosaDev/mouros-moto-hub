
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { BarShift } from '@/hooks/use-bar-shifts';
import { Member, useMembers } from '@/hooks/use-members';

const shiftFormSchema = z.object({
  memberId: z.string().min(1, { message: "Seleção de membro é obrigatória" }),
  date: z.date({ required_error: "Data do turno é obrigatória" }),
  startTime: z.string().min(1, { message: "Hora de início é obrigatória" }),
  endTime: z.string().min(1, { message: "Hora de término é obrigatória" }),
  notes: z.string().optional(),
});

interface ShiftFormProps {
  onSubmit: (data: z.infer<typeof shiftFormSchema>) => void;
  initialData?: BarShift;
  scheduleId: string;
  minDate?: Date;
  maxDate?: Date;
}

export function ShiftForm({ onSubmit, initialData, scheduleId, minDate, maxDate }: ShiftFormProps) {
  const { members, isLoading } = useMembers();
  
  const getTimeString = (date: Date): string => {
    return format(date, 'HH:mm');
  };

  const form = useForm<z.infer<typeof shiftFormSchema>>({
    resolver: zodResolver(shiftFormSchema),
    defaultValues: initialData ? {
      memberId: initialData.memberId,
      date: new Date(initialData.startTime),
      startTime: getTimeString(initialData.startTime),
      endTime: getTimeString(initialData.endTime),
      notes: initialData.notes || ''
    } : {
      memberId: '',
      date: new Date(),
      startTime: '18:00',
      endTime: '22:00',
      notes: ''
    }
  });

  const handleFormSubmit = (data: z.infer<typeof shiftFormSchema>) => {
    const [startHour, startMinute] = data.startTime.split(':').map(Number);
    const [endHour, endMinute] = data.endTime.split(':').map(Number);

    const startTime = new Date(data.date);
    startTime.setHours(startHour, startMinute, 0);

    const endTime = new Date(data.date);
    endTime.setHours(endHour, endMinute, 0);

    // If end time is before start time, assume it's the next day
    if (endTime < startTime) {
      endTime.setDate(endTime.getDate() + 1);
    }

    onSubmit({
      ...data,
      startTime: data.startTime,
      endTime: data.endTime,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="memberId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Membro</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um membro" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoading ? (
                    <SelectItem value="loading" disabled>Carregando membros...</SelectItem>
                  ) : members.length === 0 ? (
                    <SelectItem value="empty" disabled>Nenhum membro encontrado</SelectItem>
                  ) : (
                    members.map(member => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name} ({member.memberNumber})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data do Turno</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => {
                      if (minDate && maxDate) {
                        // Check if date is outside of schedule range
                        return date < minDate || date > maxDate;
                      }
                      return false;
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora de Início</FormLabel>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-gray-400" />
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora de Fim</FormLabel>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-gray-400" />
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea placeholder="Observações adicionais (opcional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit">
          {initialData ? 'Atualizar Turno' : 'Adicionar Turno'}
        </Button>
      </form>
    </Form>
  );
}
