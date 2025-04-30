
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-mouro-black/90 py-3 backdrop-blur-md' : 'bg-mouro-black/50 py-4 backdrop-blur-sm'
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <h1 className="text-2xl font-display text-white uppercase">
            <span className="text-mouro-red">Os</span> Mouros
          </h1>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-white hover:text-mouro-red transition font-medium">Início</Link>
          <Link to="/sobre" className="text-white hover:text-mouro-red transition font-medium">Sobre</Link>
          <Link to="/eventos" className="text-white hover:text-mouro-red transition font-medium">Eventos</Link>
          <Link to="/galeria" className="text-white hover:text-mouro-red transition font-medium">Galeria</Link>
          <Link to="/loja" className="text-white hover:text-mouro-red transition font-medium">Loja</Link>
          <Link to="/bar" className="text-white hover:text-mouro-red transition font-medium">Bar</Link>
          <Link to="/contato" className="text-white hover:text-mouro-red transition font-medium">Contato</Link>
          <Link to="/membros">
            <Button className="bg-mouro-red hover:bg-mouro-red/90">Área de Membros</Button>
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-mouro-black/95 backdrop-blur-lg">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <Link to="/" className="text-white hover:text-mouro-red transition py-2 font-medium" onClick={() => setIsMenuOpen(false)}>
              Início
            </Link>
            <Link to="/sobre" className="text-white hover:text-mouro-red transition py-2 font-medium" onClick={() => setIsMenuOpen(false)}>
              Sobre
            </Link>
            <Link to="/eventos" className="text-white hover:text-mouro-red transition py-2 font-medium" onClick={() => setIsMenuOpen(false)}>
              Eventos
            </Link>
            <Link to="/galeria" className="text-white hover:text-mouro-red transition py-2 font-medium" onClick={() => setIsMenuOpen(false)}>
              Galeria
            </Link>
            <Link to="/loja" className="text-white hover:text-mouro-red transition py-2 font-medium" onClick={() => setIsMenuOpen(false)}>
              Loja
            </Link>
            <Link to="/bar" className="text-white hover:text-mouro-red transition py-2 font-medium" onClick={() => setIsMenuOpen(false)}>
              Bar
            </Link>
            <Link to="/contato" className="text-white hover:text-mouro-red transition py-2 font-medium" onClick={() => setIsMenuOpen(false)}>
              Contato
            </Link>
            <Link to="/membros" onClick={() => setIsMenuOpen(false)}>
              <Button className="bg-mouro-red hover:bg-mouro-red/90 w-full">
                Área de Membros
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
