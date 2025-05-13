
import React from 'react';
import { MembersLayout } from '@/components/layouts/MembersLayout';

const History = () => {
  return (
    <MembersLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-display text-mouro-black mb-8">
          <span className="text-mouro-red">Histórico</span> de Atividades
        </h1>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-lg text-center text-gray-500">
            O histórico de atividades está em desenvolvimento.
          </p>
        </div>
      </div>
    </MembersLayout>
  );
};

export default History;
