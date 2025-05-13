
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import GalleryItem from '@/components/GalleryItem';

const Gallery = () => {
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
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-20">
        <h1 className="text-4xl font-display text-mouro-black mb-8">
          Nossa <span className="text-mouro-red">Galeria</span>
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {galleryItems.map((item) => (
            <GalleryItem key={item.id} {...item} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Gallery;
