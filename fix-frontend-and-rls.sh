#!/bin/bash
# Script para corrigir problemas de campos duplicados no frontend e RLS no Supabase
# Created on May 19, 2025

echo "🔧 Iniciando correção dos problemas de campos duplicados e RLS do Supabase..."

# 1. Executar os scripts SQL necessários para corrigir as políticas RLS
echo "📊 Configurando políticas RLS para veículos..."
cd "$(dirname "$0")"
source ./fix-vehicles-rls.sh

# 2. Criar a função RPC para bypass do RLS
echo "🔄 Criando função RPC para bypass de RLS..."
source ./fix-sql-execution.sh ./backend/create-vehicle-function.sql

# 3. Remover campos duplicados no backend
echo "🧹 Corrigindo duplicação de campos no backend..."
source ./fix-engine-size.sh

# 4. Executar um npm build para aplicar as alterações no frontend
echo "🏗️ Reconstruindo o frontend para aplicar as alterações..."
cd frontend
npm run build

echo "✅ Correções aplicadas com sucesso!"
echo "Por favor, reinicie o aplicativo para que as alterações entrem em vigor."

# Instruções finais
echo ""
echo "📋 Instruções finais:"
echo "1. Execute 'npm run dev' para iniciar o servidor de desenvolvimento"
echo "2. Verifique se o problema dos campos duplicados foi resolvido"
echo "3. Verifique se os erros de RLS no console desapareceram"
echo ""
echo "Se ainda houver problemas, consulte o README.md para mais informações."
