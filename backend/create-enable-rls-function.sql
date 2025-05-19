-- Script para criar função RPC que reabilita o RLS para veículos
CREATE OR REPLACE FUNCTION public.enable_vehicles_rls()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Executa com as permissões do criador da função
AS $$
BEGIN
  -- Reabilitar RLS para a tabela vehicles
  ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
  
  -- Adicionar log da operação
  RAISE NOTICE 'RLS reabilitado para a tabela vehicles';
END;
$$;

-- Conceder permissão para o service_role executar esta função
GRANT EXECUTE ON FUNCTION public.enable_vehicles_rls() TO service_role;

-- Comentários sobre a função
COMMENT ON FUNCTION public.enable_vehicles_rls() IS 'Reabilita as políticas RLS da tabela vehicles após operações que exigiram desabilitação temporária.';
