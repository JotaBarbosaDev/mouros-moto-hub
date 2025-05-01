
import React from 'react';
import { Calendar, MapPin, Users, Clock, Info, CreditCard } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Event } from '@/types/events';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

interface EventDetailsDialogProps {
  event: Event | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const EventDetailsDialog: React.FC<EventDetailsDialogProps> = ({
  event,
  isOpen,
  onOpenChange,
}) => {
  if (!event) return null;
  
  // Map event type to badge colors
  const typeColors = {
    trail: 'bg-green-600 hover:bg-green-700',
    estrada: 'bg-blue-600 hover:bg-blue-700',
    encontro: 'bg-purple-600 hover:bg-purple-700',
    solidario: 'bg-amber-600 hover:bg-amber-700'
  };
  
  const typeLabels = {
    trail: 'Trail',
    estrada: 'Estrada',
    encontro: 'Encontro',
    solidario: 'Solidário'
  };

  // Check if registration is still open based on deadline
  const isRegistrationOpen = event.registrationDeadline ? 
    new Date(event.registrationDeadline) > new Date() : true;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{event.title}</DialogTitle>
          <div className="flex items-center flex-wrap gap-2 mt-2">
            <Badge className={`${typeColors[event.type]}`}>{typeLabels[event.type]}</Badge>
            {event.isFeatured && <Badge className="bg-mouro-red">Destaque</Badge>}
            {event.membersOnly && <Badge variant="outline">Apenas Sócios</Badge>}
            <Badge variant={isRegistrationOpen ? "secondary" : "outline"}>
              {isRegistrationOpen ? "Inscrições Abertas" : "Inscrições Encerradas"}
            </Badge>
          </div>
          <DialogDescription className="pt-2">
            <div className="w-full h-52 overflow-hidden rounded-md mb-4">
              <img 
                src={event.image} 
                alt={event.title} 
                className="w-full h-full object-cover"
              />
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="route">Percurso</TabsTrigger>
            <TabsTrigger value="participants">Participantes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center">
                <Calendar size={18} className="mr-2 text-mouro-red" />
                <span className="font-medium">Data:</span>
                <span className="ml-2">{event.date}</span>
              </div>
              <div className="flex items-center">
                <MapPin size={18} className="mr-2 text-mouro-red" />
                <span className="font-medium">Local:</span>
                <span className="ml-2">{event.location}</span>
              </div>
              {event.registrationDeadline && (
                <div className="flex items-center">
                  <Clock size={18} className="mr-2 text-mouro-red" />
                  <span className="font-medium">Prazo de Inscrição:</span>
                  <span className="ml-2">{new Date(event.registrationDeadline).toLocaleDateString()}</span>
                </div>
              )}
              {event.minEngineSize && (
                <div className="flex items-center">
                  <Info size={18} className="mr-2 text-mouro-red" />
                  <span className="font-medium">Cilindrada Mínima:</span>
                  <span className="ml-2">{event.minEngineSize}cc</span>
                </div>
              )}
              {event.participants !== undefined && event.maxParticipants !== undefined && (
                <div className="flex items-center">
                  <Users size={18} className="mr-2 text-mouro-red" />
                  <span className="font-medium">Participantes:</span>
                  <span className="ml-2">{event.participants}/{event.maxParticipants}</span>
                </div>
              )}
              {(event.memberPrice !== undefined || event.nonMemberPrice !== undefined) && (
                <div className="flex items-center">
                  <CreditCard size={18} className="mr-2 text-mouro-red" />
                  <span className="font-medium">Preço:</span>
                  <div className="ml-2">
                    {event.memberPrice !== undefined && (
                      <span className="mr-2">Sócios: {event.memberPrice}€</span>
                    )}
                    {event.nonMemberPrice !== undefined && (
                      <span>Não Sócios: {event.nonMemberPrice}€</span>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-medium mb-2">Descrição</h3>
              <p className="text-muted-foreground">{event.description}</p>
            </div>
            
            {event.schedule && event.schedule.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-medium mb-2">Programa</h3>
                  <div className="space-y-2">
                    {event.schedule.map((item, index) => (
                      <div key={index} className="flex">
                        <span className="font-medium w-20">{item.time}</span>
                        <span>{item.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            
            {event.externalFormLink && (
              <>
                <Separator />
                <div>
                  <h3 className="font-medium mb-2">Formulário de Inscrição</h3>
                  <a 
                    href={event.externalFormLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-mouro-red hover:underline"
                  >
                    Abrir formulário externo de inscrição
                  </a>
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="route" className="space-y-4">
            {(event.startPoint || event.endPoint) && (
              <div className="space-y-2">
                {event.startPoint && (
                  <div>
                    <h3 className="font-medium">Ponto de Partida</h3>
                    <p className="text-muted-foreground">{event.startPoint}</p>
                  </div>
                )}
                
                {event.endPoint && (
                  <div>
                    <h3 className="font-medium mt-2">Ponto de Chegada</h3>
                    <p className="text-muted-foreground">{event.endPoint}</p>
                  </div>
                )}
              </div>
            )}
            
            {event.stops && event.stops.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-medium mb-2">Paragens</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {event.stops.map((stop, index) => (
                      <Card key={index}>
                        <CardContent className="p-4 flex space-x-3">
                          {stop.image && (
                            <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                              <img 
                                src={stop.image} 
                                alt={stop.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <h4 className="font-medium">{stop.name}</h4>
                            <p className="text-xs text-muted-foreground">{stop.description}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="participants" className="space-y-4">
            {event.registeredParticipants && event.registeredParticipants.length > 0 ? (
              <div className="space-y-2">
                <h3 className="font-medium mb-2">Participantes Inscritos ({event.registeredParticipants.length})</h3>
                <div className="bg-muted rounded-md p-4 divide-y divide-gray-200">
                  {event.registeredParticipants.map((participant, index) => (
                    <div key={index} className="py-2 flex justify-between items-center">
                      <div>
                        <span className="font-medium">{participant.name}</span>
                        {participant.memberNumber && (
                          <span className="text-sm text-muted-foreground ml-2">#{participant.memberNumber}</span>
                        )}
                      </div>
                      {participant.motorcycle && (
                        <span className="text-sm text-muted-foreground">
                          {participant.motorcycle.make} {participant.motorcycle.model} ({participant.motorcycle.engineSize}cc)
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Não há participantes inscritos neste evento.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Fechar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailsDialog;
