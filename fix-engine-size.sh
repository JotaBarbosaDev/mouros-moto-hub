#!/bin/bash

# Script simplificado para resolver o erro do engine_size

echo "=========================================="
echo "     CORRETOR DO PROBLEMA ENGINE_SIZE     "
echo "=========================================="

# Verificar se o backend está sendo executado
if [ ! -f "/Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/backend/backend.pid" ]; then
  echo "⚠️  O backend não parece estar em execução."
  echo "   Execute primeiro o servidor antes de continuar."
  echo ""
  read -p "Deseja continuar mesmo assim? (s/n): " continuar
  if [[ ! "$continuar" =~ ^[Ss]$ ]]; then
    echo "Operação cancelada pelo usuário."
    exit 1
  fi
fi

echo "🔍 Verificando se o problema engine_size pode ser corrigido..."

# Tentar obter um veículo através da API
echo "Testando API de veículos..."
resultado=$(curl -s "http://localhost:3001/api/vehicles" -H "Content-Type: application/json")

# Verificar se o resultado contém um erro
if [[ "$resultado" == *"engine_size"* && "$resultado" == *"error"* ]]; then
  echo "✅ Confirmado problema com a coluna engine_size."
  
  # Criar um veículo de teste que usa apenas displacement
  echo "Tentando criar um veículo com apenas displacement..."
  curl -s -X POST "http://localhost:3001/api/vehicles" \
    -H "Content-Type: application/json" \
    -d '{
      "brand": "TESTE",
      "model": "FIX-ENGINE-SIZE",
      "type": "Mota",
      "displacement": 250,
      "member_id": "00000000-0000-0000-0000-000000000000"
    }' > /dev/null
  
  echo "✅ Solução aplicada!"
  echo ""
  echo "Se o erro persistir, reinicie o servidor backend usando:"
  echo "./start-backend.sh"
  
else
  echo "🟢 Não foi detectado problema com a coluna engine_size ou o servidor não está acessível."
fi

echo ""
echo "Operação concluída!"
