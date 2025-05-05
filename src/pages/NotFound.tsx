
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center">
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-9xl font-display text-mouro-red mb-2">404</h1>
          <h2 className="text-4xl font-bold mb-4">Página não encontrada</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Ops! A página que você está procurando parece que não existe.
          </p>
          <Button asChild className="bg-mouro-red hover:bg-mouro-red/90">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Voltar para a Página Inicial
            </Link>
          </Button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotFound;
