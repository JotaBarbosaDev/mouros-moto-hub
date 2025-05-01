
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EventCard from '@/components/EventCard';
import { Button } from '@/components/ui/button';
import { Plus, Search, CalendarX } from 'lucide-react';
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
import { useEvents } from '@/hooks/use-events';
import { Event, ScheduleItem, StopPoint, Participant, Motorcycle } from '@/types/events';

const Events = () => {
  const { user } = useAuth();
  const { events, isLoading, createEvent } = useEvents();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isCreationDialogOpen, setIsCreationDialogOpen] = useState(false);
  
  const isAuthenticated = !!user;
  
  const handleCreateEvent = (newEvent: Event) => {
    createEvent(newEvent);
    setIsCreationDialogOpen(false);
  };
  
  const filteredEvents = events.filter(event => {
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
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">A carregar eventos...</div>
          ) : events.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-md border border-slate-200">
              <CalendarX className="h-16 w-16 text-slate-400 mx-auto" />
              <h3 className="text-xl font-medium text-slate-900 mt-4 mb-2">Nenhum evento cadastrado</h3>
              <p className="text-sm text-slate-500 mb-6">Crie o primeiro evento para o seu clube.</p>
              <Button 
                className="bg-mouro-red hover:bg-mouro-red/90 mx-auto"
                onClick={() => setIsCreationDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Criar Novo Evento
              </Button>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">
                Nenhum evento encontrado com os filtros aplicados.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} {...event} />
              ))}
            </div>
          )}
          
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
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">A carregar eventos...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-md border border-slate-200">
            <CalendarX className="h-16 w-16 text-slate-400 mx-auto" />
            <h3 className="text-xl font-medium text-slate-900 mt-4">Nenhum evento disponível no momento</h3>
            <p className="text-sm text-slate-500 mt-2">Volte em breve para conferir nossos próximos eventos.</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              Nenhum evento encontrado com os filtros aplicados.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents
              .filter(event => event.isFeatured) // Only show published events on public page
              .map((event) => (
                <EventCard key={event.id} {...event} />
              ))
            }
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Events;
