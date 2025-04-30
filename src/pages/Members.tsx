
import { useAuth } from '@/hooks/useAuth';
import AuthForm from '@/components/AuthForm';
import { MembersLayout } from '@/components/layouts/MembersLayout';
import { MemberList } from '@/components/members/MemberList';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Members = () => {
  const { user, loading } = useAuth();

  if (loading) return null;
  
  // Se o usuário estiver autenticado, mostre a área de membros
  if (user) {
    return (
      <MembersLayout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-display text-mouro-black mb-8">
            Gestão de <span className="text-mouro-red">Membros</span>
          </h1>
          <MemberList />
        </div>
      </MembersLayout>
    );
  }

  // Se o usuário não estiver autenticado, mostre o formulário de login
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-display text-mouro-black mb-8 text-center">
            Área de <span className="text-mouro-red">Membros</span>
          </h1>
          <p className="text-center mb-8">Faça login para acessar a área restrita.</p>
          <AuthForm />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Members;
