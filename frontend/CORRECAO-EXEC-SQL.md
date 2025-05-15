# Correção da Função exec_sql no Supabase

## Problema Identificado

O sistema está apresentando o seguinte erro ao inicializar:

```
Erro ao verificar tabelas: Could not find the function public.exec_sql(sql) in the schema cache
```

Este erro ocorre porque o componente `SystemInitializer.tsx` e os scripts de inicialização dependem da função SQL personalizada `exec_sql`, que precisa ser criada manualmente no banco de dados Supabase.

## Solução Implementada

Foi criado um script para adicionar automaticamente a função `exec_sql` ao seu banco de dados Supabase:

1. **Script para criar a função SQL**:
   - `create-exec-sql-function.js`: Script Node.js que cria a função SQL
   - `create-exec-sql.sh`: Script shell para facilitar a execução

## Como Resolver o Problema

### Opção 1: Usando o Script Automático

1. Abra um terminal na pasta raiz do frontend
2. Execute o script de criação da função:

```bash
cd /Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/frontend
./create-exec-sql.sh
```

3. Verifique se a criação foi bem-sucedida
4. Recarregue a aplicação

### Opção 2: Criação Manual via Painel do Supabase

Se o script automático falhar, você pode criar a função manualmente:

1. Acesse o painel do Supabase (https://app.supabase.com)
2. Vá para o projeto e abra o "SQL Editor"
3. Crie uma nova consulta e cole o seguinte código SQL:

```sql
CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS SETOF json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY EXECUTE sql;
END;
$$;

-- Configurar permissões
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO anon, authenticated;
```

4. Execute a consulta
5. Recarregue a aplicação

## Explicação Técnica

A função `exec_sql` permite que código JavaScript execute comandos SQL dinâmicos no banco de dados. Esta função é necessária porque o Supabase não permite por padrão a execução de SQL dinâmico via API, por motivos de segurança.

### O que a Função Faz

- Recebe um parâmetro `sql` contendo uma consulta SQL
- Executa o SQL dinamicamente e retorna o resultado como JSON
- Usa `SECURITY DEFINER` para executar com permissões elevadas do criador

### Considerações de Segurança

Este método é seguro apenas porque:

1. O SQL executado é gerado pelo próprio sistema (não por entrada do usuário)
2. O acesso ao backend é restrito por autenticação
3. O código que chama a função está sob seu controle

**Atenção**: Nunca permita que entrada do usuário seja passada diretamente para esta função sem sanitização adequada.
