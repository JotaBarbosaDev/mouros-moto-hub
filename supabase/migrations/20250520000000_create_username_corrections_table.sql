-- language: postgresql
-- postgres
-- Cria tabela para registro de correções de username
CREATE TABLE IF NOT EXISTS public.username_corrections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  old_username TEXT NOT NULL,
  new_username TEXT NOT NULL,
  detected_pattern TEXT,
  corrected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  correction_source TEXT DEFAULT 'manual' /* 'manual', 'auto', etc. */
);

-- Adiciona comentários para documentação
COMMENT ON TABLE public.username_corrections IS 'Registro de correções de username para identificar padrões problemáticos';
COMMENT ON COLUMN public.username_corrections.detected_pattern IS 'Padrão problemático detectado, como mb_transformation';
COMMENT ON COLUMN public.username_corrections.correction_source IS 'Fonte da correção: manual (via UI) ou auto (via sistema)';

-- Adiciona índices para otimização de consultas
CREATE INDEX IF NOT EXISTS username_corrections_user_id_idx ON public.username_corrections (user_id);
CREATE INDEX IF NOT EXISTS username_corrections_pattern_idx ON public.username_corrections (detected_pattern);

-- Políticas de acesso RLS (apenas administradores podem visualizar)
ALTER TABLE public.username_corrections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Apenas administradores podem ver correções de username" 
  ON public.username_corrections
  FOR SELECT 
  USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM public.members 
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

CREATE POLICY "Apenas administradores podem inserir correções de username" 
  ON public.username_corrections
  FOR INSERT 
  WITH CHECK (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM public.members 
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );
