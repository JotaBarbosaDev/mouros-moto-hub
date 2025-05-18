#!/bin/bash
# Script para verificar a estrutura do banco de dados

echo "🔧 Verificando estrutura do banco de dados..."

# Navegar para a pasta do backend
cd /Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/backend

# Executar o script Node.js
node ./src/scripts/check-database-structure.js
