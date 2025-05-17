#!/bin/bash
# Script para executar o corretor de tabelas

echo "🔧 Executando script de correção de tabelas..."

# Obter credenciais do arquivo .env.local do frontend
if [ -f "/Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/frontend/.env.local" ]; then
  echo "📋 Lendo credenciais do arquivo .env.local do frontend..."
  
  # Extrair credenciais
  SUPABASE_URL=$(grep VITE_SUPABASE_URL /Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/frontend/.env.local | cut -d '=' -f2 | tr -d '"' | tr -d "'" | tr -d ' ')
  SUPABASE_KEY=$(grep VITE_SUPABASE_ANON_KEY /Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/frontend/.env.local | cut -d '=' -f2 | tr -d '"' | tr -d "'" | tr -d ' ')
  
  # Criar arquivo .env temporário na pasta backend
  echo "VITE_SUPABASE_URL=$SUPABASE_URL" > /Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/backend/.env
  echo "VITE_SUPABASE_ANON_KEY=$SUPABASE_KEY" >> /Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/backend/.env
  
  echo "✅ Credenciais temporárias configuradas."
else
  echo "❌ Arquivo .env.local não encontrado no frontend!"
  exit 1
fi

# Executar o script Node.js
echo "🚀 Executando script de correção..."
cd /Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/backend
node ./src/scripts/fix-tables.js

# Limpar arquivo .env temporário
rm -f .env

echo "✅ Operação concluída!"
