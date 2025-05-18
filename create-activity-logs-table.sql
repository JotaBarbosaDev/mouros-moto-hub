-- filepath: /Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/create-activity-logs-table.sql
-- Script para criar tabela de logs de atividade no Supabase

-- Verificar se a extensão uuid-ossp está ativada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar tabela de logs
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

-- Configurar RLS e permissões
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.activity_logs TO postgres;
GRANT SELECT, INSERT ON public.activity_logs TO authenticated;
GRANT SELECT, INSERT ON public.activity_logs TO anon;

-- Criar políticas de segurança
CREATE POLICY insert_logs_policy ON public.activity_logs 
FOR INSERT TO authenticated, anon 
WITH CHECK (true);

CREATE POLICY insert_anon_logs_policy ON public.activity_logs 
FOR INSERT TO anon 
WITH CHECK (true);

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
