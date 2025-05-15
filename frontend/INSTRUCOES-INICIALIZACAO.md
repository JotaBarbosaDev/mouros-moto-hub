# Instruções para Inicialização do Sistema

Este documento contém as instruções para inicializar corretamente o sistema Mouros Moto Hub em seu ambiente Supabase.

## Problema

O aplicativo estava apresentando um erro durante a inicialização:

```
Could not find the function public.exec_sql(sql) in the schema cache
```

Este erro ocorre porque o componente `SystemInitializer` original tentava utilizar uma função SQL personalizada chamada `exec_sql` que não existe no banco de dados Supabase.

## Solução Implementada

1. **Implementação do `SystemInitializerBasic`**:
   - Um componente alternativo foi criado que não depende da função `exec_sql`.
   - O componente usa chamadas padrão da API Supabase para verificar e inicializar o sistema.

2. **Script SQL para criar as tabelas**:
   - Foi criado um arquivo `create-all-tables.sql` com todas as instruções SQL necessárias para criar as tabelas do sistema.

## Como Completar a Inicialização

Para finalizar a configuração do sistema, siga estes passos:

### 1. Execute o script SQL no painel do Supabase

1. Acesse o painel do Supabase do seu projeto: `https://app.supabase.io/project/<seu-projeto>/sql`
2. Abra o editor SQL
3. Copie todo o conteúdo do arquivo `/Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/frontend/create-all-tables.sql`
4. Cole no editor SQL do Supabase e execute

O script irá:
- Criar a extensão `uuid-ossp` para geração de UUIDs
- Criar as tabelas necessárias para o sistema:
  - `club_settings`
  - `settings`
  - `member_fee_settings`
  - `fee_payments`
- Inserir dados iniciais na tabela `settings`

### 2. Reinicie a aplicação

Após executar o script SQL, reinicie a aplicação frontend para que as mudanças sejam aplicadas.

## Verificação

Quando a aplicação iniciar corretamente, o componente `SystemInitializerBasic` detectará as tabelas e permitirá que o sistema funcione normalmente. Caso ocorra algum problema, uma mensagem de erro será exibida com instruções adicionais.

## Solução de Problemas

Se encontrar problemas durante a inicialização:

1. Verifique se o script SQL foi executado com sucesso no painel do Supabase
2. Certifique-se de que a conexão com o Supabase está configurada corretamente nos arquivos de ambiente
3. Confira os erros no console do navegador para detalhes adicionais

---

Observação: Esta é uma solução alternativa à criação da função `exec_sql` no Supabase, que também seria possível através do painel SQL, mas optamos por utilizar apenas funcionalidades padrão da API Supabase para maior compatibilidade e manutenibilidade.
