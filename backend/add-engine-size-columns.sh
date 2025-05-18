#!/bin/bash

echo "Script para adicionar a coluna engine_size à tabela vehicles"
echo "============================================================"

# Verificar se temos o arquivo .env com as variáveis de ambiente
if [ -f .env ]; then
  source .env
  echo "Arquivo .env carregado."
else
  echo "Arquivo .env não encontrado. Usando variáveis de ambiente atuais."
fi

# Verificar se temos as variáveis necessárias
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
  echo "As variáveis SUPABASE_URL e SUPABASE_KEY devem estar definidas."
  
  # Tentar buscar do arquivo .env.local ou .env.development
  if [ -f .env.local ]; then
    source .env.local
    echo "Arquivo .env.local carregado."
  elif [ -f .env.development ]; then
    source .env.development
    echo "Arquivo .env.development carregado."
  fi
  
  # Verificar novamente
  if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
    echo "As variáveis ainda não estão definidas. Usando valores padrão."
    # Valores padrão baseados no que é comum em desenvolvimento
    SUPABASE_URL="http://localhost:54321"
    SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
    echo "URL do Supabase: $SUPABASE_URL"
    echo "Key do Supabase: $SUPABASE_KEY"
  fi
fi

# Extrair URL base do SUPABASE_URL
BASE_URL=${SUPABASE_URL}

# Configurar o endpoint de SQL do Supabase REST
SQL_URL="${BASE_URL}/rest/v1/rpc/exec_sql"

echo "URL do SQL: $SQL_URL"

# Função para executar SQL via REST API
function exec_sql() {
  local sql="$1"
  echo "Executando SQL: $sql"
  
  # Usar curl para fazer a chamada à API
  curl -s -X POST "$SQL_URL" \
    -H "apikey: $SUPABASE_KEY" \
    -H "Authorization: Bearer $SUPABASE_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"sql\": \"$sql\"}"
  
  echo -e "\nComando SQL executado."
}

# Verificar se a coluna existe
echo "Verificando se a coluna engine_size já existe..."
COLUMN_EXISTS=$(exec_sql "SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'engine_size') as exists;")

# Se contiver "true" na resposta, a coluna existe
if [[ $COLUMN_EXISTS == *"true"* ]]; then
  echo "A coluna engine_size já existe na tabela vehicles."
else
  echo "A coluna engine_size não existe. Adicionando..."
  
  # Adicionar a coluna engine_size
  exec_sql "ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS engine_size INTEGER;"
  
  # Atualizar os valores da coluna engine_size com os valores de displacement
  exec_sql "UPDATE public.vehicles SET engine_size = displacement WHERE engine_size IS NULL AND displacement IS NOT NULL;"
  
  echo "Coluna engine_size adicionada e valores sincronizados."
fi

# Verificar se a coluna displacement existe
echo "Verificando se a coluna displacement já existe..."
COLUMN_EXISTS=$(exec_sql "SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'displacement') as exists;")

# Se contiver "true" na resposta, a coluna existe
if [[ $COLUMN_EXISTS == *"true"* ]]; then
  echo "A coluna displacement já existe na tabela vehicles."
else
  echo "A coluna displacement não existe. Adicionando..."
  
  # Adicionar a coluna displacement
  exec_sql "ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS displacement INTEGER;"
  
  # Atualizar os valores da coluna displacement com os valores de engine_size
  exec_sql "UPDATE public.vehicles SET displacement = engine_size WHERE displacement IS NULL AND engine_size IS NOT NULL;"
  
  echo "Coluna displacement adicionada e valores sincronizados."
fi

echo "Operação concluída."
