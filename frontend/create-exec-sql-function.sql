-- Script para criar a função exec_sql no Supabase
-- Copie e cole este script no SQL Editor do painel admin do Supabase

-- Criar a função exec_sql que permite executar SQL dinâmico
CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS SETOF json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY EXECUTE sql;
END;
$$;

-- Configurar permissões para permitir que usuários anônimos e autenticados usem a função
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO anon, authenticated;

-- Confirmação visual
DO $$
BEGIN
  RAISE NOTICE 'Função exec_sql criada com sucesso!';
END;
$$;
