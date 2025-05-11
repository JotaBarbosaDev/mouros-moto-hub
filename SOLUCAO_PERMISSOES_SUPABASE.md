# Soluções para Problemas de Permissão no Supabase

Este documento descreve as soluções implementadas para resolver os problemas de permissão no Supabase que estavam impedindo o funcionamento correto da aplicação Mouros Moto Hub.

## Problemas Identificados

1. **Erro 404 (Not Found)** ao tentar acessar a tabela `auth.users`
2. **Erro 403 (Forbidden)** ao tentar atualizar senha de usuário via admin API
3. **Erro 400 (Bad Request)** ao tentar atualizar dados de membro
4. **Erro CORS** ao chamar funções Edge a partir do frontend

## Soluções Implementadas

### 1. Funções Edge (Serverless)

Criamos funções Edge que são executadas no servidor Supabase com permissões elevadas:

- **`user-management`**: Gerencia operações de usuário (atualizar senha, atualizar metadados)
- **`list-users`**: Lista usuários do sistema com permissões adequadas

As funções Edge utilizam a chave `SERVICE_ROLE` do Supabase, que tem permissões administrativas completas, mas apenas no ambiente seguro do servidor.

### 1.1. Configuração CORS para Funções Edge

Para garantir que as funções Edge possam ser chamadas a partir do frontend local (localhost) durante o desenvolvimento, adicionamos configuração CORS adequada:

```typescript
// Exemplo de configuração CORS em todas as respostas
return new Response(data, {
  status: statusCode,
  headers: { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
  }
});
```

Essa configuração foi aplicada em todos os pontos de retorno das funções, incluindo respostas de sucesso e de erro, garantindo que nenhuma chamada seja bloqueada pela política CORS do navegador.

### 2. Funções RPC e Views SQL

Criamos uma migração SQL que implementa:

- **View `user_profiles_view`**: Combina dados de `auth.users` e `members`
- **Função RPC `get_user_by_username`**: Busca usuário pelo username nos metadados

Estas estruturas permitem que o frontend consulte informações de usuário sem precisar acessar diretamente tabelas restritas.

### 3. Serviços no Frontend

Desenvolvemos serviços para comunicação com as funções Edge:

- **`user-auth-service.ts`**: Gerencia operações de autenticação (atualizar senha, metadados)
- **`admin-user-service.ts`**: Lista e gerencia usuários (apenas para administradores)

## Como Usar

### Atualizar Senha de Usuário

Em vez de chamar diretamente a API Admin do Supabase:

```javascript
// NÃO FAZER - vai dar erro 403
await supabase.auth.admin.updateUserById(userId, { password });

// FAZER - usa a função Edge segura
// Importar no topo do arquivo
import { userAuthService } from '@/services/user-auth-service';

// Usar quando necessário
await userAuthService.updateUserPassword(userId, password);
```

### Atualizar Metadados de Usuário (incluindo username)

Em vez de chamar diretamente a API Admin:

```javascript
// NÃO FAZER - vai dar erro 403
await supabase.auth.admin.updateUserById(userId, { user_metadata: { username } });

// FAZER - usa a função Edge segura
const { userAuthService } = await import('@/services/user-auth-service');
await userAuthService.updateUserMetadata(userId, { username });
```

### Listar Usuários do Sistema

Em vez de acessar diretamente a tabela `auth.users`:

```javascript
// NÃO FAZER - vai dar erro 404
await supabase.from('auth.users').select('*');

// FAZER - usa a função Edge segura
// Importação assíncrona para evitar problemas de tipagem em alguns casos
const { adminUserService } = await import('@/services/admin-user-service');

// Listagem de usuários (para admins)
const { data: usuariosData } = await adminUserService.listUsers({ page: 1, pageSize: 10 });

// Busca por username (funciona no login)
const { data: userData } = await adminUserService.findUserByUsername('algum_username');
```

### Login por Username

Implementamos um mecanismo robusto para login por username:

```javascript
// Primeiro tenta login por email
let { error } = await supabase.auth.signInWithPassword({
  email: emailOrUsername,
  password,
});

// Se falhar, tenta encontrar o email pelo username
if (error && !emailOrUsername.includes('@')) {
  const { data } = await supabase.rpc('get_user_by_username', {
    p_username: emailOrUsername
  });
  
  if (data && data.email) {
    // Login com o email encontrado
    const result = await supabase.auth.signInWithPassword({
      email: data.email,
      password,
    });
  }
}
```

## Próximos Passos

1. Execute a migração do Supabase para criar a função RPC e a view
2. Implante as funções Edge no seu projeto Supabase
3. Adicione as chaves de serviço necessárias no painel do Supabase

## Observações

- As funções Edge exigem um plano Pro do Supabase para funcionar em produção
- Para desenvolvimento local, você pode usar o emulador de funções Edge do Supabase
