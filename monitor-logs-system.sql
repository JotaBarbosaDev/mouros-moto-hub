-- Script de Monitoramento do Sistema de Logs
-- Execute este script periodicamente para verificar a saúde do sistema de logs no Supabase
-- Data de criação: 18/05/2025

-- 1. Verificar se a tabela activity_logs existe
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM pg_tables
            WHERE schemaname = 'public' AND tablename = 'activity_logs'
        ) 
        THEN 'TABELA OK: activity_logs existe'
        ELSE 'FALHA: Tabela activity_logs não existe!'
    END AS verificacao_tabela;

-- 2. Verificar as permissões da tabela
SELECT 
    grantee, 
    privilege_type 
FROM 
    information_schema.role_table_grants 
WHERE 
    table_name = 'activity_logs' AND 
    table_schema = 'public'
ORDER BY 
    grantee, 
    privilege_type;

-- 3. Verificar as políticas de segurança (RLS) usando a view pg_policies (compatível com todas as versões)
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM
    pg_policies
WHERE
    tablename = 'activity_logs';

-- 4. Verificar índices da tabela
SELECT 
    indexname,
    indexdef
FROM 
    pg_indexes
WHERE 
    tablename = 'activity_logs' AND
    schemaname = 'public'
ORDER BY 
    indexname;

-- 5. Estatísticas de uso do sistema de logs
SELECT 
    COUNT(*) AS total_logs,
    MIN(created_at) AS primeiro_log,
    MAX(created_at) AS ultimo_log,
    COUNT(DISTINCT user_id) AS usuarios_distintos,
    COUNT(DISTINCT entity_type) AS tipos_entidade_distintos,
    COUNT(DISTINCT action) AS acoes_distintas
FROM public.activity_logs;

-- 6. Distribuição por tipo de ação (10 mais comuns)
SELECT 
    action, 
    COUNT(*) AS quantidade,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM public.activity_logs), 2) AS percentual
FROM public.activity_logs
GROUP BY action
ORDER BY quantidade DESC
LIMIT 10;

-- 7. Distribuição por tipo de entidade (10 mais comuns)
SELECT 
    entity_type, 
    COUNT(*) AS quantidade,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM public.activity_logs), 2) AS percentual
FROM public.activity_logs
GROUP BY entity_type
ORDER BY quantidade DESC
LIMIT 10;

-- 8. Verificar logs com possível relevância para segurança
SELECT 
    id,
    created_at,
    username,
    action,
    entity_type,
    details
FROM 
    public.activity_logs
WHERE
    action IN ('DELETE', 'ADMIN', 'SECURITY', 'ERROR', 'FIX')
    OR (details::text LIKE '%error%' OR details::text LIKE '%fail%')
ORDER BY
    created_at DESC
LIMIT 20;

-- 9. Verificar crescimento diário de logs (últimos 7 dias ou todos se menos)
SELECT 
    DATE(created_at) AS data,
    COUNT(*) AS quantidade_logs
FROM 
    public.activity_logs
GROUP BY 
    DATE(created_at)
ORDER BY 
    data DESC
LIMIT 7;

-- 10. Inserir um registro de monitoramento para rastrear quando essa verificação foi executada
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
    'Monitor Automático',
    'MONITOR',
    'SYSTEM',
    'health-check',
    jsonb_build_object(
        'message', 'Verificação periódica da saúde do sistema de logs',
        'timestamp', now()::text,
        'total_logs', (SELECT COUNT(*) FROM public.activity_logs),
        'status', 'OK'
    )
)
RETURNING id, created_at;
