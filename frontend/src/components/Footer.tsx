
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-mouro-black text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Logo & Description */}
          <div className="space-y-4">
            <h2 className="text-3xl font-display uppercase">
              <span className="text-mouro-red">Os</span> Mouros
            </h2>
            <p className="text-gray-400 max-w-sm">
              Mais que um moto clube, somos uma irmandade sobre duas rodas. 
              Lidados pela paixão do motociclismo e unidos pelo respeito mútuo.
            </p>
            <div className="flex space-x-4 pt-4">
              <a href="#" className="text-gray-400 hover:text-mouro-red transition">
                <Facebook size={24} />
              </a>
              <a href="#" className="text-gray-400 hover:text-mouro-red transition">
                <Instagram size={24} />
              </a>
              <a href="#" className="text-gray-400 hover:text-mouro-red transition">
                <Youtube size={24} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold border-b border-mouro-red pb-2">Links Rápidos</h3>
            <nav className="grid grid-cols-2 gap-2">
              <Link to="/" className="text-gray-400 hover:text-mouro-red transition">Início</Link>
              <Link to="/sobre" className="text-gray-400 hover:text-mouro-red transition">Sobre Nós</Link>
              <Link to="/eventos" className="text-gray-400 hover:text-mouro-red transition">Eventos</Link>
              <Link to="/galeria" className="text-gray-400 hover:text-mouro-red transition">Galeria</Link>
              <Link to="/loja" className="text-gray-400 hover:text-mouro-red transition">Loja</Link>
              <Link to="/bar" className="text-gray-400 hover:text-mouro-red transition">Bar</Link>
              <Link to="/contato" className="text-gray-400 hover:text-mouro-red transition">Contato</Link>
              <Link to="/membros" className="text-gray-400 hover:text-mouro-red transition">Área de Membros</Link>
            </nav>
          </div>
          
          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold border-b border-mouro-red pb-2">Contato</h3>
            <div className="space-y-3">
              <p className="flex items-center text-gray-400">
                <MapPin className="mr-2 text-mouro-red" size={18} />
                <span>Av. dos Motociclistas, 1234, São Paulo - SP</span>
              </p>
              <p className="flex items-center text-gray-400">
                <Phone className="mr-2 text-mouro-red" size={18} />
                <a href="tel:+551199999999" className="hover:text-mouro-red transition">+55 (11) 9999-9999</a>
              </p>
              <p className="flex items-center text-gray-400">
                <Mail className="mr-2 text-mouro-red" size={18} />
                <a href="mailto:contato@osmouros.com" className="hover:text-mouro-red transition">contato@osmouros.com</a>
              </p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Moto Clube Os Mouros. Todos os direitos reservados.
          </p>
          <div className="mt-4 md:mt-0">
            <ul className="flex space-x-4 text-sm text-gray-500">
              <li><a href="#" className="hover:text-mouro-red transition">Política de Privacidade</a></li>
              <li><a href="#" className="hover:text-mouro-red transition">Termos de Uso</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
