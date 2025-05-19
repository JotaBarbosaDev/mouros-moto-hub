-- Script para criar função RPC que desabilita temporariamente o RLS para veículos
CREATE OR REPLACE FUNCTION public.disable_vehicles_rls()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Executa com as permissões do criador da função
AS $$
BEGIN
  -- Desabilitar RLS temporariamente para a tabela vehicles
  ALTER TABLE public.vehicles DISABLE ROW LEVEL SECURITY;
  
  -- Adicionar log da operação
  RAISE NOTICE 'RLS desabilitado para a tabela vehicles';
END;
$$;

-- Conceder permissão para o service_role executar esta função
GRANT EXECUTE ON FUNCTION public.disable_vehicles_rls() TO service_role;

-- Comentários sobre a função
COMMENT ON FUNCTION public.disable_vehicles_rls() IS 'Desabilita temporariamente as políticas RLS da tabela vehicles. Use com cautela e apenas quando necessário para contornar problemas de permissão.';
