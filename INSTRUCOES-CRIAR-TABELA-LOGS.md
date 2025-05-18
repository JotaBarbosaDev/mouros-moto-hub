# Instruções para Criar Tabela de Logs de Atividade no Supabase

O sistema de logs de atividade requer uma tabela `activity_logs` no banco de dados Supabase. Este documento descreve múltiplas maneiras de criar esta tabela para garantir o funcionamento completo do sistema de logs.

## Opção 1: Usando o Script Automatizado (Recomendado)

1. Certifique-se de ter o utilitário `jq` instalado:
   ```bash
   # No macOS
   brew install jq
   
   # No Linux
   sudo apt install jq
   ```

2. Execute o script de criação da tabela:
   ```bash
   cd /Users/joaobarbosa/Desktop/projetos/mouros-moto-hub
   bash create-activity-logs.sh
   ```

3. O script irá verificar se a tabela já existe, criar a tabela com todas as permissões necessárias e inserir um log de teste.

## Opção 2: Através da Página de Configuração de Logs (Interface)

1. Inicie o sistema frontend e backend:
   ```bash
   # Terminal 1:
   cd /Users/joaobarbosa/Desktop/projetos/mouros-moto-hub
   ./start-backend.sh
   
   # Terminal 2:
   cd /Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/frontend
   npm run dev
   ```

2. Abra o navegador e acesse a página de configuração de logs:
   http://localhost:5173/logs-setup

3. Na página de configuração de logs, clique no botão "Verificar configuração" para verificar se a tabela de logs já existe.

4. Se a tabela não existir, clique no botão "Criar tabela de logs" para criá-la automaticamente.

5. Você verá uma mensagem de confirmação quando a tabela for criada com sucesso.

## Opção 2: Usando o SQL Editor do Supabase

1. Faça login no painel de administração do Supabase:
   https://app.supabase.io/

2. Selecione o projeto correspondente ao Mouros Moto Hub.

3. No menu lateral, clique em "SQL Editor".

4. Crie um novo script SQL e cole o seguinte conteúdo:

```sql
-- Verificar se a extensão uuid-ossp está ativada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Script para criar tabela de logs de atividade no Supabase
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT,
    username TEXT,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id TEXT,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Adicionando comentários na tabela
COMMENT ON TABLE public.activity_logs IS 'Registros de todas as atividades realizadas pelos usuários no sistema';
COMMENT ON COLUMN public.activity_logs.user_id IS 'ID do usuário que realizou a ação';
COMMENT ON COLUMN public.activity_logs.username IS 'Nome do usuário que realizou a ação';
COMMENT ON COLUMN public.activity_logs.action IS 'Ação realizada (CREATE, UPDATE, DELETE, VIEW)';
COMMENT ON COLUMN public.activity_logs.entity_type IS 'Tipo de entidade afetada (MEMBER, VEHICLE, EVENT)';
COMMENT ON COLUMN public.activity_logs.entity_id IS 'ID da entidade afetada';
COMMENT ON COLUMN public.activity_logs.details IS 'Detalhes da ação em formato JSON';
COMMENT ON COLUMN public.activity_logs.ip_address IS 'Endereço IP de onde a ação foi realizada';

-- Garantir que RLS esteja ativado
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Conceder permissões para os perfis do Supabase
GRANT ALL ON public.activity_logs TO postgres;
GRANT SELECT, INSERT ON public.activity_logs TO authenticated;
GRANT SELECT, INSERT ON public.activity_logs TO anon;

-- Políticas de segurança para a tabela de logs
-- Qualquer usuário (autenticado ou anônimo) pode inserir logs
CREATE POLICY insert_logs_policy ON public.activity_logs 
FOR INSERT TO authenticated, anon 
WITH CHECK (true);

CREATE POLICY insert_anon_logs_policy ON public.activity_logs 
FOR INSERT TO anon 
WITH CHECK (true);

-- Qualquer usuário pode ler logs
CREATE POLICY select_logs_policy ON public.activity_logs 
FOR SELECT TO authenticated, anon 
USING (true);

-- Criar índices para melhorar a performance das consultas mais comuns
CREATE INDEX IF NOT EXISTS activity_logs_user_id_idx ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS activity_logs_entity_type_idx ON public.activity_logs(entity_type);
CREATE INDEX IF NOT EXISTS activity_logs_entity_id_idx ON public.activity_logs(entity_id);
CREATE INDEX IF NOT EXISTS activity_logs_action_idx ON public.activity_logs(action);
CREATE INDEX IF NOT EXISTS activity_logs_created_at_idx ON public.activity_logs(created_at);

-- Inserir um registro de teste para verificar
INSERT INTO public.activity_logs (user_id, username, action, entity_type, details)
VALUES ('system', 'Sistema SQL', 'CREATE', 'SYSTEM', '{"message": "Tabela de logs criada com sucesso via SQL Editor"}');

-- Verificar se o registro foi inserido
SELECT * FROM public.activity_logs ORDER BY created_at DESC LIMIT 1;
```

5. Clique em "Executar" para criar a tabela e suas configurações.

6. Verifique se a tabela foi criada com sucesso na seção "Table Editor" do Supabase.

## Opção 3: Usando o Script JavaScript (Recomendado para Verificação)

Esta opção é a mais completa para verificar se o sistema de logs está funcionando corretamente:

1. Execute o script de verificação JavaScript:
   ```bash
   cd /Users/joaobarbosa/Desktop/projetos/mouros-moto-hub
   ./check-logs-js.sh
   ```

2. O script irá:
   - Verificar se a tabela `activity_logs` existe
   - Inserir um registro de teste
   - Verificar se é possível recuperar o registro
   - Listar os registros recentes

3. Se tudo estiver funcionando corretamente, você verá mensagens de sucesso em verde.

## Verificação Manual

Para verificar manualmente se a tabela foi criada corretamente:

1. Acesse a página de logs no sistema:
   http://localhost:5173/historico

2. Tente realizar alguma operação que registre logs, como:
   - Criar um novo membro
   - Editar um membro existente
   - Excluir um membro

3. Verifique se os logs aparecem na página de histórico.

Se os logs estiverem aparecendo corretamente, isso indica que a tabela foi criada e configurada com sucesso.

## Resumo da Estrutura do Sistema de Logs

O sistema de logs usa os seguintes componentes:

1. **Tabela no Supabase**: `activity_logs` armazena todos os registros de atividade
2. **Service de Logs no Frontend**: `activity-log-service.ts` fornece métodos para registrar e consultar logs
3. **Políticas RLS**: Garantem que os logs possam ser inseridos e lidos apropriadamente
