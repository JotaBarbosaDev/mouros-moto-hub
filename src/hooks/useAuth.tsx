
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useAuth() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
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

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message);
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
    } catch (error) {
      toast.error(error.message);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/membros');
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      toast.success('Email de recuperação enviado!');
    } catch (error) {
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
