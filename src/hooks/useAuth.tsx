// filepath: /Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/src/hooks/useAuth.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { adminUserService } from '@/services/admin-user-service';

type ErrorWithMessage = {
  message: string;
};

// Usamos um tipo mais simples para evitar problemas de compatibilidade
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseUser = any;

export function useAuth() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (emailOrUsername: string, password: string) => {
    try {
      console.log(`Iniciando login com ${emailOrUsername}...`);
      
      // Tenta fazer login diretamente com o valor fornecido como email
      let { error } = await supabase.auth.signInWithPassword({
        email: emailOrUsername,
        password,
      });

      // Se falhou e não contém @, pode ser um username
      if (error && !emailOrUsername.includes('@')) {
        console.log('Tentando encontrar email pelo username...');
        
        try {
          // Usar nosso serviço para buscar o usuário pelo username
          const { data: userData, error: userError } = await adminUserService.findUserByUsername(emailOrUsername);
          
          let email = null;
          if (!userError && userData) {
            email = userData.email;
            console.log(`Email encontrado via serviço: ${email}`);
          }
          
          // Se não encontrou pelo serviço, tentamos um método alternativo
          if (!email) {
            // Consulta a view que contém usuários e seus metadados
            const { data: memberData, error: queryError } = await supabase
              .from('user_profiles_view')
              .select('email')
              .ilike('metadata->username', emailOrUsername)
              .limit(1);
              
            if (!queryError && memberData && memberData.length > 0) {
              email = memberData[0].email;
              console.log(`Email encontrado via view: ${email}`);
            }
          }
            
          if (email) {
            console.log(`Email encontrado: ${email}, tentando login...`);
            // Tenta fazer login com o email encontrado
            const loginResult = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            
            error = loginResult.error;
          } else {
            console.log('Email não encontrado para o username fornecido');
          }
        } catch (queryErr) {
          console.error('Erro ao buscar email pelo username:', queryErr);
        }
      }

      if (error) {
        console.error('Erro ao fazer login:', error);
        throw error;
      }

      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
    } catch (err) {
      const error = err as ErrorWithMessage;
      toast.error(error.message || 'Erro ao realizar login');
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      toast.success('Cadastro realizado! Verifique seu email.');
    } catch (err) {
      const error = err as ErrorWithMessage;
      toast.error(error.message);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/membros');
      toast.success('Logout realizado com sucesso!');
    } catch (err) {
      const error = err as ErrorWithMessage;
      toast.error(error.message);
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      toast.success('Email de recuperação enviado!');
    } catch (err) {
      const error = err as ErrorWithMessage;
      toast.error(error.message);
    }
  };

  return {
    user,
    loading,
    login,
    signup,
    logout,
    requestPasswordReset
  };
}
