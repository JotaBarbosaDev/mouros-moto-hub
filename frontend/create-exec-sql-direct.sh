#!/bin/bash
# Script para criar a função exec_sql no Supabase usando curl

echo "========================================="
echo "  Criando função exec_sql no Supabase    "
echo "========================================="
echo ""

# Verificar se o arquivo .env.local existe
if [ ! -f .env.local ]; then
  echo "⚠️  Arquivo .env.local não encontrado!"
  exit 1
fi

# Extrair credenciais do Supabase do arquivo .env.local
SUPABASE_URL=$(grep VITE_SUPABASE_URL .env.local | cut -d '=' -f2 | tr -d '"' | tr -d "'" | tr -d ' ')
SUPABASE_KEY=$(grep VITE_SUPABASE_ANON_KEY .env.local | cut -d '=' -f2 | tr -d '"' | tr -d "'" | tr -d ' ')

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
  echo "❌ Credenciais do Supabase não encontradas em .env.local!"
  exit 1
fi

echo "📋 Criando função exec_sql no Supabase..."
echo "   URL: $SUPABASE_URL"

# SQL para criar a função
SQL_QUERY='CREATE OR REPLACE FUNCTION public.exec_sql(sql text) 
RETURNS SETOF json 
LANGUAGE plpgsql 
SECURITY DEFINER 
AS \$\$ 
BEGIN 
  RETURN QUERY EXECUTE sql; 
END; 
\$\$; 
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO anon, authenticated;'

# Tentativa 1: usando endpoint /rest/v1/sql
echo "🔄 Tentativa 1: POST para /rest/v1/sql"
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "$SUPABASE_URL/rest/v1/sql" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"$SQL_QUERY\"}")

STATUS_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$STATUS_CODE" -eq 200 ]; then
  echo "✅ Função exec_sql criada com sucesso!"
  echo ""
  echo "🎉 Você pode agora recarregar a aplicação e as tabelas serão criadas automaticamente."
  exit 0
fi

echo "❌ Erro na tentativa 1: $BODY"
echo "   Código HTTP: $STATUS_CODE"
echo ""
echo "⚠️  Falha ao criar a função automaticamente."
echo ""
echo "📋 Por favor, crie a função manualmente:"
echo "   1. Acesse o painel do Supabase: $SUPABASE_URL/project/sql"
echo "   2. Abra o SQL Editor"
echo "   3. Cole e execute o seguinte SQL:"
echo ""
echo "CREATE OR REPLACE FUNCTION public.exec_sql(sql text)"
echo "RETURNS SETOF json"
echo "LANGUAGE plpgsql"
echo "SECURITY DEFINER"
echo "AS \$\$"
echo "BEGIN"
echo "  RETURN QUERY EXECUTE sql;"
echo "END;"
echo "\$\$;"
echo ""
echo "GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO anon, authenticated;"
echo ""
echo "   4. Verifique se não houve erros"
echo "   5. Recarregue sua aplicação"

exit 1
