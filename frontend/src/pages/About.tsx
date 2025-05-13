
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-display text-mouro-black mb-8">
            Sobre <span className="text-mouro-red">Os Mouros</span>
          </h1>
          <div className="prose prose-lg max-w-none">
            <p>
              Fundado em 2010, o Moto Clube Os Mouros é muito mais que uma simples 
              associação de motociclistas. Somos uma irmandade unida pela paixão 
              das duas rodas e pelo espírito de aventura.
            </p>
            <p>
              Nossa missão é promover o motociclismo responsável, fortalecer os laços 
              entre motociclistas e contribuir positivamente para a sociedade através 
              de ações sociais e educativas.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
