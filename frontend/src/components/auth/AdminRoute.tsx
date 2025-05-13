import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  
  // Verificar se o usuário está autenticado e é um administrador
  if (!user) return <Navigate to="/membros" replace />;
  
  // Verificar permissões de administrador
  // Neste exemplo, consideramos que o email admin@admin.com é o administrador
  const isAdmin = user.email === 'admin@admin.com';
  
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};
