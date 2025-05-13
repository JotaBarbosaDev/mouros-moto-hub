#!/bin/bash

# Script para limpar a estrutura de pasta do projeto
# Este script remove os arquivos duplicados da raiz após a reorganização

echo "Iniciando limpeza da estrutura do projeto..."

# Verifica se estamos na raiz do projeto
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
  echo "Erro: Execute este script na raiz do projeto Mouros Moto Hub"
  exit 1
fi

# Lista de diretórios que podem ser removidos da raiz
# Atenção: só execute isso depois de confirmar que todos os arquivos foram movidos
echo "Os seguintes diretórios estão duplicados e podem ser removidos:"
echo "- src/ (movido para frontend/src)"
echo "- public/ (movido para frontend/public)"
echo "- supabase/ (movido para backend/supabase)"
echo "- _tests/ (movido para backend/_tests)"
echo "- node_modules/ (agora temos versões separadas em frontend/ e backend/)"

# Lista de arquivos que podem ser removidos da raiz
echo -e "\nOs seguintes arquivos podem ser removidos da raiz:"
echo "- package.json (substituído por frontend/package.json e backend/package.json)"
echo "- package-lock.json (substituído por frontend/package-lock.json e backend/package-lock.json)"
echo "- *.config.js/ts (movidos para frontend/)"
echo "- index.html (movido para frontend/)"
echo "- *.html e *.sh específicos da API (movidos para backend/)"

echo -e "\nDeseja remover esses arquivos e diretórios da raiz do projeto? (S/N)"
read -r resposta

if [[ "$resposta" =~ ^[Ss]$ ]]; then
  echo "Removendo diretórios duplicados..."
  rm -rf src
  rm -rf public
  rm -rf supabase
  rm -rf _tests
  rm -rf node_modules
  rm -rf dist
  
  echo "Removendo arquivos duplicados..."
  rm -rf package.json
  rm -rf package-lock.json
  rm -rf bun.lockb
  rm -rf index.html
  rm -rf vite.config.ts
  rm -rf tsconfig*.json
  rm -rf *.config.js
  rm -rf consulta-membros.html
  rm -rf test-members-api.html
  rm -rf consultar-membros.sh
  rm -rf testar-api-membros.sh
  rm -rf api-server.js
  rm -rf swagger-server.js
  rm -rf swagger.yaml
  # Mantemos os arquivos .md na raiz para documentação
  
  echo "Limpeza concluída!"
  echo "A estrutura do projeto agora está organizada com frontend/ e backend/"
else
  echo "Operação cancelada. Nenhum arquivo foi removido."
fi
