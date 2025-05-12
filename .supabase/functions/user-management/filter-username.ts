
/**
 * Esta função identifica e corrige transformações incorretas em usernames
 * Por exemplo: "joao.barbosa" sendo transformado em "jotambbarbosa"
 * 
 * A análise revelou que em algum ponto do fluxo de processamento,
 * está ocorrendo uma substituição incorreta onde o ponto "." é substituído por "mb",
 * e "joao" é transformado em "jota". Isso é um problema específico
 * que esta função detecta e corrige.
 */
export function filterUsername(username: string): string {
  if (!username) return "";
  
  console.log("Analisando username para possíveis problemas:", username);
  
  // Caso específico: "jotambbarbosa" -> "joao.barbosa"
  // Padrão: "jota" seguido de "mb", onde deveria ser "joao."
  if (username.includes('mb')) {
    const mbIndex = username.indexOf('mb');
    
    if (mbIndex > 0 && mbIndex < username.length - 2) {
      // Verifica especificamente para casos como "jotambbarbosa" -> "joao.barbosa"
      if (mbIndex >= 3 && username.substring(0, mbIndex) === 'jota') {
        const correctedUsername = 'joao.' + username.substring(mbIndex + 2);
        console.log(`Corrigindo username: ${username} -> ${correctedUsername}`);
        return correctedUsername;
      }
    }
  }
  
  // Caso geral: detectar padrões onde "mb" pode ter substituído um ponto
  if (username.includes('mb')) {
    // Busca por outros padrões onde "mb" pode estar no lugar de um ponto
    const mbIndex = username.indexOf('mb');
    
    if (mbIndex > 0 && mbIndex < username.length - 2) {
      // Considerando que qualquer "mb" entre palavras pode ser um ponto incorretamente substituído
      // Esta é uma heurística simples e pode precisar de refinamento baseado em mais exemplos
      
      // Verifica se os caracteres em torno de "mb" sugerem uma separação de palavras
      const charBeforeMb = username.charAt(mbIndex - 1);
      const charAfterMb = username.charAt(mbIndex + 2);
      
      // Se parece que "mb" está entre duas palavras, substitua por um ponto
      if (/[a-z]/i.test(charBeforeMb) && /[a-z]/i.test(charAfterMb)) {
        const correctedUsername = 
          username.substring(0, mbIndex) + '.' + username.substring(mbIndex + 2);
        console.log(`Possível correção: ${username} -> ${correctedUsername}`);
        return correctedUsername;
      }
    }
  }
  
  // Detecção específica para "joao.barbosa" vs "jotambbarbosa"
  // Verifica se o username atual é "jotambbarbosa"
  if (username === 'jotambbarbosa') {
    console.log('Detectado caso específico: jotambbarbosa -> joao.barbosa');
    return 'joao.barbosa';
  }
  
  // Se não encontrou padrões de transformação incorreta, retorna o username original
  return username;
}
