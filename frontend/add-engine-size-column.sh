#!/bin/bash
# Script para executar o SQL que adiciona a coluna engine_size à tabela vehicles

# Arquivo SQL padrão ou passado como argumento
SQL_FILE=${1:-"add-engine-size-column.sql"}

# Verificar se o arquivo .env.local existe
if [ -f .env.local ]; then
  # Extrair credenciais do Supabase do arquivo .env.local
  SUPABASE_URL=$(grep VITE_SUPABASE_URL .env.local | cut -d '=' -f2 | tr -d '"' | tr -d "'" | tr -d ' ')
  SUPABASE_KEY=$(grep VITE_SUPABASE_ANON_KEY .env.local | cut -d '=' -f2 | tr -d '"' | tr -d "'" | tr -d ' ')
else
  # Tentar obter de variáveis de ambiente ou .env
  SUPABASE_URL=${SUPABASE_URL:-$(grep SUPABASE_URL .env 2>/dev/null | cut -d '=' -f2)}
  SUPABASE_KEY=${SUPABASE_KEY:-$(grep SUPABASE_KEY .env 2>/dev/null | cut -d '=' -f2)}
fi

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
  echo "Por favor, defina as variáveis de ambiente SUPABASE_URL e SUPABASE_KEY"
  echo "Você pode fazer isso através do terminal ou criando um arquivo .env"
  exit 1
fi

# Executar o SQL usando a API REST do Supabase
echo "Adicionando coluna engine_size à tabela vehicles..."

PGPASSWORD=$SUPABASE_KEY psql -h $(echo $SUPABASE_URL | sed 's|^https\?://||' | sed 's|/.*||') -U postgres -d postgres -f $SQL_FILE

echo "Operação concluída!"
