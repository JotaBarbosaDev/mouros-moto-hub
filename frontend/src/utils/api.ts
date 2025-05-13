/**
 * Função utilitária para obter o token de acesso atual
 * Tenta buscar o token a partir de várias fontes na seguinte ordem:
 * 1. localStorage (fallback para compatibilidade)
 * 2. Sessão ativa do Supabase
 * 
 * @returns Promise com o token de acesso
 */
export const getAccessToken = async (): Promise<string> => {
  let token = '';
  let tokenSource = '';
  
  // 1. Tenta ler o token do localStorage (para compatibilidade com o auth-service.ts)
  const localToken = localStorage.getItem('accessToken');
  if (localToken && localToken.length > 20) { // Validação mínima do formato do token
    console.log('Usando token do localStorage');
    token = localToken;
    tokenSource = 'localStorage';
    
    // Verifica se o token pode estar próximo da expiração
    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = tokenData.exp * 1000; // converter para milissegundos
      const now = Date.now();
      const timeUntilExpiry = expirationTime - now;
      
      // Se o token expira em menos de 5 minutos, tentamos obter um novo
      if (timeUntilExpiry < 5 * 60 * 1000) {
        console.log('Token do localStorage próximo da expiração, tentando renovar...');
        token = ''; // Força buscar um novo token
      }
    } catch (error) {
      // Se houver erro ao decodificar o token, ignoramos e usamos o token como está
      console.warn('Não foi possível verificar expiração do token:', error);
    }
  }
  
  // 2. Se não tem token válido no localStorage, tenta obter da sessão do Supabase
  if (!token) {
    try {
      // O import deve ser feito aqui para evitar circular dependency
      const { supabase } = await import('../integrations/supabase/client');
      
      const { data } = await supabase.auth.getSession();
      const sessionToken = data?.session?.access_token;
      
      if (sessionToken && sessionToken.length > 20) { // Validação mínima do formato do token
        console.log('Token do Supabase encontrado e será usado para autenticação');
        
        // Salvar no localStorage para uso futuro
        localStorage.setItem('accessToken', sessionToken);
        
        token = sessionToken;
        tokenSource = 'Supabase';
      }
    } catch (error) {
      console.error('Erro ao obter token de sessão do Supabase:', error);
    }
  }
  
  if (!token) {
    console.warn('Nenhum token de autenticação válido encontrado');
  } else {
    console.log(`Token obtido com sucesso (fonte: ${tokenSource})`);
  }
  
  return token;
};

/**
 * Função para fazer chamadas à API com autenticação
 * @param url URL da API
 * @param options Opções de fetch
 * @returns Promise com a resposta
 */
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = await getAccessToken();
  
  if (!token) {
    console.error('fetchWithAuth: Tentativa de fazer chamada autenticada sem token válido');
    throw new Error('Não foi possível autenticar a solicitação. Faça login novamente.');
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    // Se o token estiver expirado ou inválido
    if (response.status === 401) {
      console.warn('fetchWithAuth: Token rejeitado pela API (401). Possível expiração.');
      
      // Limpa o token do localStorage para forçar nova autenticação
      localStorage.removeItem('accessToken');
      
      // Lança erro específico que pode ser tratado pelos componentes
      throw new Error('Sessão expirada. Por favor, faça login novamente.');
    }
    
    return response;
  } catch (error) {
    console.error('fetchWithAuth: Erro na chamada de API:', error);
    
    // Relança o erro para ser tratado pelos chamadores
    throw error;
  }
};

/**
 * Retorna a URL base da API conforme a configuração do ambiente
 * @returns URL base da API
 */
export const getApiBaseUrl = (): string => {
  // Se temos uma configuração específica, usamos ela
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Detecção automática baseada na URL atual
  const currentHost = window.location.hostname;
  const currentPort = window.location.port;
  const isLocalhost = currentHost === 'localhost' || currentHost === '127.0.0.1';
  
  // Se estamos em desenvolvimento local
  if (isLocalhost) {
    return 'http://localhost:3001/api';
  }
  
  // Em produção, assumimos que a API está no mesmo domínio
  const protocol = window.location.protocol;
  const host = window.location.host;
  return `${protocol}//${host}/api`;
};
