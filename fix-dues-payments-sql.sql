-- Arquivo para ser executado no SQL Editor do Supabase
-- Para resolver o erro 401 na tabela dues_payments

-- Verificar se a tabela dues_payments existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'dues_payments'
);

-- Se a tabela não existir, crie-a
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

-- Habilitar RLS na tabela
ALTER TABLE public.dues_payments ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
DROP POLICY IF EXISTS "Pagamentos visíveis para usuários autenticados" ON public.dues_payments;
DROP POLICY IF EXISTS "Admins podem inserir pagamentos" ON public.dues_payments;
DROP POLICY IF EXISTS "Admins podem atualizar pagamentos" ON public.dues_payments;
DROP POLICY IF EXISTS "Admins podem excluir pagamentos" ON public.dues_payments;
DROP POLICY IF EXISTS "Usuários podem visualizar seus próprios pagamentos" ON public.dues_payments;
DROP POLICY IF EXISTS "Frontend pode inserir pagamentos" ON public.dues_payments;

-- Criar política para permitir SELECT para qualquer usuário autenticado
CREATE POLICY "Pagamentos visíveis para usuários autenticados" ON public.dues_payments
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Criar política para permitir INSERT para qualquer usuário autenticado (essa é a correção para o erro 401)
CREATE POLICY "Frontend pode inserir pagamentos" ON public.dues_payments
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Criar política para permitir UPDATE apenas para administradores
CREATE POLICY "Admins podem atualizar pagamentos" ON public.dues_payments
  FOR UPDATE
  USING (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM public.members
    WHERE members.id = auth.uid()
    AND members.is_admin = true
  ));

-- Criar política para permitir DELETE apenas para administradores
CREATE POLICY "Admins podem excluir pagamentos" ON public.dues_payments
  FOR DELETE
  USING (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM public.members
    WHERE members.id = auth.uid()
    AND members.is_admin = true
  ));

-- Conceder permissões
GRANT ALL ON public.dues_payments TO service_role;
GRANT ALL ON public.dues_payments TO postgres;
GRANT ALL ON public.dues_payments TO anon;
GRANT ALL ON public.dues_payments TO authenticated;

-- Verificar as políticas criadas
SELECT * FROM pg_policies WHERE tablename = 'dues_payments';
