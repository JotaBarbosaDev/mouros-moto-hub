#!/bin/bash
# Script para verificar as funções RPC instaladas no Supabase

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Verificando funções RPC para bypass do RLS...${NC}"

# Verificar variáveis de ambiente
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  # Tentar carregar de .env
  if [ -f ".env" ]; then
    echo "Carregando variáveis de ambiente do arquivo .env..."
    export $(grep -v '^#' .env | xargs)
  else
    echo -e "${RED}Arquivo .env não encontrado.${NC}"
  fi
fi

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo -e "${RED}Erro: Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são necessárias.${NC}"
  echo "Execute: export SUPABASE_URL=sua-url"
  echo "Execute: export SUPABASE_SERVICE_ROLE_KEY=sua-chave"
  exit 1
fi

# Função para executar SQL no Supabase
exec_sql() {
  local sql="$1"
  
  # Usar curl para executar SQL no Supabase
  curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
    --data "{\"query\": \"$sql\"}" \
    "${SUPABASE_URL}/rest/v1/rpc/exec" | jq '.'
}

# Verificar funções existentes
echo -e "${YELLOW}Verificando funções existentes para veículos...${NC}"
FUNCTIONS=$(exec_sql "SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' AND routine_type = 'FUNCTION' AND routine_name LIKE '%vehicle%';")

echo -e "${GREEN}Funções encontradas:${NC}"
echo "$FUNCTIONS" | jq '.'

# Verificar especificamente a função insert_vehicle
CHECK_INSERT=$(exec_sql "SELECT EXISTS(SELECT 1 FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'insert_vehicle') as exists;")
INSERT_EXISTS=$(echo "$CHECK_INSERT" | jq -r '.exists')

if [ "$INSERT_EXISTS" == "true" ]; then
  echo -e "${GREEN}✅ Função insert_vehicle está instalada.${NC}"
else
  echo -e "${RED}❌ Função insert_vehicle NÃO está instalada!${NC}"
  echo -e "${YELLOW}Executando script para criar a função...${NC}"
  
  # Executar o script para criar a função
  ./fix-sql-execution.sh ./backend/create-vehicle-function.sql
fi

# Verificar funções de habilitação/desabilitação de RLS
CHECK_DISABLE=$(exec_sql "SELECT EXISTS(SELECT 1 FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'disable_vehicles_rls') as exists;")
DISABLE_EXISTS=$(echo "$CHECK_DISABLE" | jq -r '.exists')

if [ "$DISABLE_EXISTS" == "true" ]; then
  echo -e "${GREEN}✅ Função disable_vehicles_rls está instalada.${NC}"
else
  echo -e "${RED}❌ Função disable_vehicles_rls NÃO está instalada!${NC}"
  echo -e "${YELLOW}Executando script para criar a função...${NC}"
  
  # Executar o script para criar a função
  ./fix-sql-execution.sh ./backend/create-disable-rls-function.sql
fi

CHECK_ENABLE=$(exec_sql "SELECT EXISTS(SELECT 1 FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'enable_vehicles_rls') as exists;")
ENABLE_EXISTS=$(echo "$CHECK_ENABLE" | jq -r '.exists')

if [ "$ENABLE_EXISTS" == "true" ]; then
  echo -e "${GREEN}✅ Função enable_vehicles_rls está instalada.${NC}"
else
  echo -e "${RED}❌ Função enable_vehicles_rls NÃO está instalada!${NC}"
  echo -e "${YELLOW}Executando script para criar a função...${NC}"
  
  # Executar o script para criar a função
  ./fix-sql-execution.sh ./backend/create-enable-rls-function.sql
fi

# Verificar status atual do RLS na tabela vehicles
echo -e "${YELLOW}Verificando status atual do RLS na tabela vehicles...${NC}"
RLS_STATUS=$(exec_sql "SELECT relrowsecurity FROM pg_class WHERE relname = 'vehicles' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');")

echo -e "${GREEN}Status do RLS:${NC}"
echo "$RLS_STATUS" | jq '.'

echo -e "${GREEN}Verificação de funções RPC concluída.${NC}"
