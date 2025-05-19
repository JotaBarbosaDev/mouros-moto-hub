# Correções Implementadas no Calendário

## Problema Resolvido: Flickering na Página de Calendário

O sistema apresentava um problema onde a página de calendário ficava piscando constantemente, tornando a interface instável e difícil de usar. Isso ocorria devido a um ciclo infinito de re-renderizações causado por atualizações de estado que aconteciam repetidamente.

## Soluções Implementadas

### 1. Corrigido ciclo de vida do componente com useCallback e useEffect adequados

O hook `useBarShiftsDirect` já utilizava a função `useCallback` para memoizar a função `getAllShifts`, evitando recriações desnecessárias dessa função a cada renderização.

Na página `Calendar.tsx`, foram implementadas as seguintes melhorias:

1. Adicionado `useCallback` para a função `loadShifts`, garantindo que ela não seja recriada a cada renderização:

```typescript
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
```

2. Corrigido o `useEffect` para ter apenas `loadShifts` como dependência:

```typescript
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

3. Adicionado uma função de limpeza (cleanup) no `useEffect` com a flag `isMounted` para evitar atualizações de estado após o componente ser desmontado.

### 2. Eliminada dependência incorreta de `barShiftsDirect`

O problema principal estava na dependência incorreta do array de dependências do `useEffect`, que originalmente incluía:

```typescript
}, [includeShifts, barShiftsDirect]);
```

Essa dependência não existe como variável no componente e provocava re-renderizações constantes. Foi corrigida para:

```typescript
}, [loadShifts]);
```

Como a função `loadShifts` já tem dependência de `includeShifts` e `getAllShifts`, qualquer alteração nessas variáveis já vai disparar corretamente o `useEffect`.

## Resultados

1. **Interface estável**: A página de calendário não pisca mais e mantém a estabilidade visual
2. **Melhor desempenho**: Menos renderizações desnecessárias, tornando a aplicação mais eficiente
3. **Prevenção de vazamento de memória**: A função de limpeza no useEffect garante que não haverá atualizações de estado após o componente ser desmontado

## Como verificar a solução

1. Acesse a página do calendário e verifique que ela não está mais piscando constantemente
2. Tente alternar a opção "Escalas do Bar" usando o switch na página - o carregamento deve ocorrer normalmente, sem causar piscadas na interface
3. Navegue entre as abas "Mensal" e "Agenda" - a transição deve ser suave, sem efeitos visuais indesejados
