// src/hooks/useAuth.ts
import { useAuth as useBaseAuth } from './use-auth';
import { LoginCredentials, RegisterData } from '@/services/auth-service';
import { useState } from 'react';
import { useToast } from './use-toast';

export function useAuth() {
  const baseAuth = useBaseAuth();
  const { toast } = useToast();
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Login com tentativa de reconhecer padrão de email ou username
  const login = async (emailOrUsername: string, password: string) => {
    setLoginLoading(true);
    try {
      // Aqui usamos nosso serviço de autenticação existente
      // Se for um email, usamos diretamente
      // Se for um nome de usuário, poderíamos ter uma etapa intermediária para buscar o email correspondente
      const credentials: LoginCredentials = {
        email: emailOrUsername,  // Assumimos que é um email
        password
      };
      
      await baseAuth.login(credentials);
      toast({
        title: 'Login efetuado com sucesso!',
        description: 'Bem-vindo de volta.'
      });
    } catch (error) {
      toast({
        title: 'Erro ao fazer login',
        description: error instanceof Error ? error.message : 'Credenciais inválidas. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setLoginLoading(false);
    }
  };

  // Cadastro de usuário
  const signup = async (email: string, password: string, name?: string) => {
    setRegisterLoading(true);
    try {
      const userData: RegisterData = {
        email,
        password,
        name: name || ''
      };
      
      await baseAuth.register(userData);
      toast({
        title: 'Cadastro realizado com sucesso!',
        description: 'Bem-vindo ao Mouros Moto Hub.'
      });
    } catch (error) {
      toast({
        title: 'Erro ao fazer cadastro',
        description: error instanceof Error ? error.message : 'Não foi possível completar o cadastro. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setRegisterLoading(false);
    }
  };

  // Reset de senha (futura implementação)
  const requestPasswordReset = async (email: string) => {
    setResetLoading(true);
    try {
      // Função não implementada ainda
      toast({
        title: 'Solicitação enviada',
        description: 'Verifique seu email para instruções de recuperação de senha.'
      });
    } catch (error) {
      toast({
        title: 'Erro ao solicitar recuperação',
        description: error instanceof Error ? error.message : 'Não foi possível enviar o email de recuperação. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setResetLoading(false);
    }
  };

  return {
    ...baseAuth,
    loading: baseAuth.isLoading || loginLoading || registerLoading || resetLoading,
    login, 
    signup, 
    requestPasswordReset
  };
}
