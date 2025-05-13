-- Nome da migração: 20250512000001_create_user_functions_and_views.sql
-- Descrição: Cria funções e views para recuperar usuários por username e resolver problemas de permissão

-- 1. Criar uma view para acessar informações de usuário combinadas com metadados
CREATE OR REPLACE VIEW user_profiles_view AS
SELECT 
  au.id,
  au.email,
  au.created_at,
  au.updated_at,
  au.last_sign_in_at,
  au.raw_user_meta_data AS metadata,
  m.id AS member_id,
  m.name,
  m.member_number,
  m.is_admin
FROM auth.users au
LEFT JOIN public.members m ON m.id = au.id;

-- 2. Criar uma função RPC para buscar usuário pelo username nos metadados
CREATE OR REPLACE FUNCTION get_user_by_username(p_username TEXT)
RETURNS TABLE (
  id UUID,
  email TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  member_id UUID,
  name TEXT,
  username TEXT
) 
SECURITY DEFINER 
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    au.email,
    au.created_at,
    au.updated_at,
    m.id AS member_id,
    m.name,
    au.raw_user_meta_data->>'username' AS username
  FROM auth.users au
  LEFT JOIN public.members m ON m.id = au.id
  WHERE 
    -- Procura nos metadados pelo username
    (au.raw_user_meta_data->>'username' ILIKE p_username);
END;
$$;

-- 3. Políticas de segurança para a view
GRANT SELECT ON user_profiles_view TO anon, authenticated;

-- 4. Permitir acesso à função RPC
GRANT EXECUTE ON FUNCTION get_user_by_username(TEXT) TO anon, authenticated;

-- 5. Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_auth_users_metadata_username ON auth.users USING gin ((raw_user_meta_data->'username'));
