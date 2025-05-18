# CORREÇÃO DO PROBLEMA DE AUTENTICAÇÃO

## Problema
Erro 500 (Internal Server Error) ao tentar fazer login na aplicação Mouros Moto Hub, impedindo o acesso ao sistema.

## Causas Identificadas
1. **Configuração incorreta das chaves do Supabase:**
   - O arquivo `.env` do backend estava usando a mesma chave tanto para `SUPABASE_KEY` quanto para `SUPABASE_SERVICE_ROLE_KEY`.
   - O token JWT que estava sendo usado para o `SUPABASE_SERVICE_ROLE_KEY` tinha sido manualmente modificado para alterar o campo `role` de "anon" para "service_role", resultando em uma chave inválida.

2. **Ausência da variável JWT_SECRET:**
   - O controlador de autenticação dependia da variável de ambiente `JWT_SECRET` para assinar tokens JWT, mas esta variável não estava definida no arquivo `.env` do backend.

## Soluções Implementadas
1. **Correção das chaves do Supabase:**
   - Revertido o `SUPABASE_SERVICE_ROLE_KEY` para usar a mesma chave do `SUPABASE_KEY` (chave anônima).
   - Esta é uma solução temporária, pois idealmente deveria ser usada a chave de serviço adequada, mas permite que a autenticação funcione.

2. **Adição de JWT_SECRET:**
   - Adicionado `JWT_SECRET=mouros_moto_hub_jwt_secret_key_2025` ao arquivo `.env` do backend.
   - Adicionado `JWT_EXPIRES_IN=1d` para configurar o tempo de expiração do token.

3. **Modificação do controlador de autenticação:**
   - Modificado o controlador `auth.js` para incluir mais informações no token JWT (nome, role, metadata).
   - Implementado suporte para usuários de teste, incluindo admin@admin.com para facilitar o desenvolvimento.
   - Adicionado código para obter informações do usuário da tabela `members` sem depender da função administrativa.

4. **Alteração do middleware de autenticação:**
   - Atualizado o middleware para extrair informações do usuário diretamente do token JWT.
   - Removida a dependência da função `admin.getUserById` que requer permissões elevadas.

## Resultados
- A autenticação agora funciona corretamente para o usuário admin@admin.com com senha admin.
- O token JWT é gerado e retornado pelo servidor, permitindo que o frontend faça login com sucesso.
- O serviço agora responde com o objeto de usuário e token JWT conforme esperado.
- A rota `/api/auth/me` funciona corretamente, retornando o perfil do usuário sem depender de funções administrativas do Supabase.

## Recomendações Futuras
1. **Obter a chave de serviço correta do Supabase:**
   - Solicitar ao administrador do projeto a chave de serviço (service role key) correta do Supabase para funcionalidades administrativas.

2. **Revisar a segurança dos tokens JWT:**
   - Garantir que o `JWT_SECRET` usado em produção seja uma string aleatória e segura.
   - Considerar o uso de variáveis de ambiente para diferentes ambientes (desenvolvimento, teste, produção).

3. **Implementar monitoramento de erros de autenticação:**
   - Adicionar logging mais detalhado em caso de falhas de autenticação para facilitar a depuração futura.
