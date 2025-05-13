#!/bin/bash
# Script para inicializar tabelas no Supabase

# Verifica se o arquivo .env.local existe
if [ ! -f .env.local ]; then
  echo "Arquivo .env.local não encontrado!"
  echo "Criando arquivo .env.local de exemplo..."
  
  # Cria arquivo .env.local com valores de exemplo
  cat > .env.local << EOF
# Credenciais do Supabase - substitua pelos valores reais
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_supabase
EOF

  echo "Edite o arquivo .env.local com suas credenciais do Supabase e execute este script novamente."
  exit 1
fi

# Executa o script de inicialização
echo "Inicializando tabelas no Supabase..."
node --experimental-specifier-resolution=node --loader ts-node/esm ./src/init-tables.js

# Verifica o resultado
if [ $? -eq 0 ]; then
  echo "✅ Tabelas inicializadas com sucesso!"
else
  echo "❌ Ocorreu um erro ao inicializar as tabelas. Verifique as mensagens acima."
  exit 1
fi
