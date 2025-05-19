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

# Executando a migração SQL
echo "Aplicando migração para criar a tabela dues_payments..."
curl -X POST "${SUPABASE_URL}/rest/v1/rpc/exec" \
    -H "Content-Type: application/json" \
    -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
    --data-binary @backend/create-dues-payments-table.sql

echo "Migração concluída!"
