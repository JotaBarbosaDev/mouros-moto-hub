# Correção das URLs de API no Mouros Moto Hub

## Problema Identificado

Foi identificado um erro 500 (Internal Server Error) nas chamadas de API, especialmente nos endpoints de autenticação como `/api/auth/login`. Este documento explica o problema e a solução implementada.

## Causa do Problema

O problema ocorreu devido a uma inconsistência na forma como as URLs da API são construídas no frontend e esperadas no backend:

1. **Configuração da URL Base**:
   - No arquivo `.env` do frontend, a variável `VITE_API_URL` está configurada como `http://localhost:3001/api`
   - A função `getApiBaseUrl()` retorna esta URL com `/api` já incluído

2. **Rotas no Backend**:
   - No backend (arquivo `/backend/src/index.js`), as rotas são montadas como:
     ```javascript
     app.use('/api/auth', authRoutes);
     app.use('/api/members', membersRoutes);
     app.use('/api/vehicles', vehiclesRoutes);
     // etc.
     ```

3. **Chamadas no Frontend**:
   - Inicialmente, as chamadas no frontend foram modificadas para:
     ```typescript
     const apiUrl = `${getApiBaseUrl()}/auth/login`;
     ```
   - Isso resultava em: `http://localhost:3001/api/auth/login`

   - Depois, tentamos adicionar explicitamente `/api/`:
     ```typescript
     const apiUrl = `${getApiBaseUrl()}/api/auth/login`;
     ```
   - Resultando em: `http://localhost:3001/api/api/auth/login` (com prefixo duplicado)
   - Porém isso causou erros 404 pois o backend espera: `http://localhost:3001/api/auth/login` (sem duplicação)

## Solução Implementada

### 1. Correção Final

As chamadas de API foram ajustadas para evitar o prefixo `/api/` duplicado:

```typescript
// Correto:
const apiUrl = `${getApiBaseUrl()}/auth/login`;
```

Isto corrige o problema porque a chamada resultante é:
`http://localhost:3001/api/auth/login`, que corresponde à rota configurada no backend.

A solução confirma nossa análise: a variável `VITE_API_URL` já inclui `/api` e não devemos adicioná-lo novamente.

### 2. Script de Verificação Automática

Foi criado um script (`check-api-url-patterns.sh`) que:
- Verifica todos os serviços do frontend para detectar URLs inconsistentes
- Ajusta automaticamente os padrões de URL com base na configuração do arquivo `.env`
- Cria backups dos arquivos modificados para permitir reverter as alterações

### 3. Soluções Alternativas Consideradas

Também foram consideradas as seguintes alternativas:

1. **Modificar a função `getApiBaseUrl()`** para não incluir `/api` e atualizar todas as chamadas
2. **Modificar as rotas no backend** para não usar o prefixo `/api`
3. **Mudar a variável de ambiente** `VITE_API_URL` para não incluir `/api`

No entanto, a solução escolhida foi a mais simples e com menor risco de causar problemas adicionais.

## Como Testar a Correção

1. Execute o frontend e backend:
   ```bash
   cd /Users/joaobarbosa/Desktop/projetos/mouros-moto-hub
   ./start-backend.sh
   
   cd frontend
   npm run dev
   ```

2. Tente realizar login com credenciais válidas

3. Verifique no console do navegador se:
   - A URL de login mostrada é `http://localhost:3001/api/api/auth/login`
   - A resposta é bem-sucedida (código 200) e não um erro 500

## Lições Aprendidas

1. **Consistência de APIs**: Manter um padrão consistente para URLs de API
2. **Documentação**: Documentar claramente como as URLs são construídas
3. **Padronização**: Estabelecer convenções claras sobre prefixos de URL

---

**Data da correção**: 18 de maio de 2025  
**Autor**: João Barbosa
