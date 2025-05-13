#!/bin/bash

# Script para atualizar as referências de API no frontend para apontar para o backend

FRONTEND_DIR="/Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/frontend"
API_URL="http://localhost:3001/api"

echo "Atualizando referências de API no frontend..."

# Procurar por URLs antigas e substituir pela nova URL da API
find $FRONTEND_DIR/src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' -e "s|http://localhost:3000/api|$API_URL|g"
find $FRONTEND_DIR/src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' -e "s|/api/|$API_URL/|g"

# Atualizar referências diretas ao Supabase para usar a API
find $FRONTEND_DIR/src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' -e "s|supabase.from('members').select|// Usando API ao invés de Supabase diretamente\n  // supabase.from('members').select|g"

echo "Atualização concluída!"
echo "Lembre-se de verificar se alguma funcionalidade precisa ser ajustada manualmente."
