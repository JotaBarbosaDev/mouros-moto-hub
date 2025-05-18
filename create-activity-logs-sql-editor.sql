-- Código SQL para copiar e colar no SQL Editor do Supabase
-- Este script irá criar a tabela activity_logs com todas as configurações necessárias

-- 1. Verificar e criar a extensão uuid-ossp (necessária para gerar UUIDs)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Criar a tabela de logs de atividade
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT,         -- Usando TEXT para maior flexibilidade
    username TEXT,        -- Nome de usuário para facilitar leitura dos logs
    action VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE, VIEW
    entity_type VARCHAR(50) NOT NULL, -- MEMBER, VEHICLE, EVENT, etc.
    entity_id TEXT,       -- ID da entidade afetada
    details JSONB,        -- Detalhes adicionais em formato JSON  
    ip_address VARCHAR(45), -- Suporta IPv4 e IPv6
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Adicionar comentários explicativos
COMMENT ON TABLE public.activity_logs IS 'Registros de todas as atividades realizadas pelos usuários no sistema';
COMMENT ON COLUMN public.activity_logs.user_id IS 'ID do usuário que realizou a ação';
COMMENT ON COLUMN public.activity_logs.username IS 'Nome do usuário que realizou a ação';
COMMENT ON COLUMN public.activity_logs.action IS 'Ação realizada (CREATE, UPDATE, DELETE, VIEW)';
COMMENT ON COLUMN public.activity_logs.entity_type IS 'Tipo de entidade afetada (MEMBER, VEHICLE, EVENT)';
COMMENT ON COLUMN public.activity_logs.entity_id IS 'ID da entidade afetada';
COMMENT ON COLUMN public.activity_logs.details IS 'Detalhes da ação em formato JSON';
COMMENT ON COLUMN public.activity_logs.ip_address IS 'Endereço IP de onde a ação foi realizada';

-- 4. Configurar RLS (Row Level Security) e permissões
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Permissões para os diferentes perfis
GRANT ALL ON public.activity_logs TO postgres;
GRANT SELECT, INSERT ON public.activity_logs TO authenticated;
GRANT SELECT, INSERT ON public.activity_logs TO anon;

-- 5. Criar políticas de segurança
-- Permitir que usuários autenticados e anônimos possam inserir logs
CREATE POLICY insert_logs_policy ON public.activity_logs 
FOR INSERT TO authenticated, anon 
WITH CHECK (true);

-- Política específica para usuários anônimos
CREATE POLICY insert_anon_logs_policy ON public.activity_logs 
FOR INSERT TO anon 
WITH CHECK (true);

-- Permitir que usuários autenticados e anônimos possam ler logs
CREATE POLICY select_logs_policy ON public.activity_logs 
FOR SELECT TO authenticated, anon 
USING (true);

-- 6. Criar índices para melhorar a performance
CREATE INDEX IF NOT EXISTS activity_logs_user_id_idx ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS activity_logs_entity_type_idx ON public.activity_logs(entity_type);
CREATE INDEX IF NOT EXISTS activity_logs_entity_id_idx ON public.activity_logs(entity_id);
CREATE INDEX IF NOT EXISTS activity_logs_action_idx ON public.activity_logs(action);
CREATE INDEX IF NOT EXISTS activity_logs_created_at_idx ON public.activity_logs(created_at);

-- 7. Inserir um registro de teste para verificar se está funcionando
INSERT INTO public.activity_logs (
    user_id, 
    username, 
    action, 
    entity_type, 
    entity_id,
    details
)
VALUES (
    'system', 
    'Sistema SQL', 
    'CREATE', 
    'SYSTEM', 
    'setup',
    '{"message": "Tabela de logs criada com sucesso via SQL Editor", "timestamp": "' || now() || '"}'
);

-- 8. Buscar os logs para confirmar que tudo está funcionando
SELECT * FROM public.activity_logs ORDER BY created_at DESC LIMIT 5;
