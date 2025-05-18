# Documentação das Funções Edge

Esta documentação descreve as funções Edge implementadas para resolver problemas de permissão no Supabase.

## Visão Geral

As funções Edge do Supabase são funções serverless que rodam com privilégios elevados, permitindo executar operações que normalmente não seriam possíveis com o cliente Supabase no frontend. Usamos essas funções para:

1. Gerenciar usuários (atualizar senha, metadados) - `user-management`
2. Listar usuários do sistema - `list-users`

## Funções Disponíveis

### 1. user-management

Esta função permite realizar operações administrativas em usuários.

#### Ações disponíveis:

- **getUser**: Obtém detalhes de um usuário por ID
- **updateUserPassword**: Atualiza a senha de um usuário
- **updateUserMetadata**: Atualiza os metadados de um usuário (incluindo username)

#### Exemplo de uso:

```javascript
// Importar o serviço no topo do arquivo
import { userAuthService } from '@/services/user-auth-service';

// Atualizar senha de um usuário
const { error } = await userAuthService.updateUserPassword(userId, 'nova-senha');

// Atualizar metadados (incluindo username)
const { error } = await userAuthService.updateUserMetadata(userId, {
  username: 'novo_username',
  name: 'Nome Completo'
});
```

### 2. list-users

Esta função permite listar usuários do sistema com filtragem e paginação.

#### Parâmetros:

- **filter**: String para filtrar usuários por email, nome ou username
- **page**: Número da página (começa em 1)
- **pageSize**: Quantidade de itens por página

#### Exemplo de uso:

```javascript
// Importar o serviço no topo do arquivo
import { adminUserService } from '@/services/admin-user-service';

// Listar usuários com paginação
const { data } = await adminUserService.listUsers({
  filter: 'joão', // Opcional - para filtrar resultados
  page: 1,        // Opcional - página atual
  pageSize: 10    // Opcional - itens por página
});

// Verificar resultado
if (data) {
  console.log(`Total de usuários: ${data.totalUsers}`);
  console.log(`Páginas: ${data.totalPages}`);
  console.log(`Usuários:`, data.users);
}
```

## Recursos SQL

Além das funções Edge, criamos:

1. **Vista `user_profiles_view`**: Combina dados de `auth.users` e `members`
2. **Função RPC `get_user_by_username`**: Busca usuário pelo username nos metadados

### Exemplo de uso da função RPC:

```javascript
import { adminUserService } from '@/services/admin-user-service';

// Buscar usuário pelo username
const { data } = await adminUserService.findUserByUsername('joao123');

if (data) {
  console.log(`Email: ${data.email}`);
  console.log(`Nome: ${data.name}`);
}
```

## Teste das Funções

Para testar as funções Edge localmente, use o script `test-edge-functions.sh`:

```bash
./test-edge-functions.sh
```

## Implantação

Para implantar as funções Edge no seu projeto Supabase, use o script `deploy-edge-functions.sh`:

```bash
./deploy-edge-functions.sh
```
