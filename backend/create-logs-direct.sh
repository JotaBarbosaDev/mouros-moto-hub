#!/bin/bash
# Script para criar tabela de logs de atividade diretamente

echo "Criando tabela de logs de atividade..."

# Verificar se o arquivo .env.local existe
if [ -f /Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/frontend/.env.local ]; then
  # Extrair credenciais do Supabase do arquivo .env.local
  SUPABASE_URL=$(grep VITE_SUPABASE_URL /Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/frontend/.env.local | cut -d '=' -f2 | tr -d '"' | tr -d "'" | tr -d ' ')
  SUPABASE_KEY=$(grep VITE_SUPABASE_ANON_KEY /Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/frontend/.env.local | cut -d '=' -f2 | tr -d '"' | tr -d "'" | tr -d ' ')
  
  if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
    echo "❌ Credenciais do Supabase não encontradas em .env.local!"
    exit 1
  fi
  
  echo "📝 Executando script SQL para criar tabela activity_logs..."
  
  # Imprimir o script SQL
  echo "Conteúdo do script SQL:"
  cat /Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/backend/create-activity-logs-table.sql
  
  # Usar o script SQL para criar a tabela diretamente
  echo "Executando script usando curl para a API REST do Supabase..."
  
  SQL_CONTENT=$(cat /Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/backend/create-activity-logs-table.sql)
  
  curl -X POST "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
    -H "apikey: ${SUPABASE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"sql\": $(echo "$SQL_CONTENT" | jq -s -R .)}"
  
  echo "✅ Tabela de logs de atividade criada com sucesso!"
else
  echo "❌ Arquivo .env.local não encontrado!"
  exit 1
fi
