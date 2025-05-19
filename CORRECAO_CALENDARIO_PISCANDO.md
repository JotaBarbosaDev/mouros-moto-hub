# Correção do Problema do Calendário Piscando

O problema do calendário piscando constantemente na aplicação Mouros Moto Hub está relacionado a ciclos de re-renderização causados por atualizações de estado que ocorrem repetidamente. Para resolver esse problema, siga estas instruções:

## 1. Corrigir o hook useBarShiftsDirect

Abra o arquivo `/Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/frontend/src/hooks/use-bar-shifts-direct.ts` e substitua todo o seu conteúdo pelo seguinte:

```typescript
// Hook para buscar escalas de bar diretamente, sem usar React Query
import { supabase } from '@/integrations/supabase/client';
import { useState, useCallback } from 'react';

export interface BarShift {
  id: string;
  scheduleId: string;
  memberId: string;
  memberName?: string;
  assignedMemberName?: string; // Campo adicional para compatibilidade
  startTime: Date;
  endTime: Date;
  date?: Date; // Campo adicional para compatibilidade com calendário
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  description?: string; // Campo adicional para compatibilidade
}

// Hook simples que não depende do React Query
export const useBarShiftsDirect = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Busca todas as escalas - usando useCallback para evitar recriação da função
  const getAllShifts = useCallback(async (): Promise<BarShift[]> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('bar_shifts')
        .select(`
          *,
          members:member_id (name)
        `)
        .order('start_time', { ascending: true });
  
      if (error) {
        console.error('Erro ao buscar escalas do bar:', error);
        setError(error);
        return [];
      }
  
      return (data || []).map(shift => {
        const startTime = new Date(shift.start_time);
        return {
          id: shift.id,
          scheduleId: shift.schedule_id,
          memberId: shift.member_id,
          memberName: shift.members?.name || 'Membro não encontrado',
          assignedMemberName: shift.members?.name || 'Membro não encontrado', 
          startTime,
          endTime: new Date(shift.end_time),
          date: startTime, // Adicionando para facilitar uso no calendário
          status: shift.status as 'scheduled' | 'completed' | 'cancelled',
          notes: shift.notes,
          description: shift.notes || 'Turno de bar'
        };
      });
    } catch (err) {
      console.error("Erro ao buscar escalas:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    getAllShifts,
    isLoading,
    error
  };
};
```

## 2. Corrigir o componente Calendar.tsx

Abra o arquivo `/Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/frontend/src/pages/Calendar.tsx` e faça as seguintes alterações:

1. Adicione o import do `useCallback` no topo do arquivo:
   ```typescript
   import { useState, useEffect, useCallback } from 'react';
   ```

2. Substitua a parte que carrega as escalas do bar por:
   ```typescript
   // Carregar escalas do bar
   const { getAllShifts } = useBarShiftsDirect();
  
   // Função para carregar as escalas - usando useCallback para evitar recriações
   const loadShifts = useCallback(async () => {
     if (!includeShifts) {
       setBarShifts([]);
       return;
     }
    
     setIsLoadingShifts(true);
     try {
       const shifts = await getAllShifts();
       setBarShifts(shifts || []);
     } catch (error) {
       console.error("Erro ao carregar escalas do bar:", error);
     } finally {
       setIsLoadingShifts(false);
     }
   }, [includeShifts, getAllShifts]);
  
   // Carregar escalas quando o componente for montado ou quando a preferência mudar
   useEffect(() => {
     let isMounted = true;
    
     const fetchData = async () => {
       if (isMounted) {
         await loadShifts();
       }
     };
    
     fetchData();
    
     return () => {
       isMounted = false;
     };
   }, [loadShifts]); // Dependência apenas do loadShifts que já tem includeShifts como dependência
   ```

## Por que esta solução funciona:

1. **Minimização de re-renderizações**: Usando `useCallback` para memoizar a função de carregamento de escalas, evitamos que novas instâncias da função sejam criadas a cada renderização.

2. **Limpeza adequada**: A função de limpeza no `useEffect` garante que não tentamos atualizar o estado após o componente ser desmontado.

3. **Controle de dependências**: Reduzimos as dependências do `useEffect` para apenas `loadShifts`, que por sua vez já tem suas próprias dependências configuradas corretamente.

4. **Melhor gestão de estado**: Separamos claramente os estados de carregamento e erro no hook `useBarShiftsDirect`.

Estas alterações devem resolver o problema de piscar contínuo na página do calendário.
