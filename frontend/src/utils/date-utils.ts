// Função utilitária para lidar com datas de maneira segura
export const safeDateUtils = {
  // Garantir que o valor é uma string ISO
  ensureISOString: (date: Date | string | null | undefined): string => {
    // Se for uma string, verifica se é válida
    if (typeof date === 'string') {
      try {
        // Tenta converter para Date e depois para ISO
        const parsed = new Date(date);
        if (!isNaN(parsed.getTime())) {
          return parsed.toISOString();
        }
        // Se não for uma data válida, retorna data atual
        return new Date().toISOString();
      } catch (e) {
        return new Date().toISOString();
      }
    }
    // Se for Date, converte para ISO
    else if (date instanceof Date) {
      return date.toISOString();
    }
    // Caso contrário, retorna a data atual
    return new Date().toISOString();
  },
  // Converter string de data para objeto Date de forma segura
  parseDate: (dateString: string | Date | null | undefined): Date | null => {
    if (!dateString) return null;
    
    try {
      // Se já for um objeto Date, retorna o próprio
      if (dateString instanceof Date) return dateString;
      
      // Tenta converter para Date
      const parsedDate = new Date(dateString);
      
      // Verifica se é uma data válida
      if (isNaN(parsedDate.getTime())) {
        console.error("Data inválida:", dateString);
        return null;
      }
      
      return parsedDate;
    } catch (error) {
      console.error("Erro ao converter data:", error);
      return null;
    }
  },

  // Formatar data para exibição
  formatDisplay: (date: Date | string | null | undefined, format: string = 'yyyy-MM-dd'): string => {
    if (!date) return '';
    
    try {
      const dateObject = typeof date === 'string' ? new Date(date) : date;
      
      // Verifica se é uma data válida
      if (!dateObject || isNaN(dateObject.getTime())) {
        console.error("Data inválida para formatação:", date);
        return '';
      }
      
      return new Intl.DateTimeFormat('pt-BR').format(dateObject);
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return '';
    }
  },

  // Converter para ISO String de forma segura
  toISOString: (date: Date | string | null | undefined): string => {
    if (!date) return new Date().toISOString();
    
    try {
      const dateObject = typeof date === 'string' ? new Date(date) : date;
      
      // Verifica se é uma data válida
      if (!dateObject || isNaN(dateObject.getTime())) {
        console.error("Data inválida para converter para ISO:", date);
        return new Date().toISOString();
      }
      
      return dateObject.toISOString();
    } catch (error) {
      console.error("Erro ao converter data para ISO:", error);
      return new Date().toISOString();
    }
  },

  // Obter uma data válida ou data padrão
  getValidDate: (date: Date | string | null | undefined, defaultDate: Date | string = new Date()): Date => {
    const parsedDate = safeDateUtils.parseDate(date);
    const parsedDefault = typeof defaultDate === 'string' ? new Date(defaultDate) : defaultDate;
    
    return parsedDate || parsedDefault;
  }
};
