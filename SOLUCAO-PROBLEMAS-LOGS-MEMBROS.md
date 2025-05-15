# Instruções para Resolver Problemas do Sistema de Logs e Cadastro de Membros

## Problema 1: Tabela de Logs não Criada

A tabela `activity_logs` precisa ser criada no banco de dados Supabase para que os logs de atividades funcionem corretamente.

### Solução:

1. Certifique-se de ter as variáveis de ambiente do Supabase configuradas:
   ```bash
   export SUPABASE_URL=sua_url_do_supabase
   export SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico
   ```

2. Execute o script para criar a tabela:
   ```bash
   cd frontend
   ./create-activity-logs-direct.sh
   ```

3. Alternativamente, você pode criar a tabela manualmente pelo painel do Supabase:
   - Acesse o painel do Supabase
   - Vá para SQL Editor
   - Cole o conteúdo do arquivo `frontend/create-activity-logs-table.sql`
   - Execute o script

## Problema 2: Membros Não Estão Sendo Adicionados

Existem discrepâncias entre o formato de dados no frontend e backend.

### Solução:

1. As correções necessárias já foram aplicadas, incluindo:
   - Mapeamento correto entre os formatos de dados frontend/backend
   - Melhoria no tratamento de erros
   - Logs adicionais para diagnóstico

2. Reinicie o servidor backend:
   ```bash
   cd backend
   npm run dev
   ```

## Problema 3: Histórico de Atividades Não Aparece

O componente de histórico pode não estar atualizando quando os filtros mudam.

### Solução:

1. As correções necessárias foram aplicadas, incluindo:
   - Adição de uma key dinâmica para forçar remontagem do componente
   - Melhoria na detecção da tabela de logs

2. Reinicie o frontend:
   ```bash
   cd frontend
   npm run dev
   ```

## Verificação

Para verificar se os problemas foram resolvidos:

1. Tente adicionar um novo membro
2. Verifique os logs no console do servidor para identificar possíveis erros
3. Acesse a página de histórico de atividades para verificar se os logs estão sendo exibidos

Se os problemas persistirem, verifique:
- A conexão com o Supabase
- Se a tabela `activity_logs` foi criada corretamente
- Se as permissões estão configuradas conforme especificado no script SQL
- Se o token de autenticação está sendo enviado corretamente nas requisições
