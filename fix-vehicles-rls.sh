#!/bin/bash
# Script para corrigir políticas RLS da tabela vehicles

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Aplicando correção de políticas RLS na tabela vehicles...${NC}"

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

# Verificar se a tabela vehicles existe
echo -e "${YELLOW}Verificando se a tabela 'vehicles' existe...${NC}"
TABLE_EXISTS=$(exec_sql "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'vehicles') as exists;")
EXISTS=$(echo $TABLE_EXISTS | jq -r '.exists')

if [ "$EXISTS" != "true" ]; then
  echo -e "${RED}Tabela 'vehicles' não existe no banco de dados.${NC}"
  exit 1
fi

# Aplicar arquivo SQL
echo -e "${YELLOW}Aplicando políticas RLS na tabela 'vehicles'...${NC}"

# Ler o conteúdo do arquivo SQL
SQL_CONTENT=$(cat backend/fix-vehicles-rls.sql)

# Escapar aspas simples para evitar problemas no curl
SQL_CONTENT=$(echo "$SQL_CONTENT" | sed "s/'/\\\\'/g")

# Executar o SQL
RESULT=$(exec_sql "$SQL_CONTENT")
echo -e "${GREEN}SQL executado com sucesso.${NC}"

# Verificar estado atual das políticas RLS
echo -e "${YELLOW}Verificando políticas RLS aplicadas...${NC}"
POLICIES=$(exec_sql "SELECT * FROM pg_policies WHERE tablename = 'vehicles';")
echo -e "${GREEN}Políticas atuais na tabela 'vehicles':${NC}"
echo "$POLICIES" | jq '.'

echo -e "${GREEN}Correção de políticas RLS da tabela 'vehicles' concluída.${NC}"
echo -e "${YELLOW}Tente usar o aplicativo novamente para verificar se o problema foi resolvido.${NC}"
