
/**
 * Esta função agora preserva todos os usernames exatamente como foram digitados
 * Permite todos os caracteres, incluindo:
 * - Letras maiúsculas e minúsculas
 * - Números
 * - Símbolos especiais como pontos, traços, etc.
 * 
 * Não faz qualquer correção automática - mantém o valor exato que foi inserido pelo usuário
 */
export function filterUsername(username: string): string {
  if (!username) return "";
  
  console.log("Username recebido (preservado sem modificações):", username);
  
  // Registra para fins de diagnóstico se o username contém caracteres especiais
  const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(username);
  const hasUppercase = /[A-Z]/.test(username);
  const hasNumbers = /[0-9]/.test(username);
  
  if (hasSpecialChars || hasUppercase || hasNumbers) {
    console.log("Características do username:", {
      comprimento: username.length,
      temCaracteresEspeciais: hasSpecialChars,
      temMaiusculas: hasUppercase,
      temNumeros: hasNumbers
    });
  }
  
  // Preserva o username exatamente como foi recebido, sem modificações
  return username;
}
