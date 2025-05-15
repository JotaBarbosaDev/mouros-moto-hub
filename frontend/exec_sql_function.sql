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
