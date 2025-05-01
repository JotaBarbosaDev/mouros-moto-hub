import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { Plus, X, Upload, Calendar } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { Event } from '@/types/events';

interface EventCreationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEventCreated: (event: Event) => void;
}

interface ScheduleItem {
  time: string;
  description: string;
}

interface StopPoint {
  name: string;
  description: string;
  image?: string;
}

const engineSizeOptions = [
  { value: "50", label: "50cc" },
  { value: "125", label: "125cc" },
  { value: "300", label: "300cc" },
  { value: "500", label: "500cc" },
  { value: "600", label: "600cc" },
  { value: "1000", label: "1000cc" }
];

const EventCreationDialog: React.FC<EventCreationDialogProps> = ({
  isOpen,
  onOpenChange,
  onEventCreated
}) => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([{ time: '', description: '' }]);
  const [stops, setStops] = useState<StopPoint[]>([]);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  
  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      date: '',
      location: '',
      type: 'trail',
      registrationDeadline: '',
      memberPrice: '',
      nonMemberPrice: '',
      membersOnly: false,
      minEngineSize: '',
      startPoint: '',
      endPoint: '',
      externalFormLink: '',
      isFeatured: false,
      maxParticipants: '',
      mainImage: null as File | null,
      thumbnailImage: null as File | null
    }
  });

  const handleMainImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('mainImage', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMainImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleThumbnailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('thumbnailImage', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addScheduleItem = () => {
    setSchedule([...schedule, { time: '', description: '' }]);
  };

  const removeScheduleItem = (index: number) => {
    const newSchedule = [...schedule];
    newSchedule.splice(index, 1);
    setSchedule(newSchedule);
  };

  const updateScheduleItem = (index: number, field: keyof ScheduleItem, value: string) => {
    const newSchedule = [...schedule];
    newSchedule[index][field] = value;
    setSchedule(newSchedule);
  };

  const addStopPoint = () => {
    setStops([...stops, { name: '', description: '' }]);
  };

  const removeStopPoint = (index: number) => {
    const newStops = [...stops];
    newStops.splice(index, 1);
    setStops(newStops);
  };

  const updateStopPoint = (index: number, field: keyof StopPoint, value: string) => {
    const newStops = [...stops];
    newStops[index][field] = value;
    setStops(newStops);
  };

  const handleStopImageChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newStops = [...stops];
        newStops[index].image = reader.result as string;
        setStops(newStops);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const onSubmit = (data: any) => {
    // In a real app, you would upload images to storage here
    // and get back URLs to store in the event object
    
    // For demo purposes, we'll use the image previews as URLs
    const newEvent: Event = {
      id: Date.now(), // Generate a temporary ID
      title: data.title,
      description: data.description,
      date: data.date,
      location: data.location,
      type: data.type,
      image: mainImagePreview || 'https://images.unsplash.com/photo-1605651202774-7d9ef66db4b9?auto=format&fit=crop&q=80',
      thumbnail: thumbnailPreview || 'https://images.unsplash.com/photo-1605651202774-7d9ef66db4b9?auto=format&fit=crop&q=80',
      registrationDeadline: data.registrationDeadline,
      memberPrice: data.memberPrice ? parseFloat(data.memberPrice) : undefined,
      nonMemberPrice: data.nonMemberPrice ? parseFloat(data.nonMemberPrice) : undefined,
      membersOnly: data.membersOnly,
      minEngineSize: data.minEngineSize ? parseInt(data.minEngineSize) : undefined,
      startPoint: data.startPoint,
      endPoint: data.endPoint,
      externalFormLink: data.externalFormLink,
      isFeatured: data.isFeatured,
      participants: 0,
      maxParticipants: data.maxParticipants ? parseInt(data.maxParticipants) : undefined,
      schedule: schedule.filter(item => item.time && item.description),
      stops: stops.filter(stop => stop.name),
      registeredParticipants: []
    };
    
    onEventCreated(newEvent);
    onOpenChange(false);
    toast({
      title: "Evento criado com sucesso!",
      description: `O evento "${data.title}" foi criado.`
    });
    
    // Reset form and state
    form.reset();
    setSchedule([{ time: '', description: '' }]);
    setStops([]);
    setMainImagePreview(null);
    setThumbnailPreview(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Evento</DialogTitle>
          <DialogDescription>
            Preencha os detalhes para criar um novo evento.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="general">Geral</TabsTrigger>
                <TabsTrigger value="schedule">Programa</TabsTrigger>
                <TabsTrigger value="route">Percurso</TabsTrigger>
                <TabsTrigger value="registration">Inscrições</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <FormField
                      control={form.control}
                      name="mainImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cartaz do Evento</FormLabel>
                          <FormControl>
                            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-md p-4 h-40">
                              {mainImagePreview ? (
                                <div className="relative w-full h-full">
                                  <img 
                                    src={mainImagePreview} 
                                    alt="Cartaz do evento" 
                                    className="w-full h-full object-cover rounded"
                                  />
                                  <Button
                                    type="button" 
                                    variant="secondary" 
                                    size="icon" 
                                    className="absolute top-1 right-1"
                                    onClick={() => {
                                      setMainImagePreview(null);
                                      form.setValue('mainImage', null);
                                    }}
                                  >
                                    <X size={16} />
                                  </Button>
                                </div>
                              ) : (
                                <label className="flex flex-col items-center cursor-pointer">
                                  <Upload size={24} />
                                  <span className="mt-2 text-sm">Carregar Imagem</span>
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={handleMainImageChange}
                                  />
                                </label>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div>
                    <FormField
                      control={form.control}
                      name="thumbnailImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Thumbnail</FormLabel>
                          <FormControl>
                            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-md p-4 h-40">
                              {thumbnailPreview ? (
                                <div className="relative w-full h-full">
                                  <img 
                                    src={thumbnailPreview} 
                                    alt="Thumbnail do evento" 
                                    className="w-full h-full object-cover rounded"
                                  />
                                  <Button
                                    type="button" 
                                    variant="secondary" 
                                    size="icon" 
                                    className="absolute top-1 right-1"
                                    onClick={() => {
                                      setThumbnailPreview(null);
                                      form.setValue('thumbnailImage', null);
                                    }}
                                  >
                                    <X size={16} />
                                  </Button>
                                </div>
                              ) : (
                                <label className="flex flex-col items-center cursor-pointer">
                                  <Upload size={24} />
                                  <span className="mt-2 text-sm">Carregar Thumbnail</span>
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={handleThumbnailChange}
                                  />
                                </label>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="title"
                  rules={{ required: "O título é obrigatório" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título do Evento</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Passeio Serra da Estrela" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="type"
                  rules={{ required: "O tipo de evento é obrigatório" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Evento</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo de evento" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="trail">Trail</SelectItem>
                          <SelectItem value="estrada">Estrada</SelectItem>
                          <SelectItem value="encontro">Encontro</SelectItem>
                          <SelectItem value="solidario">Solidário</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  rules={{ required: "A descrição é obrigatória" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição do Evento</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descreva o evento com detalhes..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    rules={{ required: "A data é obrigatória" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data do Evento</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="location"
                    rules={{ required: "A localização é obrigatória" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Localização Principal</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Serra da Estrela, Portugal" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <FormField
                    control={form.control}
                    name="isFeatured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          Destacar este evento na página principal
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="schedule" className="space-y-4 pt-4">
                <h3 className="font-medium text-lg">Programa do Evento</h3>
                <p className="text-sm text-muted-foreground">
                  Adicione os horários e descrições das atividades planejadas para o evento.
                </p>
                
                <div className="space-y-4">
                  {schedule.map((item, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-1/4">
                        <Input
                          placeholder="Horário (ex: 10:00)"
                          value={item.time}
                          onChange={(e) => updateScheduleItem(index, 'time', e.target.value)}
                        />
                      </div>
                      <div className="flex-1">
                        <Input
                          placeholder="Descrição da atividade"
                          value={item.description}
                          onChange={(e) => updateScheduleItem(index, 'description', e.target.value)}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeScheduleItem(index)}
                        disabled={schedule.length === 1}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={addScheduleItem}
                >
                  <Plus size={16} className="mr-2" />
                  Adicionar Horário
                </Button>
              </TabsContent>
              
              <TabsContent value="route" className="space-y-4 pt-4">
                <h3 className="font-medium text-lg">Percurso do Evento</h3>
                <p className="text-sm text-muted-foreground">
                  Defina os pontos de partida, chegada e paragens ao longo do percurso.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startPoint"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ponto de Partida</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Sede do Motoclube Mouros" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="endPoint"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ponto de Chegada</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Praia de Moledo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Separator className="my-4" />
                
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Pontos de Paragem</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addStopPoint}
                    >
                      <Plus size={16} className="mr-2" />
                      Adicionar Paragem
                    </Button>
                  </div>
                  
                  {stops.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhuma paragem adicionada. Clique no botão acima para adicionar.
                    </p>
                  )}
                  
                  <div className="space-y-4">
                    {stops.map((stop, index) => (
                      <div key={index} className="border rounded-md p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="font-medium">Paragem {index + 1}</h5>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeStopPoint(index)}
                          >
                            <X size={16} />
                          </Button>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium">Nome do Local</label>
                            <Input
                              placeholder="Ex: Café da Montanha"
                              value={stop.name}
                              onChange={(e) => updateStopPoint(index, 'name', e.target.value)}
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Descrição</label>
                            <Input
                              placeholder="Descrição breve da paragem"
                              value={stop.description}
                              onChange={(e) => updateStopPoint(index, 'description', e.target.value)}
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Imagem da Paragem</label>
                            {stop.image ? (
                              <div className="relative h-32 mt-1">
                                <img 
                                  src={stop.image} 
                                  alt={stop.name} 
                                  className="w-full h-full object-cover rounded-md"
                                />
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="icon"
                                  className="absolute top-1 right-1"
                                  onClick={() => {
                                    const newStops = [...stops];
                                    delete newStops[index].image;
                                    setStops(newStops);
                                  }}
                                >
                                  <X size={16} />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center border-2 border-dashed rounded-md p-4 h-32 mt-1">
                                <label className="flex flex-col items-center cursor-pointer">
                                  <Upload size={24} />
                                  <span className="mt-2 text-sm">Carregar Imagem</span>
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden"
                                    onChange={(e) => handleStopImageChange(index, e)}
                                  />
                                </label>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="registration" className="space-y-4 pt-4">
                <h3 className="font-medium text-lg">Configurações de Inscrição</h3>
                <p className="text-sm text-muted-foreground">
                  Configure as opções de inscrição e participação no evento.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="maxParticipants"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Limite de Participantes</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            placeholder="Ex: 50"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="registrationDeadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data Limite para Inscrições</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="memberPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço para Sócios (€)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            step="0.01" 
                            placeholder="Ex: 15.00"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="nonMemberPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço para Não-Sócios (€)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            step="0.01" 
                            placeholder="Ex: 25.00"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="minEngineSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cilindrada Mínima Permitida</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a cilindrada mínima" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Sem restrição</SelectItem>
                          {engineSizeOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex items-center space-x-2">
                  <FormField
                    control={form.control}
                    name="membersOnly"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          Evento exclusivo para sócios
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
                
                <Separator className="my-4" />
                
                <FormField
                  control={form.control}
                  name="externalFormLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link para Formulário Externo (opcional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: https://forms.google.com/..." 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground mt-1">
                        Se preferir usar um formulário externo (ex: Google Forms) para inscrições,
                        adicione o link aqui.
                      </p>
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">Criar Evento</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EventCreationDialog;
