
import React from 'react';
import { MembersLayout } from '@/components/layouts/MembersLayout';

const Products = () => {
  return (
    <MembersLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-display text-mouro-black mb-8">
          <span className="text-mouro-red">Produtos</span> do Clube
        </h1>
        
        {/* Content will be added here in the future */}
        <div className="text-center py-12 bg-slate-50 rounded-md border border-slate-200">
          <h3 className="text-lg font-medium text-slate-900 mb-2">Em desenvolvimento</h3>
          <p className="text-sm text-slate-500">Esta página será implementada em breve.</p>
        </div>
      </div>
    </MembersLayout>
  );
};

export default Products;
