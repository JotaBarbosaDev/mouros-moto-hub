import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';
import { adminUserService } from '../services/admin-user-service';
import { authService, UserProfile } from '../services/auth-service';
import { userProfileService, UserByUsername } from '../services/user-profile-service';
import { saveProfileToCache, getProfileFromCache, clearProfileCache } from '../utils/profile-cache';

type ErrorWithMessage = {
  message: string;
};

// Tipo para o usuário
type User = UserProfile | null;

export function useAuth() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Função para carregar o perfil do usuário após login
  const loadUserProfile = async () => {
    try {
      // Primeiro, tentamos buscar do cache
      const cachedProfile = getProfileFromCache();
      if (cachedProfile) {
        console.log('Usando perfil do cache:', cachedProfile);
        setUser(cachedProfile);
        setLoading(false);
        return;
      }

      // Se não temos no cache, verificamos a sessão no Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        try {
          console.log('Obtendo perfil completo da API para:', session.user.email);
          
          // Tentativa 1: Usar o serviço de autenticação para obter o perfil
          try {
            console.log('Tentativa 1: Usando authService.getProfile()');
            const userProfile = await authService.getProfile();
            console.log('Perfil completo obtido com authService:', userProfile);
            
            if (userProfile && userProfile.id) {
              // Salvar o perfil no cache
              saveProfileToCache(userProfile);
              setUser(userProfile);
              setLoading(false);
              return;
            } else {
              throw new Error('Perfil incompleto recebido do authService');
            }
          } catch (serviceError) {
            console.warn('Falha ao usar authService:', serviceError);
            // Continua para próxima tentativa
          }
          
          // Tentativa 2: Chamar diretamente a API
          try {
            console.log('Tentativa 2: Chamando API diretamente');
            const apiUrl = `${window.location.origin.includes('localhost') ? 'http://localhost:3001' : ''}/api/auth/me`;
            const token = session.access_token;
            
            console.log('URL da API:', apiUrl);
            const response = await fetch(apiUrl, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (response.ok) {
              const profileData = await response.json();
              console.log('Perfil obtido diretamente da API:', profileData);
              
              if (profileData && profileData.id) {
                const userProfile = {
                  id: profileData.id,
                  email: profileData.email,
                  name: profileData.user_metadata?.name || profileData.name,
                  avatarUrl: profileData.user_metadata?.avatar_url,
                  role: profileData.role || 'user',
                  memberId: profileData.member_id
                };
                
                // Salvar no cache
                saveProfileToCache(userProfile);
                setUser(userProfile);
                setLoading(false);
                return;
              } else {
                throw new Error('Perfil incompleto recebido da API');
              }
            } else {
              const errorText = await response.text().catch(() => 'Erro desconhecido');
              console.error(`API retornou erro (${response.status}):`, errorText);
              throw new Error(`API retornou status ${response.status}`);
            }
          } catch (directApiError) {
            console.warn('Falha ao chamar API diretamente:', directApiError);
            // Continua para a última alternativa
          }
          
          // Última alternativa: usar dados básicos do Supabase
          console.log('Tentativa 3: Usando dados básicos do Supabase como fallback');
          
          // Validar minimamente os dados do Supabase
          if (session.user && session.user.id && session.user.email) {
            // Informações mínimas necessárias
            const basicProfile = {
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.name || session.user.email.split('@')[0],
              role: session.user.user_metadata?.role || 'user'
            };
            
            // Salvar também no cache como último recurso
            saveProfileToCache(basicProfile);
            setUser(basicProfile);
          } else {
            console.warn('Dados de usuário do Supabase incompletos:', session.user);
            setUser(null);
            setAuthError('Dados de usuário incompletos');
          }
        } catch (profileError) {
          console.error('Erro ao obter perfil adicional:', profileError);
          // Caso não consiga obter o perfil completo, define um erro de autenticação
          setUser(null);
          setAuthError('Falha ao carregar perfil de usuário');
        } finally {
          setLoading(false);
        }
      } else {
        console.log('Nenhuma sessão ativa encontrada no Supabase');
        setUser(null);
        clearProfileCache(); // Limpa o cache quando não há usuário logado
        setLoading(false);
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      setUser(null);
      setAuthError('Erro ao verificar autenticação');
      setLoading(false);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        if (session?.user) {
          await loadUserProfile();
          
          // Atualiza o token em localStorage se disponível
          if (session.access_token) {
            localStorage.setItem('accessToken', session.access_token);
          }
        } else {
          setUser(null);
          clearProfileCache(); // Limpa o cache quando o usuário desconecta
          setLoading(false);
        }
      }
    );

    // Configurar refresh automático de token
    const setupTokenRefresh = () => {
      // Verificar o token a cada 5 minutos
      const interval = setInterval(async () => {
        try {
          const { data } = await supabase.auth.getSession();
          const session = data.session;
          
          if (session) {
            // Se o token expira em menos de 30 minutos, atualiza
            const expiresAt = session.expires_at ? new Date(session.expires_at * 1000) : null;
            
            if (expiresAt) {
              const now = new Date();
              const timeUntilExpiry = expiresAt.getTime() - now.getTime();
              const thirtyMinutes = 30 * 60 * 1000;
              
              if (timeUntilExpiry < thirtyMinutes) {
                console.log('Token próximo de expirar, renovando...');
                const { data: refreshData } = await supabase.auth.refreshSession();
                
                if (refreshData.session) {
                  // Atualiza o token no localStorage
                  localStorage.setItem('accessToken', refreshData.session.access_token);
                  console.log('Token renovado com sucesso');
                }
              }
            }
          }
        } catch (error) {
          console.warn('Erro ao tentar renovar token:', error);
        }
      }, 5 * 60 * 1000); // A cada 5 minutos
      
      return interval;
    };

    // Verificar sessão existente
    loadUserProfile();
    
    // Configurar refresh de token
    const tokenRefreshInterval = setupTokenRefresh();

    return () => {
      subscription.unsubscribe();
      clearInterval(tokenRefreshInterval);
    };
  }, []);

  const login = async (emailOrUsername: string, password: string) => {
    try {
      setAuthError(null); // Reset error state before attempting login
      console.log(`Iniciando login com ${emailOrUsername}...`);
      
      // Verifica se o campo está vazio
      if (!emailOrUsername || !password) {
        const errorMsg = 'Por favor, preencha todos os campos';
        setAuthError(errorMsg);
        throw new Error(errorMsg);
      }
      
      // Tenta fazer login diretamente com o valor fornecido como email
      let { error } = await supabase.auth.signInWithPassword({
        email: emailOrUsername,
        password,
      });

      // Se falhou e não contém @, pode ser um username
      if (error && !emailOrUsername.includes('@')) {
        console.log('Tentando encontrar email pelo username...');
        setAuthError('Verificando usuário...');
        
        try {
          // Usar nosso serviço para buscar o usuário pelo username
          const { data: userData, error: userError } = await userProfileService.findUserByUsername(emailOrUsername);
          
          let email: string | null = null;
          if (!userError && userData) {
            email = userData.email;
            console.log(`Email encontrado via serviço: ${email}`);
          }
          
          // Se não encontrou pelo serviço, tentamos o serviço admin como alternativa
          if (!email) {
            try {
              const { data: adminUserData, error: adminUserError } = await adminUserService.findUserByUsername(emailOrUsername);
              
              if (!adminUserError && adminUserData) {
                email = adminUserData.email;
                console.log(`Email encontrado via serviço admin: ${email}`);
              }
            } catch (adminError) {
              console.warn('Erro ao buscar pelo serviço admin:', adminError);
            }
          }
            
          if (email) {
            console.log(`Email encontrado: ${email}, tentando login...`);
            setAuthError('Fazendo login...');
            // Tenta fazer login com o email encontrado
            const loginResult = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            
            error = loginResult.error;
          } else {
            console.log('Email não encontrado para o username fornecido');
            setAuthError('Usuário não encontrado');
            throw new Error('Usuário não encontrado');
          }
        } catch (queryErr) {
          console.error('Erro ao buscar email pelo username:', queryErr);
          setAuthError('Erro ao buscar usuário. Verifique suas credenciais.');
          throw queryErr;
        }
      }

      if (error) {
        console.error('Erro ao fazer login:', error);
        setAuthError(error.message);
        throw error;
      }

      // Atualiza o perfil do usuário após login bem-sucedido
      await loadUserProfile();
      
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
    } catch (err) {
      const error = err as ErrorWithMessage;
      toast.error(error.message || 'Erro ao realizar login');
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      setAuthError(null);
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setAuthError(error.message);
        throw error;
      }

      toast.success('Cadastro realizado! Verifique seu email.');
    } catch (err) {
      const error = err as ErrorWithMessage;
      toast.error(error.message);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setAuthError(error.message);
        throw error;
      }
      setUser(null);
      clearProfileCache();
      navigate('/membros');
      toast.success('Logout realizado com sucesso!');
    } catch (err) {
      const error = err as ErrorWithMessage;
      toast.error(error.message);
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      setAuthError(null);
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        setAuthError(error.message);
        throw error;
      }
      toast.success('Email de recuperação enviado!');
    } catch (err) {
      const error = err as ErrorWithMessage;
      toast.error(error.message);
    }
  };

  // Função para atualizar o perfil manualmente
  const refreshProfile = async () => {
    setLoading(true);
    clearProfileCache(); // Limpa o cache para forçar uma nova consulta
    await loadUserProfile();
  };

  return {
    user,
    loading,
    login,
    signup,
    logout,
    requestPasswordReset,
    refreshProfile,
    authError // Exportando o estado de erro para uso nos componentes
  };
}
