# Correção do Erro 401 (Unauthorized) na Tabela dues_payments

## Problema Identificado

Ao tentar acessar a tabela `dues_payments` diretamente do frontend via Supabase, o sistema retornava um erro 401 (Unauthorized). Isso acontecia porque as políticas de RLS (Row Level Security) da tabela estavam configuradas para permitir apenas que administradores inserissem novos registros, enquanto o frontend precisava que qualquer usuário autenticado pudesse inserir pagamentos.

## Solução

A solução envolve criar uma nova política RLS que permite que qualquer usuário autenticado possa inserir registros na tabela `dues_payments`. As políticas para atualização e exclusão continuam restritas apenas a administradores.

## Como Aplicar a Correção

### Método 1: Via SQL Editor do Supabase (Recomendado)

1. Acesse o painel administrativo do Supabase do seu projeto
2. Navegue até o SQL Editor
3. Copie o conteúdo do arquivo `fix-dues-payments-sql.sql`
4. Cole no editor SQL e execute

### Método 2: Via scripts de automação (Mais complexo)

Se preferir usar os scripts de automação, você precisará:

1. Configurar corretamente as variáveis de ambiente no arquivo `.env`:
   ```
   SUPABASE_URL=https://seu-projeto.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=sua-chave-de-serviço
   ```

2. Executar o script `fix-dues-payments-rls.sh`

## Verificação da Correção

Para verificar se a correção foi aplicada com sucesso:

1. Acesse o painel do Supabase
2. Vá até a seção "Authentication" > "Policies"
3. Procure pela tabela `dues_payments`
4. Confirme que existe uma política chamada "Frontend pode inserir pagamentos" com a definição: `auth.role() = 'authenticated'`

## Verificação no Frontend

Após aplicar as correções, você precisará:

1. Reiniciar o servidor frontend
2. Fazer login na aplicação (para obter uma sessão autenticada)
3. Tentar inserir um novo pagamento
4. Verificar se não ocorre mais o erro 401

## Políticas RLS Configuradas

As seguintes políticas foram configuradas para a tabela `dues_payments`:

1. **Pagamentos visíveis para usuários autenticados**: Permite que qualquer usuário autenticado visualize os registros
2. **Frontend pode inserir pagamentos**: Permite que qualquer usuário autenticado insira novos pagamentos
3. **Admins podem atualizar pagamentos**: Apenas administradores podem atualizar registros
4. **Admins podem excluir pagamentos**: Apenas administradores podem excluir registros

## Considerações de Segurança

Esta configuração permite que qualquer usuário autenticado insira novos pagamentos. Se este não for o comportamento desejado, você pode precisar ajustar a política para verificar se o usuário tem uma função específica ou outras condições antes de permitir a inserção.

## Próximos Passos

Após aplicar esta correção e verificar que o erro 401 foi resolvido, você deve:

1. Testar o fluxo completo de pagamentos no frontend
2. Verificar se os registros estão sendo salvos corretamente no banco de dados
3. Verificar se as permissões de atualização e exclusão estão funcionando conforme esperado (apenas para administradores)
