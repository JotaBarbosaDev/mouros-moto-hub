-- ============================================================================
-- SISTEMA DE APROVAÇÃO FINANCEIRA - TABELAS PRINCIPAIS
-- Execute este SQL no Supabase SQL Editor
-- ============================================================================

-- Primeiro, criar os tipos ENUM necessários
DO $$ BEGIN
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
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE approval_comment_type AS ENUM (
        'request_changes',
        'counteroffer', 
        'justification',
        'approval_note',
        'escalation_note'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_role_type AS ENUM (
        'creator',
        'treasurer', 
        'president',
        'admin'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- TABELA: financial_approvals
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.financial_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identificação do item
    item_type VARCHAR(50) NOT NULL, -- 'product', 'event', 'fee', 'transaction'
    item_id UUID NOT NULL, -- ID do item referenciado
    
    -- Utilizadores envolvidos
    creator_id UUID NOT NULL,
    treasurer_id UUID,
    president_id UUID,
    
    -- Estado da aprovação
    status financial_approval_status NOT NULL DEFAULT 'draft',
    current_round INTEGER DEFAULT 1,
    max_rounds INTEGER DEFAULT 3,
    
    -- Valores financeiros (JSON)
    original_values JSONB NOT NULL, -- Valores originais propostos
    current_values JSONB NOT NULL,  -- Valores atuais (podem ter mudado)
    approved_values JSONB,          -- Valores finais aprovados
    
    -- Timestamps importantes
    created_at TIMESTAMPTZ DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,         -- Quando foi enviado para aprovação
    first_response_at TIMESTAMPTZ,    -- Primeira resposta do tesoureiro
    approved_at TIMESTAMPTZ,          -- Quando foi aprovado
    escalated_at TIMESTAMPTZ,         -- Quando foi escalado (se aplicável)
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Informações de escalamento
    escalation_reason TEXT,
    final_decision_by UUID, -- Quem tomou decisão final
    
    -- Constraints
    CONSTRAINT fk_financial_approvals_creator FOREIGN KEY (creator_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_financial_approvals_treasurer FOREIGN KEY (treasurer_id) REFERENCES auth.users(id) ON DELETE SET NULL,
    CONSTRAINT fk_financial_approvals_president FOREIGN KEY (president_id) REFERENCES auth.users(id) ON DELETE SET NULL,
    CONSTRAINT fk_financial_approvals_final_decision FOREIGN KEY (final_decision_by) REFERENCES auth.users(id) ON DELETE SET NULL,
    CONSTRAINT check_max_rounds CHECK (max_rounds > 0 AND max_rounds <= 5),
    CONSTRAINT check_current_round CHECK (current_round > 0 AND current_round <= max_rounds)
);

-- ============================================================================
-- TABELA: approval_comments  
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.approval_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Ligação à aprovação
    approval_id UUID NOT NULL,
    
    -- Utilizador que fez o comentário
    user_id UUID NOT NULL,
    user_role user_role_type NOT NULL,
    
    -- Tipo e conteúdo do comentário
    comment_type approval_comment_type NOT NULL,
    content TEXT NOT NULL,
    suggested_values JSONB, -- Valores sugeridos (se aplicável)
    
    -- Contexto da ronda
    round_number INTEGER NOT NULL DEFAULT 1,
    
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT fk_approval_comments_approval FOREIGN KEY (approval_id) REFERENCES public.financial_approvals(id) ON DELETE CASCADE,
    CONSTRAINT fk_approval_comments_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT check_round_number CHECK (round_number > 0)
);

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Índices para financial_approvals
CREATE INDEX IF NOT EXISTS idx_financial_approvals_status ON public.financial_approvals(status);
CREATE INDEX IF NOT EXISTS idx_financial_approvals_creator ON public.financial_approvals(creator_id);
CREATE INDEX IF NOT EXISTS idx_financial_approvals_treasurer ON public.financial_approvals(treasurer_id);
CREATE INDEX IF NOT EXISTS idx_financial_approvals_item ON public.financial_approvals(item_type, item_id);
CREATE INDEX IF NOT EXISTS idx_financial_approvals_created_at ON public.financial_approvals(created_at DESC);

-- Índices para approval_comments
CREATE INDEX IF NOT EXISTS idx_approval_comments_approval ON public.approval_comments(approval_id);
CREATE INDEX IF NOT EXISTS idx_approval_comments_user ON public.approval_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_approval_comments_round ON public.approval_comments(approval_id, round_number);
CREATE INDEX IF NOT EXISTS idx_approval_comments_created_at ON public.approval_comments(created_at DESC);

-- ============================================================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- ============================================================================

-- Ativar RLS nas tabelas
ALTER TABLE public.financial_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_comments ENABLE ROW LEVEL SECURITY;

-- Políticas para financial_approvals
CREATE POLICY "financial_approvals_select_policy" ON public.financial_approvals
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND (
            -- Criador pode ver suas próprias aprovações
            creator_id = auth.uid() OR
            -- Tesoureiro pode ver aprovações atribuídas a ele
            treasurer_id = auth.uid() OR
            -- Presidente pode ver aprovações escaladas
            (president_id = auth.uid() AND status = 'escalated') OR
            -- Admins podem ver todas
            EXISTS (
                SELECT 1 FROM public.members 
                WHERE id = auth.uid() AND is_admin = true
            )
        )
    );

CREATE POLICY "financial_approvals_insert_policy" ON public.financial_approvals
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND creator_id = auth.uid()
    );

CREATE POLICY "financial_approvals_update_policy" ON public.financial_approvals
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL AND (
            -- Criador pode editar enquanto está em draft ou in_revision
            (creator_id = auth.uid() AND status IN ('draft', 'in_revision')) OR
            -- Tesoureiro pode aprovar/rejeitar
            (treasurer_id = auth.uid() AND status IN ('awaiting_approval', 'awaiting_reevaluation')) OR
            -- Presidente pode decidir em escalamentos
            (president_id = auth.uid() AND status = 'escalated') OR
            -- Admins podem tudo
            EXISTS (
                SELECT 1 FROM public.members 
                WHERE id = auth.uid() AND is_admin = true
            )
        )
    );

-- Políticas para approval_comments
CREATE POLICY "approval_comments_select_policy" ON public.approval_comments
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.financial_approvals fa
            WHERE fa.id = approval_id AND (
                fa.creator_id = auth.uid() OR
                fa.treasurer_id = auth.uid() OR
                fa.president_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.members 
                    WHERE id = auth.uid() AND is_admin = true
                )
            )
        )
    );

CREATE POLICY "approval_comments_insert_policy" ON public.approval_comments
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND 
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.financial_approvals fa
            WHERE fa.id = approval_id AND (
                fa.creator_id = auth.uid() OR
                fa.treasurer_id = auth.uid() OR
                fa.president_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.members 
                    WHERE id = auth.uid() AND is_admin = true
                )
            )
        )
    );

-- ============================================================================
-- FUNÇÕES AUXILIARES
-- ============================================================================

-- Função para escalar aprovação automaticamente após 3 rondas
CREATE OR REPLACE FUNCTION escalate_approval_if_needed()
RETURNS TRIGGER AS $$
BEGIN
    -- Se chegou ao máximo de rondas e ainda não foi aprovado
    IF NEW.current_round >= NEW.max_rounds AND NEW.status NOT IN ('approved', 'rejected', 'escalated') THEN
        NEW.status := 'escalated';
        NEW.escalated_at := NOW();
        NEW.escalation_reason := 'Máximo de rondas de negociação atingido';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para escalamento automático
CREATE TRIGGER trigger_escalate_approval
    BEFORE UPDATE ON public.financial_approvals
    FOR EACH ROW
    EXECUTE FUNCTION escalate_approval_if_needed();

-- Função para atualizar timestamp updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER trigger_update_financial_approvals_updated_at
    BEFORE UPDATE ON public.financial_approvals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- DADOS DE EXEMPLO (OPCIONAL - para teste)
-- ============================================================================

-- Inserir uma aprovação de exemplo (descomente se quiser testar)
/*
INSERT INTO public.financial_approvals (
    item_type,
    item_id,
    creator_id,
    original_values,
    current_values,
    status
) VALUES (
    'product',
    gen_random_uuid(),
    (SELECT id FROM auth.users LIMIT 1),
    '{"price": 29.99, "cost": 15.00, "margin": 50}',
    '{"price": 29.99, "cost": 15.00, "margin": 50}',
    'awaiting_approval'
);
*/

-- ============================================================================
-- GRANTS DE PERMISSÕES
-- ============================================================================

-- Conceder permissões para roles autenticados
GRANT SELECT, INSERT, UPDATE ON public.financial_approvals TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.approval_comments TO authenticated;

-- Conceder permissões para anônimos (apenas SELECT se necessário)
GRANT SELECT ON public.financial_approvals TO anon;
GRANT SELECT ON public.approval_comments TO anon;

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================

-- Verificar se as tabelas foram criadas
SELECT 
    schemaname, 
    tablename, 
    tableowner 
FROM pg_tables 
WHERE tablename IN ('financial_approvals', 'approval_comments');

-- Verificar se os tipos ENUM foram criados
SELECT 
    typname, 
    typtype 
FROM pg_type 
WHERE typname IN ('financial_approval_status', 'approval_comment_type', 'user_role_type');

COMMENT ON TABLE public.financial_approvals IS 'Sistema de aprovação financeira - aprovações principais';
COMMENT ON TABLE public.approval_comments IS 'Sistema de aprovação financeira - comentários e feedback';

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================
