import { useState, useEffect } from 'react';
import { format, addMonths, subMonths, isSameMonth, isToday, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MembersLayout } from '@/components/layouts/MembersLayout';
import { Button } from "@/components/ui/button";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter,
  Beer,
  ListChecks
} from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useEvents } from '@/hooks/use-events';
import { cn } from '@/lib/utils';
import { Event } from '@/types/events';
import { AddEventDialog } from '@/components/AddEventDialog';
import { useBarShiftsDirect, BarShift } from '@/hooks/use-bar-shifts-direct';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// Interface para eventos do calendário (versão estendida do evento padrão)
interface CalendarEvent extends Event {
  startDate?: Date;
  endDate?: Date;
  color?: string;
  isShift?: boolean; // Indica se o evento é uma escala do bar
}

const CalendarPage = () => {
  const { events, isLoading, createEvent } = useEvents();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [calendarView, setCalendarView] = useState<'month' | 'agenda'>('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [includeShifts, setIncludeShifts] = useState(true);
  const [barShifts, setBarShifts] = useState<BarShift[]>([]); // Tipado corretamente
  const [isLoadingShifts, setIsLoadingShifts] = useState(false);
  const { toast } = useToast();
  
  // Carregar escalas do bar
  const barShiftsDirect = useBarShiftsDirect();
  
  // Carregar escalas quando o componente for montado ou quando a preferência mudar
  useEffect(() => {
    const loadShifts = async () => {
      if (includeShifts) {
        setIsLoadingShifts(true);
        try {
          const shifts = await barShiftsDirect.getAllShifts();
          setBarShifts(shifts || []);
        } catch (error) {
          console.error("Erro ao carregar escalas do bar:", error);
        } finally {
          setIsLoadingShifts(false);
        }
      }
    };
    
    loadShifts();
  }, [includeShifts, barShiftsDirect]);

  // Função auxiliar para determinar a cor do evento com base no tipo
  const getEventColor = (type: string) => {
    switch(type) {
      case 'trail':
        return '#22c55e'; // verde
      case 'estrada':
        return '#3b82f6'; // azul
      case 'solidario':
        return '#eab308'; // âmbar
      case 'visita':
        return '#ef4444'; // vermelho
      case 'visita_recebida':
        return '#f97316'; // laranja
      case 'concentracao':
        return '#06b6d4'; // ciano
      case 'bar_shift':
        return '#f59e0b'; // âmbar
      default:
        return '#8b5cf6'; // roxo para outros tipos
    }
  };

  // Processamento de eventos para o formato de calendário
  const calendarEvents: CalendarEvent[] = Array.isArray(events) ? events.map(event => {
    let startDate: Date;
    try {
      // Converter string de data para objeto Date
      const dateParts = (event.date || '').split('/');
      if (dateParts.length === 3) {
        // Formato brasileiro/português: DD/MM/YYYY
        startDate = new Date(
          parseInt(dateParts[2]), // ano
          parseInt(dateParts[1]) - 1, // mês (0-indexed)
          parseInt(dateParts[0]) // dia
        );
      } else {
        // Fallback para formato ISO
        startDate = event._isoDate ? parseISO(event._isoDate) : new Date();
      }
      
      // Verificar se a data é válida
      if (isNaN(startDate.getTime())) {
        startDate = new Date(); // Fallback para data atual
      }
    } catch (error) {
      console.error(`Erro ao processar data do evento ${event.id}:`, error);
      startDate = new Date(); // Fallback para data atual
    }
    
    // Criar uma cópia do evento com as datas processadas
    return {
      ...event,
      startDate,
      endDate: event.endDate ? new Date(event.endDate) : startDate,
      color: getEventColor(event.type),
      isShift: false
    };
  }) : [];
  
  // Converter escalas do bar em eventos de calendário
  const shiftEvents: CalendarEvent[] = includeShifts && Array.isArray(barShifts) ? barShifts.map(shift => {
    // Usar a data da escala ou a data de início como fallback
    const startDate = shift.date || shift.startTime;
    
    return {
      id: `shift-${shift.id}`,
      title: `Escala Bar: ${shift.description || shift.notes || 'Turno Regular'}`,
      date: format(startDate, 'dd/MM/yyyy'),
      location: 'Bar do Clube',
      description: `Responsável: ${shift.memberName || shift.assignedMemberName || 'A definir'}`,
      image: '',
      thumbnail: '',
      type: 'bar_shift',
      participants: 0,
      maxParticipants: 0,
      membersOnly: true,
      isFeatured: false,
      registrationOpen: false,
      startDate,
      endDate: startDate,
      color: '#f59e0b', // Cor específica para escalas
      isShift: true
    };
  }) : [];
  
  // Combinar eventos e escalas
  const allEvents = [...calendarEvents, ...(includeShifts ? shiftEvents : [])];
  
  // Filtrar eventos por termo de pesquisa e tipo
  const filteredEvents = allEvents.filter(event => {
    const matchesTerm = !searchTerm || 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || 
                       (filterType === 'shifts' && event.isShift) ||
                       (!event.isShift && event.type === filterType);
    
    return matchesTerm && matchesType;
  });
  
  // Eventos na data selecionada
  const eventsOnSelectedDate = selectedDate 
    ? filteredEvents.filter(event => 
        event.startDate && isSameDay(event.startDate, selectedDate)
      ) 
    : [];
  
  // Eventos no mês atual
  const eventsInMonth = filteredEvents.filter(event => 
    event.startDate && isSameMonth(event.startDate, currentMonth)
  );
  
  // Navegação do calendário
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventDetailsOpen(true);
  };
  
  // Opções de filtro
  const filterOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'trail', label: 'Trail' },
    { value: 'estrada', label: 'Estrada' },
    { value: 'solidario', label: 'Solidário' },
    { value: 'visita', label: 'Visita' },
    { value: 'visita_recebida', label: 'Visita Recebida' },
    { value: 'concentracao', label: 'Concentração' },
    { value: 'shifts', label: 'Escalas Bar' }
  ];
  
  // Função para verificar se uma data tem eventos agendados
  const hasEventOnDate = (date: Date) => {
    return allEvents.some(event => 
      event.startDate && isSameDay(event.startDate, date)
    );
  };
  
  return (
    <MembersLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-4xl font-display text-mouro-black mb-4 md:mb-0">
            <span className="text-mouro-red">Calendário</span> de Eventos
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Button 
              variant="default"
              onClick={() => setIsAddEventOpen(true)}
              className="sm:ml-auto"
            >
              <Plus className="h-4 w-4 mr-2" /> Novo Evento
            </Button>
          </div>
        </div>
        
        {/* Filtros e pesquisa */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Pesquisar eventos..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="show-shifts" 
              checked={includeShifts}
              onCheckedChange={setIncludeShifts} 
            />
            <Label htmlFor="show-shifts" className="flex items-center">
              <Beer className="mr-2 h-4 w-4" />
              Escalas do Bar
            </Label>
          </div>
        </div>
        
        <Tabs defaultValue="month" value={calendarView} onValueChange={(v) => setCalendarView(v as 'month' | 'agenda')}>
          <TabsList className="mb-4">
            <TabsTrigger value="month">Mensal</TabsTrigger>
            <TabsTrigger value="agenda">Agenda</TabsTrigger>
          </TabsList>
          
          <TabsContent value="month">
            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">
                    {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="icon" onClick={prevMonth}>
                      <ChevronLeft className="h-4 w-4" />
                      <span className="sr-only">Mês anterior</span>
                    </Button>
                    <Button variant="outline" size="icon" onClick={nextMonth}>
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">Próximo mês</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-3">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    month={currentMonth}
                    className="rounded-md border"
                    disabled={{ before: new Date(2020, 0, 1) }}
                    modifiersStyles={{
                      selected: { backgroundColor: '#e11d48', color: 'white' },
                      today: { fontWeight: 'bold', borderColor: '#e11d48', color: '#e11d48' }
                    }}
                    modifiersClassNames={{
                      selected: "bg-mouro-red text-white hover:bg-mouro-red hover:text-white",
                      today: "border-mouro-red text-mouro-red font-medium"
                    }}
                    components={{
                      DayContent: ({ date, ...props }) => {
                        const hasEvent = hasEventOnDate(date);
                        
                        // Encontrar eventos nesta data
                        const dateEvents = allEvents.filter(event => 
                          event.startDate && isSameDay(event.startDate, date)
                        );
                        
                        // Limitar a 3 eventos para mostrar como pontos
                        const visibleEvents = dateEvents.slice(0, 3);
                        const hiddenEventCount = Math.max(0, dateEvents.length - 3);
                        
                        return (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className={cn(
                                  "h-9 w-9 p-0 flex flex-col justify-center items-center", 
                                  isToday(date) && "font-medium",
                                  hasEvent && !isSameDay(date, selectedDate) && "border-dashed border border-mouro-red/40"
                                )}>
                                  <div>{date.getDate()}</div>
                                  {hasEvent && (
                                    <div className="flex space-x-1 mt-1">
                                      {visibleEvents.map((event, idx) => (
                                        <div 
                                          key={idx}
                                          className="h-1 w-1 rounded-full"
                                          style={{ backgroundColor: event.color }}
                                        />
                                      ))}
                                      {hiddenEventCount > 0 && (
                                        <div className="h-1 w-1 rounded-full bg-gray-400" />
                                      )}
                                    </div>
                                  )}
                                </div>
                              </TooltipTrigger>
                              {hasEvent && (
                                <TooltipContent>
                                  <div className="text-xs">
                                    {dateEvents.slice(0, 5).map((event, idx) => (
                                      <div key={idx} className="whitespace-nowrap">
                                        <span 
                                          className="h-2 w-2 inline-block rounded-full mr-1"
                                          style={{ backgroundColor: event.color }}
                                        ></span>
                                        {event.title}
                                      </div>
                                    ))}
                                    {dateEvents.length > 5 && (
                                      <div className="text-gray-400">
                                        +{dateEvents.length - 5} mais eventos
                                      </div>
                                    )}
                                  </div>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        );
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Lista de eventos do dia selecionado */}
            {selectedDate && (
              <Card className="mt-8 border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl">
                    Eventos de {format(selectedDate, 'dd/MM/yyyy')}
                  </CardTitle>
                  <CardDescription>
                    {eventsOnSelectedDate.length === 0 
                      ? "Nenhum evento agendado para esta data" 
                      : `${eventsOnSelectedDate.length} evento(s) agendado(s)`
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading || isLoadingShifts ? (
                    <div className="flex justify-center items-center h-32">
                      <p>Carregando eventos...</p>
                    </div>
                  ) : eventsOnSelectedDate.length > 0 ? (
                    <div className="space-y-4">
                      {eventsOnSelectedDate.map((event) => (
                        <div 
                          key={event.id} 
                          className="flex items-start border rounded-lg p-3 cursor-pointer hover:bg-gray-50"
                          onClick={() => handleEventClick(event)}
                        >
                          <div 
                            className="w-2 h-12 rounded-full mr-4 my-1" 
                            style={{ backgroundColor: event.color || '#e11d48' }}
                          />
                          <div className="flex-grow">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium">{event.title}</h3>
                              <Badge 
                                className={cn(
                                  "ml-2",
                                  event.type === "trail" ? "bg-green-600 text-white" : 
                                  event.type === "estrada" ? "bg-blue-600 text-white" : 
                                  event.type === "solidario" ? "bg-amber-600 text-white" : 
                                  event.type === "visita" ? "bg-red-500 text-white" :
                                  event.type === "visita_recebida" ? "bg-orange-500 text-white" :
                                  event.type === "concentracao" ? "bg-sky-500 text-white" :
                                  event.type === "bar_shift" ? "bg-amber-500 text-white" :
                                  "bg-purple-600 text-white"
                                )}
                              >
                                {event.isShift ? 'Escala Bar' : 
                                 event.type.charAt(0).toUpperCase() + event.type.slice(1).replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-1">{event.location}</p>
                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                              <CalendarIcon className="h-3 w-3 mr-1" />
                              <span>{event.date}</span>
                              {!event.isShift && event.registrationDeadline && (
                                <span className="ml-2">
                                  (Inscrições até {new Date(event.registrationDeadline).toLocaleDateString()})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground opacity-30" />
                      <p className="mt-2 text-muted-foreground">Nenhum evento agendado para esta data</p>
                      <p className="text-sm text-muted-foreground">Selecione outra data ou crie um novo evento</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="agenda">
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Lista de Compromissos</CardTitle>
                <CardDescription>
                  {filteredEvents.length === 0 
                    ? "Nenhum evento agendado para este período" 
                    : `${filteredEvents.length} evento(s) agendado(s)`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading || isLoadingShifts ? (
                  <div className="flex justify-center items-center h-32">
                    <p>Carregando eventos...</p>
                  </div>
                ) : filteredEvents.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {filteredEvents
                      .sort((a, b) => {
                        if (!a.startDate || !b.startDate) return 0;
                        return a.startDate.getTime() - b.startDate.getTime();
                      })
                      .map((event) => (
                        <div 
                          key={event.id} 
                          className="py-4 cursor-pointer hover:bg-gray-50 rounded-md px-2"
                          onClick={() => handleEventClick(event)}
                        >
                          <div className="flex items-center gap-4">
                            <div 
                              className="h-12 w-12 rounded-full flex items-center justify-center text-white"
                              style={{ backgroundColor: event.color || '#e11d48' }}
                            >
                              {event.isShift ? (
                                <Beer className="h-6 w-6" />
                              ) : (
                                event.startDate && (
                                  <div className="text-center">
                                    <div className="text-xs font-medium">
                                      {format(event.startDate, 'MMM', { locale: ptBR })}
                                    </div>
                                    <div className="text-lg font-bold leading-none">
                                      {format(event.startDate, 'dd')}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                            <div className="flex-grow">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium">{event.title}</h3>
                                <Badge 
                                  className={cn(
                                    "ml-2",
                                    event.isShift ? "bg-amber-500 text-white" :
                                    event.type === "trail" ? "bg-green-600 text-white" : 
                                    event.type === "estrada" ? "bg-blue-600 text-white" : 
                                    event.type === "solidario" ? "bg-amber-600 text-white" : 
                                    event.type === "visita" ? "bg-red-500 text-white" :
                                    event.type === "visita_recebida" ? "bg-orange-500 text-white" :
                                    event.type === "concentracao" ? "bg-sky-500 text-white" :
                                    "bg-purple-600 text-white"
                                  )}
                                >
                                  {event.isShift ? 'Escala Bar' : 
                                    event.type.charAt(0).toUpperCase() + event.type.slice(1).replace('_', ' ')}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{event.location}</p>
                              <div className="flex items-center text-xs text-muted-foreground mt-1">
                                <CalendarIcon className="h-3 w-3 mr-1" />
                                <span>{event.date}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground opacity-30" />
                    <p className="mt-2 text-muted-foreground">Nenhum evento encontrado com os filtros atuais</p>
                    <p className="text-sm text-muted-foreground">Tente diferentes critérios de pesquisa ou crie um novo evento</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Diálogo de detalhes do evento */}
        {selectedEvent && (
          <Dialog open={isEventDetailsOpen} onOpenChange={setIsEventDetailsOpen}>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedEvent.title}</DialogTitle>
                <DialogDescription>
                  {selectedEvent.date}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {selectedEvent.image && (
                  <div className="w-full h-48 overflow-hidden rounded-lg">
                    <img 
                      src={selectedEvent.image} 
                      alt={selectedEvent.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Badge 
                    className={cn(
                      selectedEvent.isShift ? "bg-amber-500 text-white" :
                      selectedEvent.type === "trail" ? "bg-green-600 text-white" : 
                      selectedEvent.type === "estrada" ? "bg-blue-600 text-white" : 
                      selectedEvent.type === "solidario" ? "bg-amber-600 text-white" : 
                      selectedEvent.type === "visita" ? "bg-red-500 text-white" :
                      selectedEvent.type === "visita_recebida" ? "bg-orange-500 text-white" :
                      selectedEvent.type === "concentracao" ? "bg-sky-500 text-white" :
                      "bg-purple-600 text-white"
                    )}
                  >
                    {selectedEvent.isShift ? 'Escala Bar' : 
                      selectedEvent.type.charAt(0).toUpperCase() + selectedEvent.type.slice(1).replace('_', ' ')}
                  </Badge>
                  
                  {selectedEvent.membersOnly && (
                    <Badge variant="outline">Somente Membros</Badge>
                  )}
                  
                  {selectedEvent.isFeatured && (
                    <Badge className="bg-mouro-red text-white">Destaque</Badge>
                  )}
                </div>
                
                {selectedEvent.location && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Local</h3>
                    <p>{selectedEvent.location}</p>
                  </div>
                )}
                
                {selectedEvent.description && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Descrição</h3>
                    <p className="text-sm">{selectedEvent.description}</p>
                  </div>
                )}
                
                {!selectedEvent.isShift && selectedEvent.registrationDeadline && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Inscrições até</h3>
                    <p className="text-sm">{new Date(selectedEvent.registrationDeadline).toLocaleDateString()}</p>
                  </div>
                )}
                
                {!selectedEvent.isShift && selectedEvent.participants !== undefined && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Participantes</h3>
                    <p className="text-sm">
                      {selectedEvent.participants} {selectedEvent.maxParticipants ? `de ${selectedEvent.maxParticipants}` : ''}
                    </p>
                  </div>
                )}
              </div>
              
              <DialogFooter className="sm:justify-between">
                <div>
                  {!selectedEvent.isShift && selectedEvent.registrationOpen && (
                    <Button variant="default">
                      Inscrever-se
                    </Button>
                  )}
                </div>
                <Button variant="outline" onClick={() => setIsEventDetailsOpen(false)}>
                  Fechar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        
        {/* Diálogo para adicionar evento */}
        <AddEventDialog 
          isOpen={isAddEventOpen}
          onClose={() => setIsAddEventOpen(false)}
          onAddEvent={(event) => {
            createEvent(event);
            setIsAddEventOpen(false);
          }}
        />
      </div>
    </MembersLayout>
  );
};

export default CalendarPage;
