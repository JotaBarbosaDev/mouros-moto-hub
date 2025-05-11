#!/bin/bash
# Script para atualizar os metadados dos usuários no Supabase com usernames

echo "Atualizando membros para permitir login por username..."
echo ""
echo "Esta operação precisa ser executada no ambiente do Supabase."
echo "1. Vá para o Console do Supabase (console.supabase.com)"
echo "2. Entre no seu projeto"
echo "3. Navegue até SQL Editor"
echo "4. Cole e execute o seguinte código SQL:"
echo ""
echo "---------------------------------------------"
cat << EOF
-- Para cada usuário na tabela auth.users que não tenha um username nos metadados
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
EOF
echo "---------------------------------------------"
echo ""
echo "Também é possível usar o arquivo de migração: supabase/migrations/20250512000000_migrate_usernames_to_metadata.sql"
echo ""
echo "Para mais detalhes, consulte o arquivo CONFIGURAR_AUTH_USERNAME.md"
