#!/bin/bash

# Script para inicializar tabelas do Supabase
echo "Iniciando script de inicialização de tabelas do Supabase..."

# Criar arquivo .env com as credenciais se não existir
if [ ! -f .env ]; then
  echo "Criando arquivo .env com credenciais do Supabase..."
  cat > .env << EOF
SUPABASE_URL=https://jugfkacnlgdjdosstiks.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1Z2ZrYWNubGdkamRvc3N0aWtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODU0NjA3MzMsImV4cCI6MjAwMTAzNjczM30.ACzJbBpSlI8TEQPC0Em8FljE-fYBjgsSGSFGsfk7AY4
EOF
fi

# Navegar para o diretório do projeto
cd /Users/joaobarbosa/Desktop/projetos/mouros-moto-hub

# Executar o script de inicialização
echo "Executando script de inicialização..."
echo "------------------------------------------------"
node initialize-supabase-tables.js

echo "------------------------------------------------"
echo "Procedimento de inicialização concluído."
