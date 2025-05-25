-- ============================================================================
-- SISTEMA DE APROVAÇÃO FINANCEIRA - MIGRAÇÃO SIMPLIFICADA
-- Data: 2025-05-24
-- ============================================================================

-- Criar os tipos ENUM necessários (usando DROP IF EXISTS para evitar conflitos)
DROP TYPE IF EXISTS financial_approval_status CASCADE;
CREATE TYPE financial_approval_status AS ENUM (
    'draft',
    'awaiting_approval',
    'in_revision', 
    'awaiting_reevaluation',
    'escalated',
    'approved',
    'rejected',
    'cancelled'
);

DROP TYPE IF EXISTS approval_comment_type CASCADE;
CREATE TYPE approval_comment_type AS ENUM (
    'request_changes',
    'counteroffer', 
    'justification',
    'approval_note',
    'escalation_note'
);

DROP TYPE IF EXISTS user_role_type CASCADE;
CREATE TYPE user_role_type AS ENUM (
    'creator',
    'treasurer', 
    'president',
    'admin'
);

-- ============================================================================
-- TABELA: financial_approvals
-- ============================================================================
DROP TABLE IF EXISTS public.financial_approvals CASCADE;
CREATE TABLE public.financial_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identificação do item
    title TEXT NOT NULL,
    description TEXT,
    item_type TEXT NOT NULL,
    item_id TEXT,
    
    -- Valores financeiros
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    currency TEXT DEFAULT 'EUR',
    
    -- Fluxo de aprovação
    status financial_approval_status NOT NULL DEFAULT 'draft',
    reference_number TEXT UNIQUE,
    
    -- Usuários envolvidos
    creator_id UUID NOT NULL,
    assigned_treasurer_id UUID,
    final_approver_id UUID,
    
    -- Configurações
    requires_president_approval BOOLEAN DEFAULT FALSE,
    is_escalated BOOLEAN DEFAULT FALSE,
    escalation_reason TEXT,
    priority_level INTEGER DEFAULT 1 CHECK (priority_level BETWEEN 1 AND 5),
    
    -- Datas importantes
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submitted_at TIMESTAMP WITH TIME ZONE,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    escalation_date TIMESTAMP WITH TIME ZONE,
    
    -- Auditoria
    created_by UUID,
    updated_by UUID,
    
    -- Dados adicionais
    item_details JSONB DEFAULT '{}'::JSONB
);

-- ============================================================================
-- TABELA: approval_comments
-- ============================================================================
DROP TABLE IF EXISTS public.approval_comments CASCADE;
CREATE TABLE public.approval_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    approval_id UUID NOT NULL,
    author_id UUID NOT NULL,
    
    -- Conteúdo do comentário
    message TEXT NOT NULL,
    comment_type approval_comment_type NOT NULL DEFAULT 'request_changes',
    
    -- Configurações
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Dados adicionais
    metadata JSONB DEFAULT '{}'::JSONB,
    proposed_amount DECIMAL(10,2),
    proposed_changes JSONB DEFAULT '{}'::JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ÍNDICES
-- ============================================================================

-- Índices para financial_approvals
CREATE INDEX IF NOT EXISTS idx_financial_approvals_status ON public.financial_approvals(status);
CREATE INDEX IF NOT EXISTS idx_financial_approvals_creator_id ON public.financial_approvals(creator_id);
CREATE INDEX IF NOT EXISTS idx_financial_approvals_treasurer_id ON public.financial_approvals(assigned_treasurer_id);
CREATE INDEX IF NOT EXISTS idx_financial_approvals_item_type ON public.financial_approvals(item_type);
CREATE INDEX IF NOT EXISTS idx_financial_approvals_created_at ON public.financial_approvals(created_at);
CREATE INDEX IF NOT EXISTS idx_financial_approvals_due_date ON public.financial_approvals(due_date);

-- Índices para approval_comments
CREATE INDEX IF NOT EXISTS idx_approval_comments_approval_id ON public.approval_comments(approval_id);
CREATE INDEX IF NOT EXISTS idx_approval_comments_author_id ON public.approval_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_approval_comments_created_at ON public.approval_comments(created_at);
CREATE INDEX IF NOT EXISTS idx_approval_comments_type ON public.approval_comments(comment_type);

-- ============================================================================
-- CHAVES ESTRANGEIRAS
-- ============================================================================

-- Para financial_approvals (comentadas porque podem não existir as tabelas referenciadas)
-- ALTER TABLE public.financial_approvals 
--     ADD CONSTRAINT fk_financial_approvals_creator_id 
--     FOREIGN KEY (creator_id) REFERENCES auth.users(id) ON DELETE RESTRICT;

-- ALTER TABLE public.financial_approvals 
--     ADD CONSTRAINT fk_financial_approvals_assigned_treasurer_id 
--     FOREIGN KEY (assigned_treasurer_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- ALTER TABLE public.financial_approvals 
--     ADD CONSTRAINT fk_financial_approvals_final_approver_id 
--     FOREIGN KEY (final_approver_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Para approval_comments
ALTER TABLE public.approval_comments 
    ADD CONSTRAINT fk_approval_comments_approval_id 
    FOREIGN KEY (approval_id) REFERENCES public.financial_approvals(id) ON DELETE CASCADE;

-- ALTER TABLE public.approval_comments 
--     ADD CONSTRAINT fk_approval_comments_author_id 
--     FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE RESTRICT;

-- ============================================================================
-- TRIGGERS PARA UPDATED_AT
-- ============================================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS update_financial_approvals_updated_at ON public.financial_approvals;
CREATE TRIGGER update_financial_approvals_updated_at
    BEFORE UPDATE ON public.financial_approvals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_approval_comments_updated_at ON public.approval_comments;
CREATE TRIGGER update_approval_comments_updated_at
    BEFORE UPDATE ON public.approval_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TRIGGER PARA REFERENCE_NUMBER
-- ============================================================================

-- Função para gerar reference_number automaticamente
CREATE OR REPLACE FUNCTION generate_reference_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.reference_number IS NULL THEN
        NEW.reference_number := 'FA-' || TO_CHAR(NEW.created_at, 'YYYY') || '-' || 
                               LPAD(EXTRACT(DOY FROM NEW.created_at)::TEXT, 3, '0') || '-' ||
                               UPPER(SUBSTRING(NEW.id::TEXT, 1, 8));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para gerar reference_number
DROP TRIGGER IF EXISTS generate_reference_number_trigger ON public.financial_approvals;
CREATE TRIGGER generate_reference_number_trigger
    BEFORE INSERT ON public.financial_approvals
    FOR EACH ROW
    EXECUTE FUNCTION generate_reference_number();

-- ============================================================================
-- RLS (ROW LEVEL SECURITY)
-- ============================================================================

-- Habilitar RLS
ALTER TABLE public.financial_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_comments ENABLE ROW LEVEL SECURITY;

-- Políticas para financial_approvals
DROP POLICY IF EXISTS "Users can view their own approvals" ON public.financial_approvals;
CREATE POLICY "Users can view their own approvals" ON public.financial_approvals
    FOR SELECT USING (creator_id = auth.uid() OR assigned_treasurer_id = auth.uid() OR final_approver_id = auth.uid());

DROP POLICY IF EXISTS "Users can create approvals" ON public.financial_approvals;
CREATE POLICY "Users can create approvals" ON public.financial_approvals
    FOR INSERT WITH CHECK (creator_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own approvals" ON public.financial_approvals;
CREATE POLICY "Users can update their own approvals" ON public.financial_approvals
    FOR UPDATE USING (creator_id = auth.uid() OR assigned_treasurer_id = auth.uid() OR final_approver_id = auth.uid());

-- Políticas para approval_comments
DROP POLICY IF EXISTS "Users can view comments on their approvals" ON public.approval_comments;
CREATE POLICY "Users can view comments on their approvals" ON public.approval_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.financial_approvals fa 
            WHERE fa.id = approval_id 
            AND (fa.creator_id = auth.uid() OR fa.assigned_treasurer_id = auth.uid() OR fa.final_approver_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can create comments" ON public.approval_comments;
CREATE POLICY "Users can create comments" ON public.approval_comments
    FOR INSERT WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own comments" ON public.approval_comments;
CREATE POLICY "Users can update their own comments" ON public.approval_comments
    FOR UPDATE USING (author_id = auth.uid());

-- ============================================================================
-- FUNÇÕES AUXILIARES
-- ============================================================================

-- Função para obter estatísticas do dashboard
CREATE OR REPLACE FUNCTION get_treasurer_dashboard_stats(treasurer_id UUID DEFAULT auth.uid())
RETURNS TABLE (
    pending_count BIGINT,
    approved_today BIGINT,
    approved_this_week BIGINT,
    total_pending_value DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM public.financial_approvals 
         WHERE status IN ('awaiting_approval', 'awaiting_reevaluation') 
         AND (assigned_treasurer_id = treasurer_id OR assigned_treasurer_id IS NULL))::BIGINT,
        
        (SELECT COUNT(*) FROM public.financial_approvals 
         WHERE status = 'approved' 
         AND DATE(approved_at) = CURRENT_DATE 
         AND final_approver_id = treasurer_id)::BIGINT,
        
        (SELECT COUNT(*) FROM public.financial_approvals 
         WHERE status = 'approved' 
         AND approved_at >= CURRENT_DATE - INTERVAL '7 days' 
         AND final_approver_id = treasurer_id)::BIGINT,
        
        (SELECT COALESCE(SUM(total_amount), 0) FROM public.financial_approvals 
         WHERE status IN ('awaiting_approval', 'awaiting_reevaluation') 
         AND (assigned_treasurer_id = treasurer_id OR assigned_treasurer_id IS NULL));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter estatísticas do criador
CREATE OR REPLACE FUNCTION get_creator_dashboard_stats(creator_user_id UUID DEFAULT auth.uid())
RETURNS TABLE (
    my_pending BIGINT,
    my_approved BIGINT,
    my_rejected BIGINT,
    needs_response BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM public.financial_approvals 
         WHERE creator_id = creator_user_id 
         AND status IN ('awaiting_approval', 'awaiting_reevaluation', 'escalated'))::BIGINT,
        
        (SELECT COUNT(*) FROM public.financial_approvals 
         WHERE creator_id = creator_user_id 
         AND status = 'approved')::BIGINT,
        
        (SELECT COUNT(*) FROM public.financial_approvals 
         WHERE creator_id = creator_user_id 
         AND status IN ('rejected', 'cancelled'))::BIGINT,
        
        (SELECT COUNT(*) FROM public.financial_approvals 
         WHERE creator_id = creator_user_id 
         AND status = 'in_revision')::BIGINT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Garantir que usuários autenticados podem acessar as tabelas
GRANT SELECT, INSERT, UPDATE, DELETE ON public.financial_approvals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.approval_comments TO authenticated;

-- Garantir que as funções podem ser executadas
GRANT EXECUTE ON FUNCTION get_treasurer_dashboard_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_creator_dashboard_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_updated_at_column() TO authenticated;
GRANT EXECUTE ON FUNCTION generate_reference_number() TO authenticated;

-- ============================================================================
-- DADOS DE TESTE (OPCIONAL)
-- ============================================================================

-- Inserir dados de teste apenas se não existirem aprovações
-- INSERT INTO public.financial_approvals (
--     title, description, total_amount, item_type, creator_id, status
-- ) 
-- SELECT 
--     'Aprovação de Teste',
--     'Esta é uma aprovação de teste para validar o sistema',
--     100.00,
--     'test',
--     auth.uid(),
--     'draft'
-- WHERE NOT EXISTS (SELECT 1 FROM public.financial_approvals LIMIT 1)
-- AND auth.uid() IS NOT NULL;

COMMIT;
