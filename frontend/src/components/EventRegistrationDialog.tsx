
import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Check } from 'lucide-react';
import { Event } from '@/types/events';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface EventRegistrationDialogProps {
  event: Event | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const EventRegistrationDialog: React.FC<EventRegistrationDialogProps> = ({
  event,
  isOpen,
  onOpenChange,
}) => {
  // State for form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [memberNumber, setMemberNumber] = useState('');
  const [motorcycleMake, setMotorcycleMake] = useState('');
  const [motorcycleModel, setMotorcycleModel] = useState('');
  const [motorcycleEngineSize, setMotorcycleEngineSize] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // Check if the event is valid
  if (!event) return null;

  // Determine if registration is still open based on deadline
  const isRegistrationOpen = event.registrationDeadline ? 
    new Date(event.registrationDeadline) > new Date() : true;
  
  // Check if event is full
  const isEventFull = event.participants !== undefined && 
    event.maxParticipants !== undefined && 
    event.participants >= event.maxParticipants;
  
  // Function to handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!name || !email || !phone) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    
    if (!termsAccepted) {
      toast.error("Por favor, aceite os termos e condições para se inscrever.");
      return;
    }
    
    // Member number is required for members-only events
    if (event.membersOnly && !memberNumber) {
      toast.error("Este evento é apenas para sócios. Por favor, insira seu número de sócio.");
      return;
    }
    
    // Engine size validation for minimum requirements
    if (event.minEngineSize && parseInt(motorcycleEngineSize) < event.minEngineSize) {
      toast.error(`Este evento requer uma moto com no mínimo ${event.minEngineSize}cc.`);
      return;
    }

    // Form submission logic would go here
    // In a real application, you'd send this data to your backend
    
    // For now, just show a success message
    toast.success("Inscrição realizada com sucesso!");
    
    // Reset form and close dialog
    resetForm();
    onOpenChange(false);
  };
  
  // Function to reset the form
  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setMemberNumber('');
    setMotorcycleMake('');
    setMotorcycleModel('');
    setMotorcycleEngineSize('');
    setAdditionalInfo('');
    setBirthDate(undefined);
    setTermsAccepted(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Inscrição para Evento</DialogTitle>
          <DialogDescription>
            {event.title} - {event.date}
          </DialogDescription>
        </DialogHeader>
        
        {(isEventFull || !isRegistrationOpen) ? (
          <div className="py-6 text-center">
            <h3 className="text-lg font-medium mb-2">
              {isEventFull ? "Evento Lotado" : "Inscrições Encerradas"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {isEventFull 
                ? "Este evento atingiu o número máximo de participantes." 
                : "O prazo para inscrições neste evento já foi encerrado."}
            </p>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="mx-auto"
            >
              Fechar
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Digite seu nome completo"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="birth-date">Data de Nascimento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !birthDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {birthDate ? format(birthDate, "dd/MM/yyyy") : <span>Selecionar data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={birthDate}
                      onSelect={setBirthDate}
                      initialFocus
                      disabled={(date) => date > new Date()}
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {event.membersOnly && (
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="member-number">Número de Sócio *</Label>
                  <Input
                    id="member-number"
                    value={memberNumber}
                    onChange={(e) => setMemberNumber(e.target.value)}
                    placeholder="Digite seu número de sócio"
                    required
                  />
                </div>
              )}
              
              <Separator />
              
              <h3 className="font-medium">Informações da Motocicleta</h3>
              
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="motorcycle-make">Marca</Label>
                <Input
                  id="motorcycle-make"
                  value={motorcycleMake}
                  onChange={(e) => setMotorcycleMake(e.target.value)}
                  placeholder="Ex: Honda, Yamaha, BMW, etc."
                />
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="motorcycle-model">Modelo</Label>
                <Input
                  id="motorcycle-model"
                  value={motorcycleModel}
                  onChange={(e) => setMotorcycleModel(e.target.value)}
                  placeholder="Ex: CB 500, YZF R3, GS 1200, etc."
                />
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="motorcycle-engine-size">Cilindrada (cc)</Label>
                <Input
                  id="motorcycle-engine-size"
                  type="number"
                  value={motorcycleEngineSize}
                  onChange={(e) => setMotorcycleEngineSize(e.target.value)}
                  placeholder="Ex: 300, 600, 1200, etc."
                />
                {event.minEngineSize && (
                  <p className="text-xs text-muted-foreground">
                    Este evento requer uma motocicleta com no mínimo {event.minEngineSize}cc.
                  </p>
                )}
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="additional-info">Informações Adicionais</Label>
                <Input
                  id="additional-info"
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  placeholder="Alguma informação adicional que queira compartilhar?"
                />
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox 
                  id="terms" 
                  checked={termsAccepted}
                  onCheckedChange={(checked) => {
                    if (typeof checked === 'boolean') {
                      setTermsAccepted(checked);
                    }
                  }}
                />
                <label
                  htmlFor="terms"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Eu concordo com os termos e condições do evento.
                </label>
              </div>
              
              <div className="text-xs text-muted-foreground">
                <p>
                  {event.memberPrice !== undefined && event.nonMemberPrice !== undefined ? (
                    <>
                      Preço: Sócios {event.memberPrice}€ / Não Sócios {event.nonMemberPrice}€
                    </>
                  ) : event.memberPrice !== undefined ? (
                    <>Preço para sócios: {event.memberPrice}€</>
                  ) : event.nonMemberPrice !== undefined ? (
                    <>Preço para não sócios: {event.nonMemberPrice}€</>
                  ) : (
                    'Evento gratuito'
                  )}
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-mouro-red hover:bg-mouro-red/90"
              >
                Inscrever-se
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EventRegistrationDialog;
