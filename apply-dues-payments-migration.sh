#!/bin/bash

# Script para aplicar a migração que cria a tabela de pagamentos de mensalidades

# Carregando variáveis de ambiente do arquivo .env
echo "Carregando variáveis de ambiente do arquivo .env..."
if [ -f .env ]; then
    source .env
else
    echo "Arquivo .env não encontrado!"
fi

# Verificando se as variáveis necessárias estão definidas
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "Erro: Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são necessárias."
    echo "Execute: export SUPABASE_URL=sua-url"
    echo "Execute: export SUPABASE_SERVICE_ROLE_KEY=sua-chave"
    exit 1
fi

# Mostrar informações de debug
echo "URL Supabase: ${SUPABASE_URL}"
echo "Chave de API: ${SUPABASE_SERVICE_ROLE_KEY:0:5}... (primeiros 5 caracteres)"
echo "Verificando arquivo SQL..."
if [ -f "backend/create-dues-payments-table.sql" ]; then
    echo "Arquivo SQL encontrado (tamanho: $(wc -c < backend/create-dues-payments-table.sql) bytes)"
else
    echo "ERRO: Arquivo SQL não encontrado!"
    exit 1
fi

# Ler o conteúdo SQL
SQL_CONTENT=$(cat backend/create-dues-payments-table.sql)

# Executando a migração SQL
echo "Aplicando migração para criar a tabela dues_payments..."
echo "Enviando SQL para API..."

# Formatar o conteúdo como um parâmetro JSON adequado
JSON_DATA="{\"query\": $(jq -Rs . < backend/create-dues-payments-table.sql)}"

echo "Enviando requisição para a API..."
RESULT=$(curl -s -X POST "${SUPABASE_URL}/rest/v1/rpc/exec" \
    -H "Content-Type: application/json" \
    -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
    -d "$JSON_DATA")

echo "Resultado da API: $RESULT"
echo "Migração concluída!"
