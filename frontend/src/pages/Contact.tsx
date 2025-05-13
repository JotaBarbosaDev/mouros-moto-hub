
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail } from 'lucide-react';

const Contact = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-20">
        <h1 className="text-4xl font-display text-mouro-black mb-8">
          Entre em <span className="text-mouro-red">Contato</span>
        </h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="space-y-4 mb-8">
              <div className="flex items-center text-lg">
                <MapPin className="mr-2 text-mouro-red" />
                <span>Av. dos Motociclistas, 1234, São Paulo - SP</span>
              </div>
              <div className="flex items-center text-lg">
                <Phone className="mr-2 text-mouro-red" />
                <a href="tel:+551199999999" className="hover:text-mouro-red transition">
                  +55 (11) 9999-9999
                </a>
              </div>
              <div className="flex items-center text-lg">
                <Mail className="mr-2 text-mouro-red" />
                <a href="mailto:contato@osmouros.com" className="hover:text-mouro-red transition">
                  contato@osmouros.com
                </a>
              </div>
            </div>
            
            <div className="aspect-video rounded-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.1975798676267!2d-46.6497889!3d-23.5646162!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDMzJzUyLjYiUyA0NsKwMzgnNTkuMiJX!5e0!3m2!1spt-BR!2sbr!4v1635959562015!5m2!1spt-BR!2sbr"
                className="w-full h-full"
                loading="lazy"
              ></iframe>
            </div>
          </div>

          <div className="bg-card shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Envie uma mensagem</h2>
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">Nome</label>
                <input
                  type="text"
                  id="name"
                  className="w-full rounded-md border border-input px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  id="email"
                  className="w-full rounded-md border border-input px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-1">Mensagem</label>
                <textarea
                  id="message"
                  rows={4}
                  className="w-full rounded-md border border-input px-3 py-2"
                ></textarea>
              </div>
              <Button className="w-full bg-mouro-red hover:bg-mouro-red/90">
                Enviar Mensagem
              </Button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
