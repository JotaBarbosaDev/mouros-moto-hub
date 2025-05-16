#!/bin/bash

# Cores para feedback visual
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Criando tabela de logs de atividade...${NC}"

# Verificar se as variáveis de ambiente estão configuradas
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo -e "${RED}Erro: Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar definidas${NC}"
  echo "Execute os seguintes comandos para configurar as variáveis:"
  echo "export SUPABASE_URL=sua_url_do_supabase"
  echo "export SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico"
  exit 1
fi

# Criar a tabela usando o URL da API RESTful do Supabase
echo -e "${YELLOW}Executando script SQL para criar a tabela activity_logs...${NC}"

# Capturar o conteúdo do arquivo SQL
SQL_CONTENT=$(cat create-activity-logs-table.sql)

# Executar o SQL usando a API RESTful do Supabase
RESPONSE=$(curl -s -X POST \
  "$SUPABASE_URL/rest/v1/rpc/exec_sql" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"$SQL_CONTENT\"}")

# Verificar se a execução foi bem-sucedida
if [[ $RESPONSE == *"error"* ]]; then
  echo -e "${RED}Erro ao criar a tabela:${NC}"
  echo "$RESPONSE"
  exit 1
else
  echo -e "${GREEN}Tabela de logs de atividade criada com sucesso!${NC}"
fi

# Opcional: verificar se a tabela foi criada
CHECK_TABLE=$(curl -s -X GET \
  "$SUPABASE_URL/rest/v1/activity_logs?select=id&limit=1" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY")

if [[ $CHECK_TABLE == *"error"* ]]; then
  echo -e "${YELLOW}Aviso: Não foi possível verificar se a tabela foi criada${NC}"
else
  echo -e "${GREEN}Verificação bem-sucedida: tabela activity_logs está acessível${NC}"
fi

echo -e "${GREEN}Processo concluído.${NC}"
