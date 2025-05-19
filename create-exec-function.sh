#!/bin/bash
# filepath: /Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/create-exec-function.sh

# Cores para melhor formatação da saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Criando função exec para execução SQL direta ===${NC}"

# Carregando variáveis de ambiente do arquivo .env
echo "Carregando variáveis de ambiente do arquivo .env..."
if [ -f .env ]; then
    source .env
else
    echo -e "${RED}Arquivo .env não encontrado!${NC}"
fi

# Verificar configurações do Supabase
SUPABASE_URL=${SUPABASE_URL:-$VITE_SUPABASE_URL}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY:-$SUPABASE_KEY}

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo -e "${RED}Erro: Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são necessárias.${NC}"
  echo "Execute: export SUPABASE_URL=sua-url"
  echo "Execute: export SUPABASE_SERVICE_ROLE_KEY=sua-chave"
  exit 1
fi

# SQL para criar a função exec
SQL_CREATE_EXEC='
CREATE OR REPLACE FUNCTION public.exec(query text, params jsonb DEFAULT '\''{}'\''::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  EXECUTE query;
  RETURN jsonb_build_object(
    "result", jsonb_build_object(
      "query", query,
      "success", true
    )
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    "error", SQLERRM,
    "details", SQLSTATE
  );
END;
$function$;
'

# Criar a função exec diretamente via API REST
echo -e "${YELLOW}Criando função exec via SQL direto...${NC}"

# Executar SQL via API REST do PostgreSQL (sem usar a função exec que ainda não existe)
# Usamos o endpoint SQL diretamente
RESULT=$(curl -s -X POST "${SUPABASE_URL}/rest/v1/sql" \
    -H "Content-Type: application/json" \
    -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
    -d "{\"query\": \"$SQL_CREATE_EXEC\"}")

echo "Resultado: $RESULT"

# Verificar se a função foi criada
echo -e "${YELLOW}Verificando se a função exec foi criada...${NC}"
CHECK_RESULT=$(curl -s -X POST "${SUPABASE_URL}/rest/v1/sql" \
    -H "Content-Type: application/json" \
    -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
    -d "{\"query\": \"SELECT EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'exec' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public'));\"}")

echo "Verificação: $CHECK_RESULT"

if [[ $CHECK_RESULT == *"true"* ]]; then
  echo -e "${GREEN}Função exec criada com sucesso!${NC}"
  echo "Agora você pode executar os scripts de migração e políticas RLS."
else
  echo -e "${RED}Falha ao criar a função exec. Verifique as permissões e configurações do Supabase.${NC}"
fi
