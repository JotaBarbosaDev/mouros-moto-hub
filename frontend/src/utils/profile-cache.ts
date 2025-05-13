/**
 * Utilitário para cache local de perfil de usuário
 */

const USER_PROFILE_CACHE_KEY = 'mouros_user_profile';
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutos

interface CachedProfile {
  profile: any;
  timestamp: number;
}

/**
 * Salva o perfil do usuário no cache local
 */
export const saveProfileToCache = (profile: any): void => {
  if (!profile || !profile.id) return;
  
  try {
    const cacheData: CachedProfile = {
      profile,
      timestamp: Date.now()
    };
    
    localStorage.setItem(USER_PROFILE_CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Erro ao salvar perfil no cache:', error);
    // Apenas registra erro, não interrompe o fluxo
  }
};

/**
 * Recupera o perfil do usuário do cache local
 * Retorna null se não houver cache ou se estiver expirado
 */
export const getProfileFromCache = (): any | null => {
  try {
    const cachedDataJson = localStorage.getItem(USER_PROFILE_CACHE_KEY);
    
    if (!cachedDataJson) return null;
    
    const cachedData: CachedProfile = JSON.parse(cachedDataJson);
    const now = Date.now();
    
    // Verifica se o cache está expirado
    if (now - cachedData.timestamp > CACHE_DURATION_MS) {
      localStorage.removeItem(USER_PROFILE_CACHE_KEY);
      return null;
    }
    
    return cachedData.profile;
  } catch (error) {
    console.warn('Erro ao recuperar perfil do cache:', error);
    return null;
  }
};

/**
 * Limpa o cache de perfil do usuário
 */
export const clearProfileCache = (): void => {
  try {
    localStorage.removeItem(USER_PROFILE_CACHE_KEY);
  } catch (error) {
    console.warn('Erro ao limpar cache de perfil:', error);
  }
};
