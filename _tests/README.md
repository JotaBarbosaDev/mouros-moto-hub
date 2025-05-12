# Scripts de Teste

Esta pasta contém scripts de teste e utilitários que foram usados durante o desenvolvimento para testar diferentes aspectos da aplicação.

## Scripts Disponíveis

- `consulta-simples.js` - Script para consultas simples no banco de dados
- `count-members.js` - Conta o número de membros no banco de dados
- `create-test-member.js` - Cria um membro de teste no banco de dados
- `list-tables.js` - Lista todas as tabelas disponíveis no Supabase
- `test-api.js` - Testa a API REST
- `testar-retorno-membros.js` - Testa o retorno da API de membros
- `teste-api-membros.js` - Teste específico para a API de membros
- `teste-comum.js` - Utilitários comuns para testes
- `teste-esm.js` - Teste usando módulos ES
- `teste-retorno-membros-cjs.js` - Versão CommonJS do teste de retorno de membros
- `teste-retorno-membros.js` - Teste do retorno da API de membros usando ESM
- `teste-service.js` - Testa serviços internos da aplicação
- `teste-simple.js` - Teste simplificado para debugging rápido

## Como Executar

A maioria dos scripts pode ser executada diretamente com Node.js:

```bash
node _tests/nome-do-script.js
```

Alguns scripts podem exigir argumentos ou configurações de ambiente específicas. Consulte o código de cada script para mais detalhes.

## Observação

Estes scripts são ferramentas de desenvolvimento e não são necessários para a execução normal da aplicação. Eles são mantidos aqui como referência e para facilitar o debugging quando necessário.
