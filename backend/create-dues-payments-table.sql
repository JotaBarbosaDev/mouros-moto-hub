-- Criar tabela de pagamentos de quotas
CREATE TABLE IF NOT EXISTS public.dues_payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  paid BOOLEAN NOT NULL DEFAULT false,
  exempt BOOLEAN NOT NULL DEFAULT false, 
  payment_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(member_id, year)
);

-- Adicionar comentários à tabela e colunas
COMMENT ON TABLE public.dues_payments IS 'Tabela para armazenar pagamentos de quotas anuais dos membros';
COMMENT ON COLUMN public.dues_payments.id IS 'ID único do pagamento';
COMMENT ON COLUMN public.dues_payments.member_id IS 'ID do membro associado ao pagamento';
COMMENT ON COLUMN public.dues_payments.year IS 'Ano do pagamento da quota';
COMMENT ON COLUMN public.dues_payments.paid IS 'Indica se a quota foi paga';
COMMENT ON COLUMN public.dues_payments.exempt IS 'Indica se o membro está isento do pagamento neste ano';
COMMENT ON COLUMN public.dues_payments.payment_date IS 'Data em que o pagamento foi realizado';
COMMENT ON COLUMN public.dues_payments.created_at IS 'Data de criação do registro';
COMMENT ON COLUMN public.dues_payments.updated_at IS 'Data da última atualização do registro';

-- Criar função para atualizar timestamp de updated_at
CREATE OR REPLACE FUNCTION update_dues_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar o campo updated_at automaticamente
DROP TRIGGER IF EXISTS update_dues_payments_updated_at_trigger ON public.dues_payments;
CREATE TRIGGER update_dues_payments_updated_at_trigger
BEFORE UPDATE ON public.dues_payments
FOR EACH ROW
EXECUTE FUNCTION update_dues_payments_updated_at();

-- Criar políticas RLS para segurança
ALTER TABLE public.dues_payments ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários autenticados visualizem pagamentos
CREATE POLICY "Pagamentos visíveis para usuários autenticados" ON public.dues_payments
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Política para permitir que administradores insiram pagamentos
CREATE POLICY "Admins podem inserir pagamentos" ON public.dues_payments
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM public.members
    WHERE members.id = auth.uid()
    AND members.is_admin = true
  ));

-- Política para permitir que administradores atualizem pagamentos
CREATE POLICY "Admins podem atualizar pagamentos" ON public.dues_payments
  FOR UPDATE
  USING (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM public.members
    WHERE members.id = auth.uid()
    AND members.is_admin = true
  ));

-- Política para permitir que administradores excluam pagamentos
CREATE POLICY "Admins podem excluir pagamentos" ON public.dues_payments
  FOR DELETE
  USING (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM public.members
    WHERE members.id = auth.uid()
    AND members.is_admin = true
  ));

-- Inserir alguns dados de exemplo para pagamentos de quotas
INSERT INTO public.dues_payments (member_id, year, paid, exempt, payment_date)
SELECT 
  id AS member_id,
  EXTRACT(YEAR FROM CURRENT_DATE) AS year,
  CASE 
    WHEN random() > 0.3 THEN true
    ELSE false
  END AS paid,
  CASE 
    WHEN honorary_member = true THEN true
    ELSE false
  END AS exempt,
  CASE 
    WHEN random() > 0.3 THEN now() - (random() * INTERVAL '90 days')
    ELSE NULL
  END AS payment_date
FROM public.members
ON CONFLICT (member_id, year) DO NOTHING;

-- Adicionar também alguns pagamentos do ano anterior
INSERT INTO public.dues_payments (member_id, year, paid, exempt, payment_date)
SELECT 
  id AS member_id,
  EXTRACT(YEAR FROM CURRENT_DATE) - 1 AS year,
  true AS paid,
  CASE 
    WHEN honorary_member = true THEN true
    ELSE false
  END AS exempt,
  now() - (random() * INTERVAL '365 days') AS payment_date
FROM public.members
ON CONFLICT (member_id, year) DO NOTHING;

-- Fornecer acesso à API
GRANT ALL ON public.dues_payments TO service_role;
GRANT ALL ON public.dues_payments TO postgres;
GRANT ALL ON public.dues_payments TO anon;
