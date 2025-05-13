#!/bin/bash

# Script para iniciar o frontend e backend manualmente
# Use este script se o start-dev.sh estiver apresentando problemas

echo "=== Script Manual para Iniciar Mouros Moto Hub ==="
echo "Este script iniciará o backend em segundo plano e o frontend no terminal atual"
echo "------------------------------------------------------------"

cd "$(dirname "$0")"

# Verificar se os diretórios existem
if [ ! -d "./frontend" ] || [ ! -d "./backend" ]; then
  echo "Erro: Execute este script na raiz do projeto Mouros Moto Hub"
  exit 1
fi

# Verificar se as dependências estão instaladas
if [ ! -d "./frontend/node_modules" ]; then
  echo "Instalando dependências do frontend..."
  cd frontend && npm install && cd ..
fi

if [ ! -d "./backend/node_modules" ]; then
  echo "Instalando dependências do backend..."
  cd backend && npm install && cd ..
fi

# Iniciar backend em segundo plano
echo "Iniciando backend na porta 3001..."
cd backend
NODE_ENV=development nohup npm run dev > backend.log 2>&1 &
BACKEND_PID=$!
cd ..

echo "Backend iniciado com PID: $BACKEND_PID (logs em backend/backend.log)"
echo "Aguardando 5 segundos para o backend iniciar..."
sleep 5

# Iniciar frontend no terminal atual
echo "Iniciando frontend na porta 5173..."
echo "Use Ctrl+C para encerrar o frontend quando terminar."
echo "O backend continuará rodando em segundo plano."
echo "Para encerrar o backend após terminar, execute: kill $BACKEND_PID"
echo "------------------------------------------------------------"

cd frontend && npm run dev
