#!/bin/bash
# Script para criar a tabela de logs com debug

echo "Configurando variáveis de ambiente..."
export $(grep -v '^#' .env | xargs)
echo "SUPABASE_URL: $SUPABASE_URL"
echo "SUPABASE_SERVICE_ROLE_KEY está definida: $([ -n "$SUPABASE_SERVICE_ROLE_KEY" ] && echo "Sim" || echo "Não")"

echo "Executando SQL para criar tabela activity_logs..."
SQL_CONTENT=$(cat create-activity-logs-table.sql | tr '\n' ' ')

echo "Enviando requisição para o Supabase..."
RESPONSE=$(curl -s -X POST \
  "$SUPABASE_URL/rest/v1/rpc/exec_sql" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"sql\":\"$SQL_CONTENT\"}")

echo "Resposta da API: $RESPONSE"

# Verificar se a tabela existe
echo "Verificando se a tabela foi criada..."
CHECK_TABLE=$(curl -s -X GET \
  "$SUPABASE_URL/rest/v1/information_schema/tables?select=table_name&table_schema=eq.public&table_name=eq.activity_logs" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY")

echo "Resultado da verificação: $CHECK_TABLE"

if [[ "$CHECK_TABLE" == *"activity_logs"* ]]; then
  echo "✅ Tabela activity_logs criada com sucesso!"
else
  echo "❌ A tabela não parece ter sido criada ou não está acessível"
fi
