#!/bin/bash

# Script para verificar e corrigir problemas nas tabelas do Supabase
# Verifica e corrige:
# 1. Coluna engine_size na tabela vehicles
# 2. Tabela activity_logs

# Cores para output
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
NC="\033[0m" # Sem cor

echo -e "${YELLOW}=== Verificador e Corretor de Tabelas - Mouros Moto Hub ===${NC}"

# Carregar variáveis de ambiente de arquivo .env se existir
if [ -f "/Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/backend/.env" ]; then
  echo -e "${GREEN}Carregando variáveis de ambiente do backend...${NC}"
  source "/Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/backend/.env"
elif [ -f "/Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/.env" ]; then
  echo -e "${GREEN}Carregando variáveis de ambiente da raiz...${NC}"
  source "/Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/.env"
else
  echo -e "${YELLOW}Arquivo .env não encontrado. Usando variáveis do ambiente atual.${NC}"
fi

# Verificar se variáveis obrigatórias estão definidas
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo -e "${RED}Erro: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são necessárias.${NC}"
  echo -e "${YELLOW}Defina estas variáveis no arquivo .env ou no ambiente.${NC}"
  exit 1
fi

# Função para verificar se a coluna engine_size existe
check_engine_size_column() {
  echo -e "${YELLOW}Verificando coluna engine_size na tabela vehicles...${NC}"
  
  RESPONSE=$(curl -s -X GET \
    "$SUPABASE_URL/rest/v1/rpc/exec_sql" \
    -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"sql\": \"SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'engine_size') as exists;\"}")
  
  if [[ "$RESPONSE" == *"true"* ]]; then
    echo -e "${GREEN}✅ Coluna engine_size já existe na tabela vehicles.${NC}"
    return 0
  elif [[ "$RESPONSE" == *"false"* ]]; then
    echo -e "${YELLOW}⚠️ Coluna engine_size não encontrada. Será criada.${NC}"
    return 1
  else
    echo -e "${RED}Erro ao verificar coluna engine_size: $RESPONSE${NC}"
    # Tenta verificar se a função exec_sql existe
    check_exec_sql
    return 2
  fi
}

# Função para verificar se a coluna displacement existe
check_displacement_column() {
  echo -e "${YELLOW}Verificando coluna displacement na tabela vehicles...${NC}"
  
  RESPONSE=$(curl -s -X GET \
    "$SUPABASE_URL/rest/v1/rpc/exec_sql" \
    -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"sql\": \"SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'displacement') as exists;\"}")
  
  if [[ "$RESPONSE" == *"true"* ]]; then
    echo -e "${GREEN}✅ Coluna displacement já existe na tabela vehicles.${NC}"
    return 0
  elif [[ "$RESPONSE" == *"false"* ]]; then
    echo -e "${YELLOW}⚠️ Coluna displacement não encontrada. Será criada.${NC}"
    return 1
  else
    echo -e "${RED}Erro ao verificar coluna displacement: $RESPONSE${NC}"
    # Tenta verificar se a função exec_sql existe
    check_exec_sql
    return 2
  fi
}

# Função para verificar se a função exec_sql existe
check_exec_sql() {
  echo -e "${YELLOW}Verificando função exec_sql...${NC}"
  
  RESPONSE=$(curl -s -X GET \
    "$SUPABASE_URL/rest/v1/rpc/exec_sql" \
    -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"sql\": \"SELECT 'exec_sql exists' as status;\"}")
  
  if [[ "$RESPONSE" == *"exec_sql exists"* ]]; then
    echo -e "${GREEN}✅ Função exec_sql já existe.${NC}"
    return 0
  else
    echo -e "${YELLOW}⚠️ Função exec_sql não encontrada ou não funciona. Será criada.${NC}"
    create_exec_sql_function
    return 1
  fi
}

# Função para criar a função exec_sql
create_exec_sql_function() {
  echo -e "${YELLOW}Criando função exec_sql...${NC}"
  
  RESPONSE=$(curl -s -X POST \
    "$SUPABASE_URL/rest/v1/rpc/exec_sql" \
    -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"sql\": \"CREATE OR REPLACE FUNCTION public.exec_sql(sql text) RETURNS SETOF json LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN RETURN QUERY EXECUTE sql; END; $$; GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO anon, authenticated;\"}")
  
  if [[ "$RESPONSE" == *"error"* ]]; then
    echo -e "${RED}Erro ao criar função exec_sql. Você deve criar manualmente:${NC}"
    echo -e "${YELLOW}--- SQL para criar função exec_sql ---${NC}"
    echo "CREATE OR REPLACE FUNCTION public.exec_sql(sql text) RETURNS SETOF json LANGUAGE plpgsql SECURITY DEFINER AS \$\$ BEGIN RETURN QUERY EXECUTE sql; END; \$\$;"
    echo "GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO anon, authenticated;"
    return 1
  else
    echo -e "${GREEN}✅ Função exec_sql criada com sucesso.${NC}"
    return 0
  fi
}

# Função para criar a coluna engine_size
create_engine_size_column() {
  echo -e "${YELLOW}Criando coluna engine_size na tabela vehicles...${NC}"
  
  RESPONSE=$(curl -s -X POST \
    "$SUPABASE_URL/rest/v1/rpc/exec_sql" \
    -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"sql\": \"ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS engine_size INTEGER; UPDATE public.vehicles SET engine_size = displacement WHERE engine_size IS NULL AND displacement IS NOT NULL;\"}")
  
  if [[ "$RESPONSE" == *"error"* ]]; then
    echo -e "${RED}Erro ao criar coluna engine_size: $RESPONSE${NC}"
    return 1
  else
    echo -e "${GREEN}✅ Coluna engine_size criada e valores atualizados com sucesso.${NC}"
    return 0
  fi
}

# Função para criar a coluna displacement
create_displacement_column() {
  echo -e "${YELLOW}Criando coluna displacement na tabela vehicles...${NC}"
  
  RESPONSE=$(curl -s -X POST \
    "$SUPABASE_URL/rest/v1/rpc/exec_sql" \
    -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"sql\": \"ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS displacement INTEGER; UPDATE public.vehicles SET displacement = engine_size WHERE displacement IS NULL AND engine_size IS NOT NULL;\"}")
  
  if [[ "$RESPONSE" == *"error"* ]]; then
    echo -e "${RED}Erro ao criar coluna displacement: $RESPONSE${NC}"
    return 1
  else
    echo -e "${GREEN}✅ Coluna displacement criada e valores atualizados com sucesso.${NC}"
    return 0
  fi
}

# Função para verificar se a tabela activity_logs existe
check_activity_logs_table() {
  echo -e "${YELLOW}Verificando tabela activity_logs...${NC}"
  
  RESPONSE=$(curl -s -X GET \
    "$SUPABASE_URL/rest/v1/rpc/exec_sql" \
    -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"sql\": \"SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'activity_logs') as exists;\"}")
  
  if [[ "$RESPONSE" == *"true"* ]]; then
    echo -e "${GREEN}✅ Tabela activity_logs já existe.${NC}"
    return 0
  elif [[ "$RESPONSE" == *"false"* ]]; then
    echo -e "${YELLOW}⚠️ Tabela activity_logs não encontrada. Será criada.${NC}"
    return 1
  else
    echo -e "${RED}Erro ao verificar tabela activity_logs: $RESPONSE${NC}"
    return 2
  fi
}

# Função para criar a tabela activity_logs
create_activity_logs_table() {
  echo -e "${YELLOW}Criando tabela activity_logs...${NC}"
  
  SQL=$(cat /Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/frontend/create-activity-logs-table.sql)
  SQL="${SQL//\"/\\\"}"  # Escapar aspas duplas
  SQL="${SQL//$'\n'/\\n}"  # Escapar quebras de linha
  
  RESPONSE=$(curl -s -X POST \
    "$SUPABASE_URL/rest/v1/rpc/exec_sql" \
    -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"sql\": \"$SQL\"}")
  
  if [[ "$RESPONSE" == *"error"* ]]; then
    echo -e "${RED}Erro ao criar tabela activity_logs: $RESPONSE${NC}"
    echo -e "${YELLOW}Por favor, execute manualmente o SQL de criação da tabela encontrado em:${NC}"
    echo -e "${GREEN}/Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/frontend/create-activity-logs-table.sql${NC}"
    return 1
  else
    echo -e "${GREEN}✅ Tabela activity_logs criada com sucesso.${NC}"
    return 0
  fi
}

# Função para verificar se tudo está funcionando
verify_fixes() {
  echo -e "${YELLOW}Verificando se as correções foram aplicadas...${NC}"
  
  # Verificar engine_size
  RESPONSE1=$(curl -s -X GET \
    "$SUPABASE_URL/rest/v1/vehicles?select=id,engine_size&limit=1" \
    -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY")
  
  if [[ "$RESPONSE1" != *"error"* ]]; then
    echo -e "${GREEN}✅ Coluna engine_size está acessível.${NC}"
  else
    echo -e "${RED}❌ Ainda há problemas com a coluna engine_size.${NC}"
  fi
  
  # Verificar activity_logs
  RESPONSE2=$(curl -s -X GET \
    "$SUPABASE_URL/rest/v1/activity_logs?select=id&limit=1" \
    -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY")
  
  if [[ "$RESPONSE2" != *"error"* ]]; then
    echo -e "${GREEN}✅ Tabela activity_logs está acessível.${NC}"
  else
    echo -e "${RED}❌ Ainda há problemas com a tabela activity_logs.${NC}"
  fi
}

# Executar verificação e correção
echo -e "${YELLOW}Iniciando verificação e correção de tabelas...${NC}"

# Verificar e criar função exec_sql se necessário
check_exec_sql

# Verificar e criar coluna engine_size se necessário
if ! check_engine_size_column; then
  create_engine_size_column
fi

# Verificar e criar coluna displacement se necessário
if ! check_displacement_column; then
  create_displacement_column
fi

# Sincronizar valores entre as colunas para garantir consistência
echo -e "${YELLOW}Sincronizando valores entre as colunas engine_size e displacement...${NC}"
curl -s -X POST \
  "$SUPABASE_URL/rest/v1/rpc/exec_sql" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"sql\": \"UPDATE public.vehicles SET displacement = engine_size WHERE displacement IS NULL AND engine_size IS NOT NULL; UPDATE public.vehicles SET engine_size = displacement WHERE engine_size IS NULL AND displacement IS NOT NULL;\"}" > /dev/null
echo -e "${GREEN}✅ Valores sincronizados entre as colunas.${NC}"

# Verificar e criar tabela activity_logs se necessário
if ! check_activity_logs_table; then
  create_activity_logs_table
fi

# Verificar se tudo está funcionando
verify_fixes

echo -e "${GREEN}Processo concluído!${NC}"
echo -e "${YELLOW}Se ainda houver problemas, verifique os logs e execute as correções manualmente.${NC}"
