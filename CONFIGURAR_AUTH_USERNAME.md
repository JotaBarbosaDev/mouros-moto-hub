// arquivo: CONFIGURAR_AUTH_USERNAME.md
# Configurando Login por Username ou Email no Supabase

Este documento explica como configurar o sistema para permitir login tanto por email quanto por username, e como editar username e senha de membros.

## O Problema

Atualmente o sistema não permite:
1. Fazer login usando um username (apenas email funciona)
2. Ver ou editar o username de um membro
3. Alterar a senha de um membro

## A Solução

Como a tabela `members` não tem uma coluna `username`, usaremos os metadados da tabela `auth.users` do Supabase para armazenar e gerenciar os usernames. 

### Passos Implementados

1. **Modificações na Interface**
   - Adicionado campo para visualização/edição de username no componente `MemberBasicInfoTab.tsx`
   - Adicionado campo para alteração de senha no componente `MemberBasicInfoTab.tsx`
   - Atualizado o esquema do formulário para incluir o campo password

2. **Modificações na Funcionalidade**
   - A função `handleSubmit` no `EditMemberDialog.tsx` foi atualizada para:
     - Atualizar os metadados do usuário com o novo username
     - Processar alterações de senha quando fornecidas

3. **Login com Username**
   - O hook `useAuth` já possui uma lógica que:
     - Tenta login diretamente com email
     - Se falhar, verifica se o valor é um username
     - Busca o email correspondente ao username
     - Tenta login novamente com o email encontrado

## Como Usar

1. **Para login**:
   - Digite seu email ou username no campo correspondente
   - Digite sua senha
   - Clique em "Entrar"

2. **Para editar username ou senha**:
   - Acesse a página de membros
   - Clique em editar membro
   - Na aba "Dados Básicos", você verá os campos:
     - "Nome de Usuário": Para editar o username
     - "Nova senha": Para alterar a senha (deixe em branco para não alterar)

## Observações Importantes

1. O username é armazenado nos metadados do usuário no Supabase Auth, não na tabela members.
2. Ao alterar a senha, o sistema usará a API Admin do Supabase para fazer a mudança.
3. Para que o login por username funcione, é necessário que todos os usuários tenham um username definido nos metadados.

## Migração de Usuários Existentes

Para usuários existentes que não têm username nos metadados, você pode executar a seguinte migração:

1. No Console do Supabase, vá para SQL Editor
2. Execute o seguinte script para atualizar os metadados dos usuários:

```sql
-- Para cada usuário na tabela auth.users que não tenha um username nos metadados
UPDATE auth.users
SET raw_user_meta_data = 
  raw_user_meta_data || 
  jsonb_build_object('username', 
    COALESCE(
      (raw_user_meta_data->>'username'),
      (SELECT split_part(email, '@', 1) FROM auth.users u WHERE u.id = auth.users.id)
    )
  )
WHERE raw_user_meta_data->>'username' IS NULL;
```

Este script adiciona um username (baseado na parte antes do @ do email) para todos os usuários que ainda não têm um username definido nos metadados.
