#!/bin/bash
# Script para aplicar correções usando o backend existente

echo "🔧 Aplicando correções usando o backend existente..."

# Navegar para a pasta do backend
cd /Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/backend

# Copiar variáveis de ambiente do frontend para o backend
if [ -f "../frontend/.env.local" ]; then
  echo "📋 Extraindo credenciais do arquivo .env.local do frontend..."
  
  # Extrair credenciais
  SUPABASE_URL=$(grep VITE_SUPABASE_URL ../frontend/.env.local | cut -d '=' -f2 | tr -d '"' | tr -d "'" | tr -d ' ')
  SUPABASE_KEY=$(grep VITE_SUPABASE_ANON_KEY ../frontend/.env.local | cut -d '=' -f2 | tr -d '"' | tr -d "'" | tr -d ' ')
  
  # Criar arquivo .env temporário para o backend
  echo "SUPABASE_URL=$SUPABASE_URL" > .env
  echo "SUPABASE_KEY=$SUPABASE_KEY" >> .env
  echo "SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_KEY" >> .env
  
  echo "✅ Variáveis de ambiente configuradas para o backend."
else
  echo "❌ Arquivo .env.local não encontrado no frontend!"
  exit 1
fi

# Executar o script Node.js
echo "🚀 Executando script de correção..."
node ./src/scripts/apply-fixes.js

echo "✅ Operação concluída!"
