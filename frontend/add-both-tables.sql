-- Script combinado para adicionar engine_size e criar activity_logs

-- Parte 1: Adicionar a coluna engine_size à tabela vehicles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'vehicles'
    AND column_name = 'engine_size'
  ) THEN
    ALTER TABLE public.vehicles ADD COLUMN engine_size INTEGER;
    
    -- Atualizar valores existentes para garantir que engine_size corresponda a displacement
    UPDATE public.vehicles SET engine_size = displacement WHERE engine_size IS NULL AND displacement IS NOT NULL;
  END IF;
END $$;

-- Parte 2: Criar tabela de logs de atividade
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    username VARCHAR(255),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Conceder permissões para os perfis do Supabase
GRANT SELECT, INSERT ON public.activity_logs TO authenticated;
GRANT SELECT ON public.activity_logs TO anon;

-- Políticas de segurança para a tabela de logs:
-- Qualquer usuário autenticado pode inserir logs
CREATE POLICY insert_logs_policy ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Somente administradores podem ver todos os logs
CREATE POLICY select_logs_policy ON public.activity_logs FOR SELECT TO authenticated USING (
    auth.uid() IN (
        SELECT id FROM public.members WHERE is_admin = true
    )
);

-- Ativar RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Verificar se as alterações foram aplicadas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'vehicles'
AND column_name = 'engine_size';

SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'activity_logs'
) as activity_logs_table_exists;
