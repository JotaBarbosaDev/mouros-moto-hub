import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuditDashboard from '@/components/audit/AuditDashboard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { UserRole } from '@/types/audit';

const AuditPage: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando sistema de auditoria...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Acesso Negado</h2>
            <p className="text-muted-foreground">Você precisa estar logado para acessar o sistema de auditoria.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Obter o role do usuário - assumir 'admin' se não tiver metadados específicos
  const userRole = (user.role === 'admin' ? 'admin' : 'member') as UserRole;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="py-8">
        <AuditDashboard 
          userRole={userRole} 
          userId={user.id}
        />
      </main>
      <Footer />
    </div>
  );
};

export default AuditPage;
