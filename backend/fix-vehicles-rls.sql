-- Script para corrigir as políticas RLS da tabela vehicles
-- Verificar se a tabela vehicles existe
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'vehicles') THEN
    -- Desabilitar RLS para a tabela vehicles (permitindo operações de inserção)
    ALTER TABLE public.vehicles DISABLE ROW LEVEL SECURITY;

    -- Criar políticas RLS para operações específicas
    DROP POLICY IF EXISTS "Permitir select para usuários autenticados" ON public.vehicles;
    CREATE POLICY "Permitir select para usuários autenticados" ON public.vehicles
      FOR SELECT
      TO authenticated
      USING (true);

    DROP POLICY IF EXISTS "Permitir insert para usuários autenticados" ON public.vehicles;
    CREATE POLICY "Permitir insert para usuários autenticados" ON public.vehicles
      FOR INSERT
      TO authenticated
      WITH CHECK (true);

    DROP POLICY IF EXISTS "Permitir update para usuários autenticados" ON public.vehicles;
    CREATE POLICY "Permitir update para usuários autenticados" ON public.vehicles
      FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);

    DROP POLICY IF EXISTS "Permitir delete para usuários autenticados" ON public.vehicles;
    CREATE POLICY "Permitir delete para usuários autenticados" ON public.vehicles
      FOR DELETE
      TO authenticated
      USING (true);

    -- Reabilitar RLS com as novas políticas
    ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
    
    -- Garantir acesso completo para o role service_role
    GRANT ALL ON public.vehicles TO service_role;
    
    RAISE NOTICE 'Políticas RLS configuradas com sucesso para a tabela vehicles.';
  ELSE
    RAISE NOTICE 'A tabela vehicles não existe no esquema public.';
  END IF;
END
$$;
