
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EventCard from '@/components/EventCard';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { MembersLayout } from '@/components/layouts/MembersLayout';
import EventCreationDialog from '@/components/EventCreationDialog';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

export interface Motorcycle {
  id: string;
  make: string;
  model: string;
  engineSize: number;
}

export interface Participant {
  id: string;
  name: string;
  memberNumber?: number;
  motorcycle?: Motorcycle;
}

export interface ScheduleItem {
  time: string;
  description: string;
}

export interface StopPoint {
  name: string;
  description: string;
  image?: string;
}

export interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  image: string;
  thumbnail?: string;
  type: 'trail' | 'estrada' | 'encontro' | 'solidario';
  description: string;
  participants?: number;
  maxParticipants?: number;
  isFeatured?: boolean;
  
  // New fields for enhanced events
  membersOnly?: boolean;
  registrationDeadline?: string;
  memberPrice?: number;
  nonMemberPrice?: number;
  minEngineSize?: number;
  schedule?: ScheduleItem[];
  startPoint?: string;
  endPoint?: string;
  stops?: StopPoint[];
  externalFormLink?: string;
  registeredParticipants?: Participant[];
}

const events: Event[] = [
  {
    id: 1,
    title: 'Trilha da Serra',
    date: '15 Mai 2025',
    location: 'Serra da Cantareira, SP',
    image: 'https://images.unsplash.com/photo-1605651202774-7d9ef66db4b9?auto=format&fit=crop&q=80',
    type: 'trail',
    description: 'Um dia inteiro de aventura pelas trilhas da Serra da Cantareira. Ideal para motos off-road.',
    participants: 18,
    maxParticipants: 30,
    isFeatured: true,
    minEngineSize: 300,
    memberPrice: 25,
    nonMemberPrice: 40,
    registrationDeadline: '2025-05-10',
    startPoint: 'Sede Os Mouros, SP',
    endPoint: 'Serra da Cantareira, SP',
    stops: [
      {
        name: 'Mirante do Sol',
        description: 'Parada para café da manhã com vista panorâmica',
        image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&q=80'
      },
      {
        name: 'Cachoeira da Pedra',
        description: 'Parada para banho e almoço',
        image: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&q=80'
      }
    ],
    schedule: [
      { time: '07:00', description: 'Encontro na sede' },
      { time: '08:00', description: 'Saída para trilha' },
      { time: '10:30', description: 'Café da manhã no Mirante do Sol' },
      { time: '13:00', description: 'Almoço na Cachoeira da Pedra' },
      { time: '16:00', description: 'Retorno à sede' }
    ],
    registeredParticipants: [
      { 
        id: '1', 
        name: 'João Silva', 
        memberNumber: 123,
        motorcycle: { id: '1', make: 'Honda', model: 'XRE 300', engineSize: 300 }
      },
      { 
        id: '2', 
        name: 'Maria Oliveira', 
        memberNumber: 124,
        motorcycle: { id: '2', make: 'Yamaha', model: 'Lander 250', engineSize: 250 }
      }
    ]
  },
  {
    id: 2,
    title: 'Encontro Anual',
    date: '28 Jun 2025',
    location: 'Sede Os Mouros, SP',
    image: 'https://images.unsplash.com/photo-1558981408-db0ecd8a1ee4?auto=format&fit=crop&q=80',
    type: 'encontro',
    description: 'O maior encontro anual do clube. Muita música, comida e confraternização entre os membros.',
    participants: 75,
    maxParticipants: 100,
    isFeatured: true,
    memberPrice: 0,
    nonMemberPrice: 20,
    registrationDeadline: '2025-06-25',
    schedule: [
      { time: '14:00', description: 'Abertura do evento' },
      { time: '15:00', description: 'Apresentação dos novos membros' },
      { time: '16:00', description: 'Exposição de motos customizadas' },
      { time: '18:00', description: 'Início do churrasco' },
      { time: '20:00', description: 'Show ao vivo com banda de rock' }
    ]
  },
  {
    id: 3,
    title: 'Rota das Montanhas',
    date: '10 Jul 2025',
    location: 'Campos do Jordão, SP',
    image: 'https://images.unsplash.com/photo-1563538780-56c87fdcbd80?auto=format&fit=crop&q=80',
    type: 'estrada',
    description: 'Passeio de estrada com destino a Campos do Jordão. Estradas sinuosas e belas paisagens.',
    participants: 35,
    maxParticipants: 40,
    minEngineSize: 600,
    memberPrice: 30,
    nonMemberPrice: 45,
    registrationDeadline: '2025-07-05',
    startPoint: 'Sede Os Mouros, SP',
    endPoint: 'Campos do Jordão, SP',
    stops: [
      {
        name: 'Parada em São Bento do Sapucaí',
        description: 'Café e descanso',
        image: 'https://images.unsplash.com/photo-1459767129954-1b1c1f9b9ace?auto=format&fit=crop&q=80'
      }
    ]
  },
  {
    id: 4,
    title: 'Passeio Solidário',
    date: '22 Ago 2025',
    location: 'Orfanato Santa Maria, SP',
    image: 'https://images.unsplash.com/photo-1674318012388-141651b08a51?auto=format&fit=crop&q=80',
    type: 'solidario',
    description: 'Evento beneficente para arrecadar doações para o Orfanato Santa Maria. Traga alimentos não perecíveis.',
    participants: 28,
    maxParticipants: 50
  },
  {
    id: 5,
    title: 'Café da Manhã dos Motociclistas',
    date: '05 Set 2025',
    location: 'Café Estrada Real, SP',
    image: 'https://images.unsplash.com/photo-1558980664-3a031f2f8f0f?auto=format&fit=crop&q=80',
    type: 'encontro',
    description: 'Encontro para café da manhã entre os membros do clube. Uma ótima oportunidade para networking.',
    participants: 40,
    maxParticipants: 50,
    membersOnly: true
  },
  {
    id: 6,
    title: 'Desafio Off-Road',
    date: '12 Out 2025',
    location: 'Fazenda Pedra Grande, SP',
    image: 'https://images.unsplash.com/photo-1611972225617-8b0639c9e86a?auto=format&fit=crop&q=80',
    type: 'trail',
    description: 'Evento de enduro leve a moderado com obstáculos naturais. Para motociclistas com experiência off-road.',
    participants: 22,
    maxParticipants: 25,
    minEngineSize: 250,
    memberPrice: 35,
    nonMemberPrice: 50
  }
];

const Events = () => {
  const { user } = useAuth();
  const [eventsList, setEventsList] = useState<Event[]>(events);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isCreationDialogOpen, setIsCreationDialogOpen] = useState(false);
  
  const isAuthenticated = !!user;
  
  const handleCreateEvent = (newEvent: Event) => {
    setEventsList(prev => [newEvent, ...prev]);
  };
  
  const filteredEvents = eventsList.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || event.type === filterType;
    
    return matchesSearch && matchesType;
  });

  if (isAuthenticated) {
    return (
      <MembersLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
            <h1 className="text-4xl font-display text-mouro-black">
              Gestão de <span className="text-mouro-red">Eventos</span>
            </h1>
            <Button 
              className="bg-mouro-red hover:bg-mouro-red/90"
              onClick={() => setIsCreationDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Criar Novo Evento
            </Button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar eventos..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={filterType}
              onValueChange={setFilterType}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="trail">Trail</SelectItem>
                <SelectItem value="estrada">Estrada</SelectItem>
                <SelectItem value="encontro">Encontro</SelectItem>
                <SelectItem value="solidario">Solidário</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} {...event} />
            ))}
            
            {filteredEvents.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-lg text-muted-foreground">
                  Nenhum evento encontrado com os filtros aplicados.
                </p>
              </div>
            )}
          </div>
          
          <EventCreationDialog
            isOpen={isCreationDialogOpen}
            onOpenChange={setIsCreationDialogOpen}
            onEventCreated={handleCreateEvent}
          />
        </div>
      </MembersLayout>
    );
  }

  // Public version of the events page
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-20">
        <h1 className="text-4xl font-display text-mouro-black mb-8">
          Nossos <span className="text-mouro-red">Eventos</span>
        </h1>
        
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar eventos..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            value={filterType}
            onValueChange={setFilterType}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="trail">Trail</SelectItem>
              <SelectItem value="estrada">Estrada</SelectItem>
              <SelectItem value="encontro">Encontro</SelectItem>
              <SelectItem value="solidario">Solidário</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} {...event} />
          ))}
          
          {filteredEvents.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-lg text-muted-foreground">
                Nenhum evento encontrado com os filtros aplicados.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Events;
