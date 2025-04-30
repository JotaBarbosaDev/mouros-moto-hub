import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EventCard from '@/components/EventCard';
import GalleryItem from '@/components/GalleryItem';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Index = () => {
  // Sample data for events
  const events = [
    {
      id: 1,
      title: 'Trilha da Serra',
      date: '15 Mai 2025',
      location: 'Serra da Cantareira, SP',
      image: 'https://images.unsplash.com/photo-1605651202774-7d9ef66db4b9?auto=format&fit=crop&q=80',
      type: 'trail' as const,
      description: 'Um dia inteiro de aventura pelas trilhas da Serra da Cantareira. Ideal para motos off-road.'
    },
    {
      id: 2,
      title: 'Encontro Anual',
      date: '28 Jun 2025',
      location: 'Sede Os Mouros, SP',
      image: 'https://images.unsplash.com/photo-1558981408-db0ecd8a1ee4?auto=format&fit=crop&q=80',
      type: 'encontro' as const,
      description: 'O maior encontro anual do clube. Muita música, comida e confraternização entre os membros.'
    },
    {
      id: 3,
      title: 'Rota das Montanhas',
      date: '10 Jul 2025',
      location: 'Campos do Jordão, SP',
      image: 'https://images.unsplash.com/photo-1563538780-56c87fdcbd80?auto=format&fit=crop&q=80',
      type: 'estrada' as const,
      description: 'Passeio de estrada com destino a Campos do Jordão. Estradas sinuosas e belas paisagens.'
    }
  ];

  // Sample data for gallery
  const galleryItems = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&q=80',
      title: 'Trilha Canastra 2024'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1611761482066-0db52d943db0?auto=format&fit=crop&q=80',
      title: 'Encontro Nacional 2024'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80',
      title: 'Passeio na Serra 2024'
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1625046586050-983062f17acd?auto=format&fit=crop&q=80',
      title: 'Campeonato de Motocross'
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1604184365438-29a1a9d43f1c?auto=format&fit=crop&q=80',
      title: 'Doação ao Orfanato 2024'
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1611675674876-59320e596b9e?auto=format&fit=crop&q=80',
      title: 'Ação Social 2023'
    },
  ];

  // Sample testimonials
  const testimonials = [
    {
      id: 1,
      name: 'André Silva',
      role: 'Membro desde 2018',
      content: 'Encontrei nesse moto clube não apenas companheiros para viajar, mas uma verdadeira família. As trilhas e os eventos são imperdíveis!',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80'
    },
    {
      id: 2,
      name: 'Carla Mendes',
      role: 'Membro desde 2020',
      content: 'Como mulher motociclista, me senti acolhida desde o primeiro encontro. Um clube que realmente valoriza a diversidade e o respeito mútuo.',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80'
    },
    {
      id: 3,
      name: 'Roberto Almeida',
      role: 'Membro desde 2015',
      content: 'Já participei de diversos moto clubes, mas Os Mouros é diferente. A organização dos eventos e o companheirismo são incomparáveis.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80'
    }
  ];

  // Sample partners
  const partners = [
    { id: 1, name: 'Yamaha', image: 'https://placehold.co/200x100/222/white?text=Yamaha' },
    { id: 2, name: 'Honda', image: 'https://placehold.co/200x100/222/white?text=Honda' },
    { id: 3, name: 'Pirelli', image: 'https://placehold.co/200x100/222/white?text=Pirelli' },
    { id: 4, name: 'Shoei', image: 'https://placehold.co/200x100/222/white?text=Shoei' },
  ];
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1558981408-db0ecd8a1ee4?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0" 
            alt="Hero Background" 
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-mouro-black/80 to-mouro-black/50"></div>
        </div>

        {/* Hero Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-display text-white uppercase mb-6">
              Liberdade sobre <span className="text-mouro-red">duas rodas</span>
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-xl">
              Mais que um moto clube, somos uma irmandade. Unidos pela paixão do motociclismo 
              e pelo espírito de aventura nas estradas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-mouro-red hover:bg-mouro-red/90">
                Conheça Nossos Eventos
              </Button>
              <Button size="lg" variant="outline" className="border-white text-black hover:bg-white/10">
                Torne-se um Membro
              </Button>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-0 right-0 z-10 flex justify-center">
          <a 
            href="#about" 
            className="animate-bounce p-2 bg-mouro-red/90 rounded-full text-white"
            aria-label="Rolar para baixo"
          >
            <ArrowRight size={24} className="transform rotate-90" />
          </a>
        </div>
      </section>
      
      {/* About Section */}
      <section id="about" className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/2">
              <h2 className="section-title text-mouro-black">
                Sobre <span className="text-mouro-red">Os Mouros</span>
              </h2>
              <p className="mb-4">
                Fundado em 2010, o Moto Clube Os Mouros nasceu da paixão de um pequeno grupo 
                de amigos pelo motociclismo. O que começou como encontros casuais para pequenos 
                passeios transformou-se em um dos mais respeitados moto clubes do Brasil.
              </p>
              <p className="mb-4">
                Nossa missão é promover o motociclismo responsável, fortalecer os laços entre 
                motociclistas e contribuir positivamente para a sociedade através de ações 
                sociais e educativas.
              </p>
              <p className="mb-6">
                Com mais de 200 membros ativos, organizamos diversos eventos ao longo do ano, 
                desde trilhas off-road até grandes encontros nacionais, sempre com foco na 
                segurança e na confraternização.
              </p>
              <div className="flex flex-wrap gap-6 mt-8">
                <div className="text-center">
                  <p className="text-4xl font-display text-mouro-red">200+</p>
                  <p className="text-sm text-mouro-gray">Membros</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-display text-mouro-red">50+</p>
                  <p className="text-sm text-mouro-gray">Eventos por Ano</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-display text-mouro-red">13</p>
                  <p className="text-sm text-mouro-gray">Anos de História</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-display text-mouro-red">20+</p>
                  <p className="text-sm text-mouro-gray">Ações Sociais</p>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 relative h-[400px] md:h-[500px] w-full rounded-lg overflow-hidden shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1617109887854-f661d37fca2d?auto=format&fit=crop&q=80" 
                alt="Moto Clube Os Mouros" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Events Section */}
      <section className="bg-gray-100 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="section-title text-mouro-black">
              Próximos <span className="text-mouro-red">Eventos</span>
            </h2>
            <p className="section-subtitle">
              Confira nossa agenda e participe dos melhores encontros e passeios da região.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <EventCard
                key={event.id}
                id={event.id}
                title={event.title}
                date={event.date}
                location={event.location}
                image={event.image}
                type={event.type}
                description={event.description}
              />
            ))}
          </div>
          
          <div className="flex justify-center mt-12">
            <Button variant="outline" className="border-mouro-red text-mouro-red hover:bg-mouro-red hover:text-white">
              Ver Todos os Eventos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
      
      {/* Gallery Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="section-title text-mouro-black">
              Nossa <span className="text-mouro-red">Galeria</span>
            </h2>
            <p className="section-subtitle">
              Momentos marcantes e memórias inesquecíveis ao longo de nossa jornada.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {galleryItems.map((item) => (
              <GalleryItem
                key={item.id}
                image={item.image}
                title={item.title}
              />
            ))}
          </div>
          
          <div className="flex justify-center mt-12">
            <Button variant="outline" className="border-mouro-red text-mouro-red hover:bg-mouro-red hover:text-white">
              Ver Galeria Completa
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="bg-mouro-black py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="section-title text-white">
              O Que Nossos <span className="text-mouro-red">Membros Dizem</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{testimonial.name}</h4>
                    <p className="text-gray-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-300">{testimonial.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Partners Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="section-title text-mouro-black">
              Nossos <span className="text-mouro-red">Parceiros</span>
            </h2>
            <p className="section-subtitle">
              Empresas que acreditam e apoiam nosso moto clube.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 items-center">
            {partners.map((partner) => (
              <div key={partner.id} className="grayscale hover:grayscale-0 transition-all duration-300">
                <img 
                  src={partner.image} 
                  alt={partner.name} 
                  className="h-16 max-w-xs"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="relative py-24">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1597745961218-85858f7a93ca?auto=format&fit=crop&q=80" 
            alt="CTA Background" 
            className="w-full h-full object-cover"
          />
          <div className="hero-overlay"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-display uppercase text-white mb-6">
              Junte-se a <span className="text-mouro-red">Nossa Irmandade</span>
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Seja parte de uma comunidade de motociclistas apaixonados e viva experiências únicas.
            </p>
            <Button size="lg" className="bg-mouro-red hover:bg-mouro-red/90">
              Torne-se um Membro Hoje
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
