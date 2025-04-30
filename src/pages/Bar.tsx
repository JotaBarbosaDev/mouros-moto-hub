
import { useState } from 'react';
import { MembersLayout } from '@/components/layouts/MembersLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarMenu } from '@/components/bar/BarMenu';
import { BarRegister } from '@/components/bar/BarRegister';
import { SalesHistory } from '@/components/bar/SalesHistory';

const BarManagement = () => {
  return (
    <MembersLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-display text-mouro-black mb-8">
          Gestão do <span className="text-mouro-red">Bar</span>
        </h1>
        
        <Tabs defaultValue="menu" className="w-full">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="menu" className="flex-1">Produtos</TabsTrigger>
            <TabsTrigger value="register" className="flex-1">Caixa</TabsTrigger>
            <TabsTrigger value="history" className="flex-1">Histórico</TabsTrigger>
          </TabsList>
          
          <TabsContent value="menu">
            <BarMenu />
          </TabsContent>
          
          <TabsContent value="register">
            <BarRegister />
          </TabsContent>
          
          <TabsContent value="history">
            <SalesHistory sales={[]} />
          </TabsContent>
        </Tabs>
      </div>
    </MembersLayout>
  );
};

export default BarManagement;
