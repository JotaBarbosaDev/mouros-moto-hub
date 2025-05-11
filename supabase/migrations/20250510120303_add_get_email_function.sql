-- filepath: /Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/supabase/migrations/20250510120303_add_get_email_function.sql
-- Adiciona função SQL para buscar email por username
CREATE OR REPLACE FUNCTION get_email_by_username(username_input TEXT)
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM members WHERE username = username_input LIMIT 1;
$$;

-- Adiciona função para busca de membros por username (versão mais robusta)
CREATE OR REPLACE FUNCTION find_member_by_username(username_input TEXT)
RETURNS TABLE (
  id UUID,
  email TEXT,
  username TEXT,
  name TEXT
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, email, username, name 
  FROM members 
  WHERE username = username_input 
  LIMIT 1;
$$;
