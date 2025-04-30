import { MembersLayout } from '@/components/layouts/MembersLayout';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, ChevronLeft, ChevronRight, Check, X, Settings } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { format, addMonths, subMonths, getDate, getDaysInMonth, isSameMonth, startOfMonth, endOfMonth, isWeekend } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface Member {
  id: string;
  name: string;
  memberNumber: string;
  isAdmin: boolean;
}

interface ScaleEntry {
  id: number;
  membro: string;
  memberNumber: string;
  dia: string;
  data: string;
  horario: string;
  funcao: 'Bar' | 'Recepção' | 'Limpeza' | 'Segurança' | 'Cozinha';
  confirmado: boolean;
  scaleType: 'default' | 'custom';
  active: boolean;
}

interface ScaleDefinition {
  id: string;
  name: string;
  days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday')[];
  schedule: { day: string; startTime: string; endTime: string }[];
  active: boolean;
}

// Mock data for members
const mockMembers: Member[] = [
  { id: '1', name: 'João Silva', memberNumber: '001', isAdmin: true },
  { id: '2', name: 'Ana Santos', memberNumber: '002', isAdmin: false },
  { id: '3', name: 'Miguel Costa', memberNumber: '003', isAdmin: true },
  { id: '4', name: 'Pedro Alves', memberNumber: '015', isAdmin: false },
  { id: '5', name: 'Ana Costa', memberNumber: '023', isAdmin: false },
  { id: '6', name: 'Carlos Lima', memberNumber: '008', isAdmin: true },
  { id: '7', name: 'Lucia Ferreira', memberNumber: '034', isAdmin: false },
  { id: '8', name: 'Roberto Oliveira', memberNumber: '019', isAdmin: false },
  { id: '9', name: 'Fátima Santos', memberNumber: '027', isAdmin: false },
  { id: '10', name: 'Jorge Nunes', memberNumber: '045', isAdmin: false },
];

// Mock data for scale definitions
const mockScaleDefinitions: ScaleDefinition[] = [
  {
    id: '1',
    name: 'Escala Padrão (Primeiro e Último Fim de Semana)',
    days: ['Saturday', 'Sunday'],
    schedule: [
      { day: 'Saturday', startTime: '20:00', endTime: '00:00' },
      { day: 'Sunday', startTime: '09:00', endTime: '12:00' },
    ],
    active: true,
  },
  {
    id: '2',
    name: 'Escala das Sextas',
    days: ['Friday'],
    schedule: [
      { day: 'Friday', startTime: '19:00', endTime: '23:00' },
    ],
    active: false,
  },
];

const getFunctionColor = (funcao: ScaleEntry['funcao']) => {
  switch (funcao) {
    case 'Bar': return 'bg-blue-500';
    case 'Recepção': return 'bg-green-500';
    case 'Limpeza': return 'bg-amber-500';
    case 'Segurança': return 'bg-red-500';
    case 'Cozinha': return 'bg-purple-500';
    default: return 'bg-gray-500';
  }
};

// Helper function to check if a date is on the first or last weekend of the month
const isFirstOrLastWeekendOfMonth = (date: Date): boolean => {
  const day = getDate(date);
  const daysInMonth = getDaysInMonth(date);
  
  // Check if it's a weekend
  if (!isWeekend(date)) return false;
  
  // First weekend (days 1-7)
  if (day <= 7) return true;
  
  // Last weekend (last 7 days of the month)
  if (day > daysInMonth - 7) return true;
  
  return false;
};

// Function to generate default scale entries based on rules
const generateDefaultScaleEntries = (year: number): ScaleEntry[] => {
  const scaleEntries: ScaleEntry[] = [];
  let entryId = 100; // Start with a higher ID to avoid conflicts with mock data
  
  // Store which members were assigned in the previous month's last weekend
  let lastWeekendMembersOfPreviousMonth: string[] = [];
  
  // Track how many times each member was assigned in a month
  const monthlyAssignments: Record<string, Record<string, number>> = {};
  
  // Functions to assign
  const functions: ScaleEntry['funcao'][] = ['Bar', 'Recepção', 'Segurança', 'Cozinha', 'Limpeza'];
  
  // Generate for each month of the year
  for (let month = 0; month < 12; month++) {
    const currentDate = new Date(year, month, 1);
    const daysInMonth = getDaysInMonth(currentDate);
    
    // Initialize monthly assignments
    const monthKey = `${year}-${month+1}`;
    monthlyAssignments[monthKey] = {};
    mockMembers.forEach(member => {
      monthlyAssignments[monthKey][member.id] = 0;
    });
    
    // Lists to keep track of assignments for this month
    const assignedMembersForFirstWeekend: string[] = [];
    const assignedMembersForLastWeekend: string[] = [];
    
    // Get admin members for random selection
    const adminMembers = mockMembers.filter(m => m.isAdmin);
    
    // Always assign two random admin members first (one for each weekend)
    if (adminMembers.length >= 2) {
      const shuffledAdmins = [...adminMembers].sort(() => Math.random() - 0.5);
      
      // For first weekend
      if (shuffledAdmins[0]) {
        assignedMembersForFirstWeekend.push(shuffledAdmins[0].id);
        monthlyAssignments[monthKey][shuffledAdmins[0].id]++;
      }
      
      // For last weekend
      if (shuffledAdmins[1] && shuffledAdmins[1].id !== shuffledAdmins[0].id) {
        assignedMembersForLastWeekend.push(shuffledAdmins[1].id);
        monthlyAssignments[monthKey][shuffledAdmins[1].id]++;
      } else if (shuffledAdmins[2]) {
        // Fallback to third admin if first two are the same
        assignedMembersForLastWeekend.push(shuffledAdmins[2].id);
        monthlyAssignments[monthKey][shuffledAdmins[2].id]++;
      }
    }
    
    // Find first weekend dates
    let firstWeekendDates: Date[] = [];
    for (let day = 1; day <= 7; day++) {
      const date = new Date(year, month, day);
      if (isWeekend(date)) {
        firstWeekendDates.push(date);
      }
    }
    
    // Find last weekend dates
    let lastWeekendDates: Date[] = [];
    for (let day = daysInMonth; day > daysInMonth - 7; day--) {
      const date = new Date(year, month, day);
      if (isWeekend(date)) {
        lastWeekendDates.push(date);
      }
    }
    
    // Sort dates in chronological order
    firstWeekendDates.sort((a, b) => a.getTime() - b.getTime());
    lastWeekendDates.sort((a, b) => a.getTime() - b.getTime());
    
    // Fill remaining slots for first weekend
    const eligibleMembersForFirstWeekend = mockMembers.filter(member => {
      // Exclude members who were assigned in the last weekend of the previous month
      return !lastWeekendMembersOfPreviousMonth.includes(member.id) &&
             !assignedMembersForFirstWeekend.includes(member.id);
    });
    
    const shuffledForFirst = [...eligibleMembersForFirstWeekend].sort(() => Math.random() - 0.5);
    
    // Add more members until we have enough for both Saturday and Sunday
    while (assignedMembersForFirstWeekend.length < Math.min(4, shuffledForFirst.length)) {
      const nextMember = shuffledForFirst[assignedMembersForFirstWeekend.length];
      if (nextMember && !assignedMembersForFirstWeekend.includes(nextMember.id)) {
        assignedMembersForFirstWeekend.push(nextMember.id);
        monthlyAssignments[monthKey][nextMember.id]++;
      }
    }
    
    // Create entries for first weekend
    firstWeekendDates.forEach((date, index) => {
      const isSaturday = date.getDay() === 6; // 6 is Saturday
      const shift = {
        startTime: isSaturday ? '20:00' : '09:00',
        endTime: isSaturday ? '00:00' : '12:00',
      };
      
      // Assign members to this shift
      const membersForThisShift = assignedMembersForFirstWeekend.slice(0, 2);
      membersForThisShift.forEach((memberId, idx) => {
        const member = mockMembers.find(m => m.id === memberId);
        if (member) {
          scaleEntries.push({
            id: entryId++,
            membro: member.name,
            memberNumber: member.memberNumber,
            dia: isSaturday ? 'Sábado' : 'Domingo',
            data: date.toISOString().split('T')[0],
            horario: `${shift.startTime} - ${shift.endTime}`,
            funcao: functions[idx % functions.length],
            confirmado: Math.random() > 0.3, // Random confirmation status
            scaleType: 'default',
            active: true,
          });
        }
      });
    });
    
    // Fill remaining slots for last weekend
    const eligibleMembersForLastWeekend = mockMembers.filter(member => {
      // Exclude members who were already assigned twice this month
      const assignments = monthlyAssignments[monthKey][member.id] || 0;
      return assignments < 2 && !assignedMembersForLastWeekend.includes(member.id);
    });
    
    const shuffledForLast = [...eligibleMembersForLastWeekend].sort(() => Math.random() - 0.5);
    
    // Add more members until we have enough for both Saturday and Sunday
    while (assignedMembersForLastWeekend.length < Math.min(4, shuffledForLast.length)) {
      const nextMember = shuffledForLast[assignedMembersForLastWeekend.length];
      if (nextMember && !assignedMembersForLastWeekend.includes(nextMember.id)) {
        assignedMembersForLastWeekend.push(nextMember.id);
        monthlyAssignments[monthKey][nextMember.id]++;
      }
    }
    
    // Create entries for last weekend
    lastWeekendDates.forEach((date, index) => {
      const isSaturday = date.getDay() === 6;
      const shift = {
        startTime: isSaturday ? '20:00' : '09:00',
        endTime: isSaturday ? '00:00' : '12:00',
      };
      
      // Assign members to this shift
      const membersForThisShift = assignedMembersForLastWeekend.slice(0, 2);
      membersForThisShift.forEach((memberId, idx) => {
        const member = mockMembers.find(m => m.id === memberId);
        if (member) {
          scaleEntries.push({
            id: entryId++,
            membro: member.name,
            memberNumber: member.memberNumber,
            dia: isSaturday ? 'Sábado' : 'Domingo',
            data: date.toISOString().split('T')[0],
            horario: `${shift.startTime} - ${shift.endTime}`,
            funcao: functions[idx % functions.length],
            confirmado: Math.random() > 0.3,
            scaleType: 'default',
            active: true,
          });
        }
      });
    });
    
    // Update the last weekend members for the next month's first weekend exclusion
    lastWeekendMembersOfPreviousMonth = [...assignedMembersForLastWeekend];
  }
  
  return scaleEntries;
};

// Generate default scale entries for the current year
const defaultScaleEntries = generateDefaultScaleEntries(new Date().getFullYear());

// Combine default entries only - no custom entries yet
const allMockScaleEntries: ScaleEntry[] = [...defaultScaleEntries];

// Schema for custom scale form
const scaleFormSchema = z.object({
  name: z.string().min(1, { message: "Nome da escala é obrigatório" }),
  days: z.array(z.string()).min(1, { message: "Selecione pelo menos um dia da semana" }),
  schedule: z.array(
    z.object({
      day: z.string(),
      startTime: z.string().min(1, { message: "Horário de início é obrigatório" }),
      endTime: z.string().min(1, { message: "Horário de término é obrigatório" }),
    })
  ),
});

const Scale = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [openNewScaleDialog, setOpenNewScaleDialog] = useState(false);
  const [scaleDefinitions, setScaleDefinitions] = useState<ScaleDefinition[]>(mockScaleDefinitions);
  const [scaleEntries, setScaleEntries] = useState<ScaleEntry[]>(allMockScaleEntries);
  
  const form = useForm<z.infer<typeof scaleFormSchema>>({
    defaultValues: {
      name: "",
      days: [],
      schedule: [],
    },
  });

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };
  
  const toggleScaleDefinitionActive = (id: string) => {
    setScaleDefinitions(prev => prev.map(def => 
      def.id === id ? { ...def, active: !def.active } : def
    ));
    
    // Update entries visibility based on scale definition
    setScaleEntries(prev => prev.map(entry => {
      // Find the scale definition this entry belongs to
      const relatedDef = scaleDefinitions.find(def => def.id === id);
      if (relatedDef) {
        // If entry is from this scale definition, update its active status
        if (entry.scaleType === 'default' && relatedDef.id === '1') {
          return { ...entry, active: !relatedDef.active };
        }
        // For custom scales, we would need more logic to match entries to definitions
      }
      return entry;
    }));
  };

  const formattedMonth = format(currentMonth, 'MMMM yyyy', { locale: ptBR });
  
  const onSubmitNewScale = (data: z.infer<typeof scaleFormSchema>) => {
    // Ensure schedule has all required fields explicitly set
    const validSchedule = data.schedule.map(item => ({
      day: item.day,
      startTime: item.startTime,
      endTime: item.endTime,
    }));
    
    // Add the new scale definition
    const newId = (scaleDefinitions.length + 1).toString();
    const newDefinition: ScaleDefinition = {
      id: newId,
      name: data.name,
      days: data.days as ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday')[],
      schedule: validSchedule,
      active: true,
    };
    
    setScaleDefinitions([...scaleDefinitions, newDefinition]);
    
    // We would also generate new entries based on this definition
    // but for simplicity in this mock we'll skip that step
    
    setOpenNewScaleDialog(false);
    form.reset();
  };
  
  const daysOfWeek = [
    { label: "Segunda", value: "Monday" },
    { label: "Terça", value: "Tuesday" },
    { label: "Quarta", value: "Wednesday" },
    { label: "Quinta", value: "Thursday" },
    { label: "Sexta", value: "Friday" },
    { label: "Sábado", value: "Saturday" },
    { label: "Domingo", value: "Sunday" },
  ];
  
  // Update schedule fields when days change
  const updateScheduleFields = (selectedDays: string[]) => {
    const schedule = selectedDays.map(day => ({
      day: day,
      startTime: "18:00",
      endTime: "22:00",
    }));
    form.setValue("schedule", schedule);
  };
  
  // Watch for days changes
  const selectedDays = form.watch("days");
  
  useEffect(() => {
    updateScheduleFields(selectedDays);
  }, [selectedDays]);

  return (
    <MembersLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-display text-mouro-black">
            Escala <span className="text-mouro-red">Semanal</span>
          </h1>
          <div className="flex gap-2">
            <Dialog open={openNewScaleDialog} onOpenChange={setOpenNewScaleDialog}>
              <DialogTrigger asChild>
                <Button className="bg-mouro-red hover:bg-mouro-red/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Escala
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Criar Nova Escala</DialogTitle>
                  <DialogDescription>
                    Defina o nome, dias da semana e horários da nova escala
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitNewScale)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Escala</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Escala de Sextas" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="days"
                      render={() => (
                        <FormItem>
                          <div className="mb-4">
                            <FormLabel>Dias da Semana</FormLabel>
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            {daysOfWeek.map((day) => (
                              <FormField
                                key={day.value}
                                control={form.control}
                                name="days"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={day.value}
                                      className="flex flex-row items-start space-x-2 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(day.value)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, day.value])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== day.value
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        {day.label}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {selectedDays.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Horários para cada dia</h3>
                        {selectedDays.map((day, index) => {
                          const dayLabel = daysOfWeek.find(d => d.value === day)?.label;
                          
                          return (
                            <div key={day} className="grid grid-cols-2 gap-4 p-4 border rounded">
                              <h4 className="text-md font-medium col-span-2">{dayLabel}</h4>
                              
                              <FormField
                                control={form.control}
                                name={`schedule.${index}.startTime`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Hora de Início</FormLabel>
                                    <FormControl>
                                      <Input type="time" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name={`schedule.${index}.endTime`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Hora de Fim</FormLabel>
                                    <FormControl>
                                      <Input type="time" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    <DialogFooter>
                      <Button type="submit">Criar Escala</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-8 p-4">
          <h2 className="text-xl font-semibold mb-4">Escalas Disponíveis</h2>
          <div className="space-y-4">
            {scaleDefinitions.map(scale => (
              <div key={scale.id} className="flex items-center justify-between p-4 border rounded">
                <div>
                  <h3 className="font-medium">{scale.name}</h3>
                  <div className="text-sm text-gray-600">
                    Dias: {scale.days.map(day => {
                      const dayLabel = daysOfWeek.find(d => d.value === day)?.label;
                      return dayLabel;
                    }).join(', ')}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className={scale.active ? 'bg-green-500' : 'bg-gray-400'}>
                    {scale.active ? 'Ativa' : 'Inativa'}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleScaleDefinitionActive(scale.id)}
                  >
                    {scale.active ? (
                      <>
                        <X className="h-4 w-4 mr-1" />
                        Desativar
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Ativar
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button variant="outline" size="icon" onClick={goToPreviousMonth} className="mr-2">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-mouro-red" />
              <span className="text-xl font-medium capitalize">{formattedMonth}</span>
            </div>
            <Button variant="outline" size="icon" onClick={goToNextMonth} className="ml-2">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Membro</TableHead>
                <TableHead>Nº</TableHead>
                <TableHead>Dia</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Horário</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scaleEntries.filter(item => {
                const scaleDate = new Date(item.data);
                return item.active && 
                       scaleDate.getMonth() === currentMonth.getMonth() &&
                       scaleDate.getFullYear() === currentMonth.getFullYear();
              }).sort((a, b) => {
                return new Date(a.data).getTime() - new Date(b.data).getTime();
              }).map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.membro}</TableCell>
                  <TableCell>{item.memberNumber}</TableCell>
                  <TableCell>{item.dia}</TableCell>
                  <TableCell>{new Date(item.data).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>{item.horario}</TableCell>
                  <TableCell>
                    <Badge className={getFunctionColor(item.funcao)}>
                      {item.funcao}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {item.scaleType === 'default' ? (
                      <Badge variant="outline" className="border-blue-500 text-blue-500">
                        Padrão
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-purple-500 text-purple-500">
                        Personalizada
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.confirmado ? (
                      <Badge className="bg-green-500">Confirmado</Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-500 border-amber-500">
                        Pendente
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {scaleEntries.filter(item => {
                const scaleDate = new Date(item.data);
                return item.active && 
                       scaleDate.getMonth() === currentMonth.getMonth() &&
                       scaleDate.getFullYear() === currentMonth.getFullYear();
              }).length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6">
                    Nenhuma escala encontrada para este mês
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </MembersLayout>
  );
};

export default Scale;
