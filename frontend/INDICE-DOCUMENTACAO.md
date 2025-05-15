# Índice de Documentação Técnica

Este é um índice dos documentos técnicos disponíveis para o Mouros Moto Hub, ajudando a navegar pela documentação do projeto.

## Documentação de Inicialização e Configuração

* [TABELAS-SUPABASE.md](TABELAS-SUPABASE.md) - Como inicializar e manter as tabelas do sistema no Supabase
* [CORRECAO-EXEC-SQL.md](CORRECAO-EXEC-SQL.md) - Como resolver o problema da função exec_sql no Supabase
* [README-CORRECOES-TABELAS.md](README-CORRECOES-TABELAS.md) - Detalhes sobre as correções feitas nas tabelas

## Documentação de Reorganização de Código

* [REORGANIZACAO_IMPLEMENTADA.md](REORGANIZACAO_IMPLEMENTADA.md) - Visão geral das reorganizações implementadas
* [REORGANIZACAO-TABELAS.md](REORGANIZACAO-TABELAS.md) - Explicação da estrutura de arquivos após reorganização
* [RESUMO-REORGANIZACAO.md](RESUMO-REORGANIZACAO.md) - Resumo das mudanças feitas na reorganização

## Scripts Importantes

| Script | Propósito |
|--------|-----------|
| `init-tables.sh` | Inicializar as tabelas no Supabase |
| `create-exec-sql.sh` | Criar a função SQL necessária para inicialização |

## Workflow de Inicialização Recomendado

Para inicializar corretamente o sistema Supabase pela primeira vez:

1. Configure o arquivo `.env.local` com suas credenciais do Supabase
2. Execute `./create-exec-sql.sh` para criar a função personalizada
3. Execute `./init-tables.sh` para criar e inicializar as tabelas
4. Inicie a aplicação normalmente com `npm run dev`

## Solução de Problemas Comuns

| Problema | Solução |
|----------|---------|
| Erro "function exec_sql not found" | Execute `./create-exec-sql.sh` |
| Tabelas não encontradas | Execute `./init-tables.sh` |
| Erros de permissão | Verifique as credenciais em `.env.local` |
