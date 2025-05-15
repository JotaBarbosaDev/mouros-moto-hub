#!/bin/bash
# Script para criar uma versão alternativa do SystemInitializer 
# que não depende da função exec_sql no Supabase

echo "========================================="
echo "  Criando alternativa ao SystemInitializer  "
echo "========================================="
echo ""

# Verifica se o Node.js está instalado
if ! command -v node &> /dev/null; then
  echo "❌ Node.js não está instalado. Por favor, instale o Node.js para continuar."
  exit 1
fi

echo "📋 Verificando as tabelas e criando uma solução alternativa..."
node --experimental-specifier-resolution=node ./src/create-alternative-initializer.js

echo ""
echo "📋 Para usar a solução alternativa:"
echo "  1. Modifique o arquivo principal da aplicação para importar SystemInitializerBasic em vez de SystemInitializer"
echo "  2. Execute o SQL em create-all-tables.sql no painel do Supabase"
echo "  3. Recarregue a aplicação"
echo ""
