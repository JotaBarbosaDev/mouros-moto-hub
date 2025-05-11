
-- Este script migra os usernames dos membros para os metadados dos usuários no Supabase Auth
-- Isso permite que o login por username funcione corretamente

-- Para cada usuário na tabela auth.users, atualiza os metadados para incluir o username
-- Se o username já existe nos metadados, mantém o valor
-- Se não, usa a parte antes do @ do email como username
UPDATE auth.users
SET raw_user_meta_data = 
  raw_user_meta_data || 
  jsonb_build_object('username', 
    COALESCE(
      (raw_user_meta_data->>'username'),
      (SELECT split_part(email, '@', 1) FROM auth.users u WHERE u.id = auth.users.id)
    )
  )
WHERE raw_user_meta_data->>'username' IS NULL;

-- Garante que todos os membros tenham um username nos metadados
-- Com base no email de cada membro
DO $$
DECLARE
  member_rec RECORD;
  user_rec RECORD;
BEGIN
  FOR member_rec IN SELECT id, email FROM public.members LOOP
    SELECT id INTO user_rec FROM auth.users WHERE email = member_rec.email;
    
    IF FOUND THEN
      -- Verifica se o usuário já tem um username nos metadados
      IF NOT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = user_rec.id AND raw_user_meta_data->>'username' IS NOT NULL
      ) THEN
        -- Adiciona o username baseado no email
        UPDATE auth.users
        SET raw_user_meta_data = 
          raw_user_meta_data || 
          jsonb_build_object('username', split_part(member_rec.email, '@', 1))
        WHERE id = user_rec.id;
      END IF;
    END IF;
  END LOOP;
END $$;
