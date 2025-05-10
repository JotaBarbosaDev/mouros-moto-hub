import { useState } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Event } from '@/types/events';
import { useToast } from "@/hooks/use-toast";

// Tipos de compromissos para a agenda da diretoria
export type CompromisoType = 
  | 'visita' 
  | 'visita-recebida' 
  | 'concentracao' 
  | 'evento-interno' 
  | 'reuniao' 
  | 'outro';

interface AddEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEvent: (event: Omit<Event, 'id'>) => void;
}

const defaultEventData: Omit<Event, 'id'> & { _isoDate?: string; _endDate?: string } = {
  title: '',
  date: format(new Date(), 'dd/MM/yyyy'),
  location: '',
  image: '/placeholders/default-event.jpg',
  thumbnail: '/placeholders/default-event.jpg',
  type: 'encontro',
  description: '',
  membersOnly: true, // Por padrão, compromissos são apenas para membros da diretoria
  registrationOpen: false, // Por padrão, não é necessário inscrição
  _isoDate: new Date().toISOString(), // Armazenar a data ISO para uso no envio à API
  isFeatured: false, // Para campo published
  // Criar uma data de término padrão que será 1 dia depois da data de início
  _endDate: (() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString();
  })()
};

export const AddEventDialog = ({ isOpen, onClose, onAddEvent }: AddEventDialogProps) => {
  const [eventData, setEventData] = useState<Omit<Event, 'id'> & { _isoDate?: string; _endDate?: string }>(defaultEventData);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [compromisoType, setCompromisoType] = useState<CompromisoType>('visita');
  const [motoclube, setMotoclube] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Evita múltiplos envios
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    // Atualiza o título e informações de acordo com o tipo de compromisso
    let titulo = eventData.title;
    let descricao = eventData.description;
    
    // Se não foi definido um título personalizado, cria um baseado no tipo de compromisso
    if (!titulo || titulo.trim() === '') {
      switch (compromisoType) {
        case 'visita':
          titulo = `Visita ao ${motoclube}`;
          break;
        case 'visita-recebida':
          titulo = `Visita do ${motoclube}`;
          break;
        case 'concentracao':
          titulo = `Concentração: ${eventData.description}`;
          break;
        case 'evento-interno':
          titulo = `Evento interno: ${eventData.description}`;
          break;
        case 'reuniao':
          titulo = `Reunião: ${eventData.description}`;
          break;
        case 'outro':
          titulo = `Compromisso: ${eventData.description}`;
          break;
      }
    }
    
    // Adiciona o tipo de compromisso à descrição se não estiver vazio
    if (motoclube && (compromisoType === 'visita' || compromisoType === 'visita-recebida')) {
      descricao = `Motoclube: ${motoclube}\n${descricao}`;
    }
    
    const updatedEventData = {
      ...eventData,
      title: titulo,
      description: descricao || ' ' // Garante que nunca é vazio
    };
    
    // Validação básica
    if (!updatedEventData.date || !updatedEventData.location) {
      toast({
        title: "Erro ao criar compromisso",
        description: "Por favor, preencha a data e o local do compromisso.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }
    
    try {
      await onAddEvent(updatedEventData);
      resetForm();
      onClose();
      
      toast({
        title: "Compromisso agendado",
        description: "O compromisso foi adicionado ao calendário com sucesso."
      });
    } catch (error) {
      console.error("Erro ao adicionar evento:", error);
      
      toast({
        title: "Erro ao agendar compromisso",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao salvar o compromisso.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setEventData(defaultEventData);
    setSelectedDate(new Date());
    setCompromisoType('visita');
    setMotoclube('');
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      
      // Quando a data for selecionada, crie também uma data de término que seja um dia depois
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      setEventData(prev => ({
        ...prev,
        date: format(date, 'dd/MM/yyyy'),
        // Armazenar a data ISO para uso no envio à API
        _isoDate: date.toISOString(),
        // Armazenar uma data de término que é sempre pelo menos um dia depois da data de início
        _endDate: endDate.toISOString(),
        // Atualizar registrationDeadline também para compatibilidade com o restante do código
        registrationDeadline: endDate.toISOString()
      }));
      setDatePickerOpen(false);
    }
  };

  // Define o tipo de evento no formato esperado pelo backend baseado no tipo de compromisso
  const mapCompromisoToEventType = (tipo: CompromisoType): 'trail' | 'estrada' | 'encontro' | 'solidario' => {
    switch (tipo) {
      case 'visita':
      case 'visita-recebida':
        return 'encontro';
      case 'concentracao':
        return 'encontro';
      case 'evento-interno':
        return 'encontro';
      case 'reuniao':
        return 'encontro';
      case 'outro':
        return 'encontro';
      default:
        return 'encontro';
    }
  };

  // Atualiza o tipo de evento quando o tipo de compromisso muda
  const handleCompromisoTypeChange = (type: CompromisoType) => {
    setCompromisoType(type);
    setEventData(prev => ({
      ...prev,
      type: mapCompromisoToEventType(type)
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl">Agendar Compromisso</DialogTitle>
            <DialogDescription>
              Adicione um compromisso à agenda da diretoria.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 my-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Tipo de Compromisso*
              </label>
              <Select
                value={compromisoType}
                onValueChange={(value: CompromisoType) => handleCompromisoTypeChange(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visita">Visitar Outro Motoclube</SelectItem>
                  <SelectItem value="visita-recebida">Receber Visita</SelectItem>
                  <SelectItem value="concentracao">Participar de Concentração</SelectItem>
                  <SelectItem value="evento-interno">Evento Interno</SelectItem>
                  <SelectItem value="reuniao">Reunião</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {(compromisoType === 'visita' || compromisoType === 'visita-recebida') && (
              <div className="space-y-2">
                <label htmlFor="motoclube" className="text-sm font-medium">
                  Nome do Motoclube*
                </label>
                <Input
                  id="motoclube"
                  placeholder="Ex: MotoGalos MC"
                  value={motoclube}
                  onChange={(e) => setMotoclube(e.target.value)}
                  required
                />
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Título Personalizado
              </label>
              <Input
                id="title"
                placeholder="Deixe em branco para gerar automaticamente"
                value={eventData.title}
                onChange={(e) => setEventData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 items-start">
              <div className="w-full md:w-1/2 space-y-2">
                <label className="text-sm font-medium">
                  Data do Compromisso*
                </label>
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !eventData.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {eventData.date || "Selecionar data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="w-full md:w-1/2 space-y-2">
                <label htmlFor="hora" className="text-sm font-medium">
                  Horário
                </label>
                <Input
                  id="hora"
                  placeholder="Ex: 19:00"
                  onChange={(e) => {
                    const hora = e.target.value;
                    setEventData(prev => ({
                      ...prev,
                      description: `Horário: ${hora}\n${prev.description.split('\n').slice(1).join('\n')}`
                    }));
                  }}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium">
                Local*
              </label>
              <Input
                id="location"
                placeholder="Local do compromisso"
                value={eventData.location}
                onChange={(e) => setEventData(prev => ({ ...prev, location: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Detalhes Adicionais
              </label>
              <Textarea
                id="description"
                placeholder="Informações adicionais sobre o compromisso"
                rows={3}
                value={eventData.description}
                onChange={(e) => setEventData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            
            {(compromisoType === 'concentracao' || compromisoType === 'evento-interno') && (
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/2 space-y-2">
                  <label htmlFor="maxParticipants" className="text-sm font-medium">
                    Número de participantes
                  </label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    placeholder="Quantidade esperada"
                    value={eventData.maxParticipants || ''}
                    onChange={(e) => setEventData(prev => ({
                      ...prev,
                      maxParticipants: e.target.value ? parseInt(e.target.value) : undefined
                    }))}
                  />
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox 
                id="membersOnly" 
                checked={eventData.membersOnly}
                onCheckedChange={(checked) => 
                  setEventData(prev => ({ ...prev, membersOnly: !!checked }))
                }
              />
              <label
                htmlFor="membersOnly"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Apenas para diretoria
              </label>
            </div>
            
            {compromisoType === 'evento-interno' && (
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="all_members" 
                  checked={!eventData.membersOnly}
                  onCheckedChange={(checked) => 
                    setEventData(prev => ({ ...prev, membersOnly: !checked }))
                  }
                />
                <label
                  htmlFor="all_members"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Todos os sócios podem participar
                </label>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-mouro-red hover:bg-mouro-red/90 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Agendando..." : "Agendar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
