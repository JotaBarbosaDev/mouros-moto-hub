-- Função RPC para obter perfil de usuário com metadados
CREATE OR REPLACE FUNCTION get_user_profile(user_id UUID)
RETURNS TABLE (
  id UUID,
  email TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.raw_user_meta_data AS metadata,
    u.created_at
  FROM auth.users u
  WHERE u.id = user_id;
END;
$$;

-- Adiciona comentário para documentação
COMMENT ON FUNCTION get_user_profile IS 'Obtém os detalhes do perfil de um usuário, incluindo seus metadados';
