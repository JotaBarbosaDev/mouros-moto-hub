-- Criar função exec_sql se não existir
CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS SETOF json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY EXECUTE sql;
END;
$$;

-- Garantir permissões
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO anon, authenticated;
