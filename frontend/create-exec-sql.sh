#!/bin/bash
# Script para criar a função exec_sql no Supabase
# Esta função é necessária para que o SystemInitializer.tsx funcione corretamente

echo "========================================="
echo "  Criando função exec_sql no Supabase    "
echo "========================================="
echo ""
echo "Esta ferramenta cria a função SQL necessária para que o"
echo "sistema possa inicializar as tabelas no Supabase."
echo ""

# Verifica se o arquivo .env.local existe
if [ ! -f .env.local ]; then
  echo "⚠️  Arquivo .env.local não encontrado!"
  echo "   Criando arquivo .env.local de exemplo..."
  
  # Cria arquivo .env.local com valores de exemplo
  cat > .env.local << ENVEOF
# Credenciais do Supabase - substitua pelos valores reais
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_supabase
ENVEOF

  echo ""
  echo "✅ Arquivo .env.local criado!"
  echo "   Por favor, edite o arquivo com suas credenciais do Supabase e execute este script novamente."
  exit 1
fi

# Verifica se o Node.js está instalado
if ! command -v node &> /dev/null; then
  echo "❌ Node.js não está instalado. Por favor, instale o Node.js para continuar."
  exit 1
fi

echo "📋 Verificando credenciais do Supabase..."
SUPABASE_URL=$(grep VITE_SUPABASE_URL .env.local | cut -d '=' -f2)
if [ -z "$SUPABASE_URL" ]; then
  echo "❌ URL do Supabase não encontrado em .env.local!"
  echo "   Por favor, adicione VITE_SUPABASE_URL=sua_url_supabase ao arquivo .env.local"
  exit 1
fi

echo "🔧 Criando a função exec_sql no Supabase..."
node --experimental-specifier-resolution=node ./src/create-exec-sql-function.js

echo ""
echo "📋 Próximos passos:"
echo "  1. Verifique se a função foi criada com sucesso"
echo "  2. Execute a aplicação novamente ou recarregue a página"
echo ""
