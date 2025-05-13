
import React, { useState } from 'react';
import { Calendar, MapPin, Users, Clock, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Event } from '@/types/events';
import EventDetailsDialog from '@/components/EventDetailsDialog';
import EventRegistrationDialog from '@/components/EventRegistrationDialog';

type EventCardProps = Event;

const EventCard: React.FC<EventCardProps> = ({
  id,
  title,
  date,
  location,
  image,
  thumbnail,
  type,
  description,
  participants,
  maxParticipants,
  isFeatured,
  membersOnly,
  registrationDeadline,
  memberPrice,
  nonMemberPrice,
  minEngineSize,
  // Include other fields but don't destructure them here for brevity
  ...otherProps
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  
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

  // Calculate participation percentage
  const participationPercentage = participants !== undefined && maxParticipants !== undefined 
    ? (participants / maxParticipants) * 100 
    : 0;
    
  // Check if registration is still open based on deadline
  const isRegistrationDeadlineOpen = registrationDeadline 
    ? new Date(registrationDeadline) > new Date() 
    : true;

  // Create a complete event object to pass to dialogs
  const event: Event = {
    id,
    title,
    date,
    location,
    image,
    thumbnail: thumbnail || image,
    type,
    description,
    participants,
    maxParticipants,
    isFeatured,
    membersOnly,
    registrationDeadline,
    memberPrice,
    nonMemberPrice,
    minEngineSize,
    ...otherProps
  };

  return (
    <>
      <div className="rounded-lg overflow-hidden bg-card shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col animate-zoom-in">
        <div className="relative h-48 overflow-hidden">
          <img 
            src={thumbnail || image} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute top-3 left-3 flex flex-wrap gap-1">
            <Badge className={`${typeColors[type]}`}>
              {typeLabels[type]}
            </Badge>
            
            {isFeatured && (
              <Badge className="bg-mouro-red">
                Destaque
              </Badge>
            )}

            {membersOnly && (
              <Badge variant="outline" className="bg-background bg-opacity-70">
                Apenas Sócios
              </Badge>
            )}
          </div>
          
          {registrationDeadline && (
            <Badge 
              className="absolute top-3 right-3 bg-background bg-opacity-70 text-foreground border"
              variant={isRegistrationDeadlineOpen ? "default" : "outline"}
            >
              {isRegistrationDeadlineOpen ? "Inscrições Abertas" : "Inscrições Encerradas"}
            </Badge>
          )}
        </div>
        
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="font-display text-xl uppercase tracking-wide mb-2">{title}</h3>
          
          <div className="space-y-2 mb-4 text-muted-foreground">
            <div className="flex items-center">
              <Calendar size={16} className="mr-2" />
              <span>{date}</span>
            </div>
            <div className="flex items-center">
              <MapPin size={16} className="mr-2" />
              <span>{location}</span>
            </div>
            {participants !== undefined && maxParticipants !== undefined && (
              <div className="flex items-center">
                <Users size={16} className="mr-2" />
                <span>{participants}/{maxParticipants} participantes</span>
              </div>
            )}
            {(memberPrice !== undefined || nonMemberPrice !== undefined) && (
              <div className="flex items-center">
                <CreditCard size={16} className="mr-2" />
                <div className="flex flex-col">
                  {memberPrice !== undefined && (
                    <span className="text-xs">Sócios: {memberPrice}€</span>
                  )}
                  {nonMemberPrice !== undefined && (
                    <span className="text-xs">Não Sócios: {nonMemberPrice}€</span>
                  )}
                </div>
              </div>
            )}
            {registrationDeadline && (
              <div className="flex items-center">
                <Clock size={16} className="mr-2" />
                <span className="text-xs">Inscrições até: {new Date(registrationDeadline).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          
          {participants !== undefined && maxParticipants !== undefined && (
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${
                    participationPercentage >= 90 ? 'bg-red-600' : 
                    participationPercentage >= 70 ? 'bg-amber-500' : 
                    'bg-green-600'
                  }`}
                  style={{ width: `${participationPercentage}%` }}
                />
              </div>
            </div>
          )}
          
          <p className="text-sm mb-4 flex-grow line-clamp-3">{description}</p>
          
          <div className="flex justify-between mt-auto">
            <Button 
              variant="outline" 
              className="border-mouro-red text-mouro-red hover:bg-mouro-red hover:text-white"
              onClick={() => setIsDetailsOpen(true)}
            >
              Detalhes
            </Button>
            <Button 
              className="bg-mouro-red hover:bg-mouro-red/90"
              onClick={() => setIsRegistrationOpen(true)}
              disabled={
                (participants !== undefined && 
                 maxParticipants !== undefined && 
                 participants >= maxParticipants) || 
                !isRegistrationDeadlineOpen
              }
            >
              {participants !== undefined && maxParticipants !== undefined && participants >= maxParticipants 
                ? "Lotado" 
                : !isRegistrationDeadlineOpen
                  ? "Encerrado"
                  : participants !== undefined 
                    ? `Inscrever-se (${participants})`
                    : "Inscrever-se"
              }
            </Button>
          </div>
        </div>
      </div>
      
      {/* Dialogs */}
      <EventDetailsDialog 
        event={event} 
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
      
      <EventRegistrationDialog
        event={event}
        isOpen={isRegistrationOpen}
        onOpenChange={setIsRegistrationOpen}
      />
    </>
  );
};

export default EventCard;
