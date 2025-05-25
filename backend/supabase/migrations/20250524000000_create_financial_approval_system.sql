-- ============================================================================
-- SISTEMA DE APROVAÇÃO FINANCEIRA - MIGRAÇÃO
-- Data: 2025-05-24
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
    item_type VARCHAR(50) NOT NULL,
    item_id UUID,
    reference_number VARCHAR(100) UNIQUE,
    
    -- Detalhes financeiros
    title VARCHAR(255) NOT NULL,
    description TEXT,
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    currency VARCHAR(3) DEFAULT 'EUR',
    
    -- Detalhes específicos (JSON flexível)
    item_details JSONB DEFAULT '{}',
    
    -- Estado da aprovação
    status financial_approval_status DEFAULT 'draft',
    priority_level INTEGER DEFAULT 1 CHECK (priority_level BETWEEN 1 AND 5),
    
    -- Utilizadores envolvidos
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_treasurer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    final_approver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submitted_at TIMESTAMP WITH TIME ZONE,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    
    -- Datas limite
    due_date TIMESTAMP WITH TIME ZONE,
    escalation_date TIMESTAMP WITH TIME ZONE,
    
    -- Metadados
    requires_president_approval BOOLEAN DEFAULT FALSE,
    is_escalated BOOLEAN DEFAULT FALSE,
    escalation_reason TEXT,
    
    -- Audit trail
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- ============================================================================
-- TABELA: approval_comments
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.approval_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relacionamento
    approval_id UUID NOT NULL REFERENCES public.financial_approvals(id) ON DELETE CASCADE,
    
    -- Autor do comentário
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Conteúdo
    comment_type approval_comment_type NOT NULL,
    message TEXT NOT NULL,
    
    -- Para contrapropostas
    proposed_amount DECIMAL(10,2),
    proposed_changes JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'
);

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Índices principais
CREATE INDEX IF NOT EXISTS idx_financial_approvals_status ON public.financial_approvals(status);
CREATE INDEX IF NOT EXISTS idx_financial_approvals_creator ON public.financial_approvals(creator_id);
CREATE INDEX IF NOT EXISTS idx_financial_approvals_treasurer ON public.financial_approvals(assigned_treasurer_id);
CREATE INDEX IF NOT EXISTS idx_financial_approvals_created_at ON public.financial_approvals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_financial_approvals_item_type ON public.financial_approvals(item_type);
CREATE INDEX IF NOT EXISTS idx_financial_approvals_amount ON public.financial_approvals(total_amount);

-- Índices compostos para queries comuns
CREATE INDEX IF NOT EXISTS idx_financial_approvals_status_treasurer ON public.financial_approvals(status, assigned_treasurer_id);
CREATE INDEX IF NOT EXISTS idx_financial_approvals_creator_status ON public.financial_approvals(creator_id, status);

-- Índices para comentários
CREATE INDEX IF NOT EXISTS idx_approval_comments_approval_id ON public.approval_comments(approval_id);
CREATE INDEX IF NOT EXISTS idx_approval_comments_author ON public.approval_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_approval_comments_created_at ON public.approval_comments(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Ativar RLS
ALTER TABLE public.financial_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_comments ENABLE ROW LEVEL SECURITY;

-- Políticas para financial_approvals
CREATE POLICY "Users can view their own approvals" ON public.financial_approvals
    FOR SELECT USING (auth.uid() = creator_id);

CREATE POLICY "Treasurers can view assigned approvals" ON public.financial_approvals
    FOR SELECT USING (
        auth.uid() = assigned_treasurer_id OR
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'treasurer'
        )
    );

CREATE POLICY "Presidents can view all approvals" ON public.financial_approvals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'president'
        )
    );

CREATE POLICY "Users can create their own approvals" ON public.financial_approvals
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update their own draft approvals" ON public.financial_approvals
    FOR UPDATE USING (
        auth.uid() = creator_id AND status = 'draft'
    );

CREATE POLICY "Treasurers can update assigned approvals" ON public.financial_approvals
    FOR UPDATE USING (
        auth.uid() = assigned_treasurer_id OR
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'treasurer'
        )
    );

CREATE POLICY "Presidents can update all approvals" ON public.financial_approvals
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'president'
        )
    );

-- Políticas para approval_comments
CREATE POLICY "Users can view comments on their approvals" ON public.approval_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.financial_approvals 
            WHERE id = approval_id 
            AND (creator_id = auth.uid() OR assigned_treasurer_id = auth.uid())
        )
    );

CREATE POLICY "Treasurers can view all relevant comments" ON public.approval_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' IN ('treasurer', 'president')
        )
    );

CREATE POLICY "Users can add comments on relevant approvals" ON public.approval_comments
    FOR INSERT WITH CHECK (
        auth.uid() = author_id AND
        EXISTS (
            SELECT 1 FROM public.financial_approvals 
            WHERE id = approval_id 
            AND (creator_id = auth.uid() OR assigned_treasurer_id = auth.uid())
        )
    );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Function para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.updated_by = auth.uid();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para financial_approvals
DROP TRIGGER IF EXISTS update_financial_approvals_updated_at ON public.financial_approvals;
CREATE TRIGGER update_financial_approvals_updated_at
    BEFORE UPDATE ON public.financial_approvals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNÇÕES AUXILIARES
-- ============================================================================

-- Função para obter o papel do utilizador
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS user_role_type AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT raw_user_meta_data->>'role' INTO user_role
    FROM auth.users 
    WHERE id = user_id;
    
    RETURN COALESCE(user_role::user_role_type, 'creator');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para auto-atribuir tesoureiro
CREATE OR REPLACE FUNCTION auto_assign_treasurer()
RETURNS TRIGGER AS $$
BEGIN
    -- Se não foi atribuído um tesoureiro, atribuir automaticamente
    IF NEW.assigned_treasurer_id IS NULL AND NEW.status = 'awaiting_approval' THEN
        SELECT id INTO NEW.assigned_treasurer_id
        FROM auth.users 
        WHERE raw_user_meta_data->>'role' = 'treasurer'
        ORDER BY RANDOM()
        LIMIT 1;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para auto-atribuição
DROP TRIGGER IF EXISTS auto_assign_treasurer_trigger ON public.financial_approvals;
CREATE TRIGGER auto_assign_treasurer_trigger
    BEFORE INSERT OR UPDATE ON public.financial_approvals
    FOR EACH ROW
    EXECUTE FUNCTION auto_assign_treasurer();

-- Função para gerar número de referência
CREATE OR REPLACE FUNCTION generate_reference_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.reference_number IS NULL THEN
        NEW.reference_number := 'FA-' || TO_CHAR(NOW(), 'YYYY') || '-' || 
                               LPAD(NEXTVAL('financial_approval_ref_seq')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Sequência para números de referência
CREATE SEQUENCE IF NOT EXISTS financial_approval_ref_seq START 1;

-- Trigger para gerar número de referência
DROP TRIGGER IF EXISTS generate_reference_number_trigger ON public.financial_approvals;
CREATE TRIGGER generate_reference_number_trigger
    BEFORE INSERT ON public.financial_approvals
    FOR EACH ROW
    EXECUTE FUNCTION generate_reference_number();

-- ============================================================================
-- VIEWS ÚTEIS
-- ============================================================================

-- View para dashboard do tesoureiro
CREATE OR REPLACE VIEW treasurer_dashboard AS
SELECT 
    COUNT(CASE WHEN status = 'awaiting_approval' THEN 1 END) as pending_approvals,
    COUNT(CASE WHEN status = 'in_revision' THEN 1 END) as in_revision,
    COUNT(CASE WHEN status = 'escalated' THEN 1 END) as escalated,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_today,
    AVG(CASE WHEN status = 'approved' THEN total_amount END) as avg_approved_amount,
    SUM(CASE WHEN status = 'approved' AND DATE(approved_at) = CURRENT_DATE THEN total_amount ELSE 0 END) as total_approved_today
FROM public.financial_approvals
WHERE assigned_treasurer_id = auth.uid()
   OR EXISTS (
       SELECT 1 FROM auth.users 
       WHERE id = auth.uid() 
       AND raw_user_meta_data->>'role' = 'treasurer'
   );

-- View para criadores
CREATE OR REPLACE VIEW creator_dashboard AS
SELECT 
    creator_id,
    COUNT(CASE WHEN status = 'draft' THEN 1 END) as drafts,
    COUNT(CASE WHEN status = 'awaiting_approval' THEN 1 END) as pending,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
    AVG(total_amount) as avg_request_amount
FROM public.financial_approvals
WHERE creator_id = auth.uid()
GROUP BY creator_id;

-- ============================================================================
-- DADOS INICIAIS (OPCIONAL)
-- ============================================================================

-- Inserir alguns dados de exemplo para testes (comentar se não necessário)
-- INSERT INTO public.financial_approvals (
--     item_type, title, description, total_amount, creator_id, status
-- ) VALUES (
--     'equipment', 'Capacetes de Segurança', 'Compra de 10 capacetes para eventos', 500.00, 
--     (SELECT id FROM auth.users LIMIT 1), 'draft'
-- );

-- ============================================================================
-- COMENTÁRIOS FINAIS
-- ============================================================================

-- Este schema inclui:
-- 1. Tabelas principais com relacionamentos
-- 2. Tipos ENUM para estados e categorias
-- 3. Índices para performance
-- 4. RLS para segurança
-- 5. Triggers para automação
-- 6. Funções auxiliares
-- 7. Views para dashboards
-- 8. Audit trail completo

-- Próximos passos:
-- 1. Testar as queries no service layer
-- 2. Implementar notificações
-- 3. Criar API endpoints
-- 4. Integrar com outros módulos
