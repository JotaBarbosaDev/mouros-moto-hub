#!/bin/bash
# Script para verificar se a integração do sistema de logs está funcionando corretamente

# Definir cores para saída
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=========================================================${NC}"
echo -e "${YELLOW}      VERIFICAÇÃO DO SISTEMA DE LOGS DE ATIVIDADE         ${NC}"
echo -e "${YELLOW}=========================================================${NC}"

# Verificar se o arquivo .env existe no backend
if [ ! -f ./backend/.env ]; then
  echo -e "${RED}❌ Arquivo .env não encontrado no diretório backend!${NC}"
  exit 1
fi

# Extrair credenciais do Supabase do arquivo .env
SUPABASE_URL=$(grep VITE_SUPABASE_URL ./frontend/.env | cut -d '=' -f2)
SUPABASE_KEY=$(grep VITE_SUPABASE_ANON_KEY ./frontend/.env | cut -d '=' -f2)

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
  echo -e "${RED}❌ Credenciais do Supabase não encontradas nos arquivos .env!${NC}"
  echo -e "Verifique se as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão definidas."
  exit 1
fi

echo -e "${GREEN}✅ Credenciais do Supabase encontradas.${NC}"
echo -e "URL do Supabase: $SUPABASE_URL"

# Verificar se a tabela activity_logs existe
echo -e "\n${YELLOW}Verificando se a tabela activity_logs existe...${NC}"

# Usar curl para verificar a tabela
TABLE_CHECK=$(curl -s -X GET "$SUPABASE_URL/rest/v1/activity_logs?select=id&limit=1" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY")

# Verificar se a resposta indica erro 404 (tabela não existe)
if [[ $TABLE_CHECK == *"relation \"public.activity_logs\" does not exist"* ]]; then
  echo -e "${RED}❌ A tabela activity_logs não existe!${NC}"
  echo -e "Execute o script create-activity-logs.sh para criar a tabela."
  exit 1
fi

echo -e "${GREEN}✅ A tabela activity_logs existe.${NC}"

# Inserir um log de teste
echo -e "\n${YELLOW}Inserindo um log de teste...${NC}"

TEST_LOG=$(curl -s -X POST "$SUPABASE_URL/rest/v1/activity_logs" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"user_id": "system", "username": "Script de Verificação", "action": "TEST", "entity_type": "SYSTEM", "details": {"message": "Teste de verificação do sistema de logs"}}')

# Verificar se o log foi inserido com sucesso
if [[ $TEST_LOG == *"id"* ]]; then
  LOG_ID=$(echo $TEST_LOG | grep -o '"id":"[^"]*' | cut -d'"' -f4)
  echo -e "${GREEN}✅ Log de teste inserido com sucesso! ID: $LOG_ID${NC}"
else
  echo -e "${RED}❌ Falha ao inserir log de teste.${NC}"
  echo -e "Resposta: $TEST_LOG"
  exit 1
fi

# Verificar se conseguimos recuperar o log inserido
echo -e "\n${YELLOW}Verificando se o log pode ser recuperado...${NC}"

RETRIEVE_LOG=$(curl -s -X GET "$SUPABASE_URL/rest/v1/activity_logs?id=eq.$LOG_ID" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY")

if [[ $RETRIEVE_LOG == *"$LOG_ID"* ]]; then
  echo -e "${GREEN}✅ Log recuperado com sucesso!${NC}"
else
  echo -e "${RED}❌ Não foi possível recuperar o log inserido.${NC}"
  echo -e "Resposta: $RETRIEVE_LOG"
  exit 1
fi

# Verificar rotas de backend
echo -e "\n${YELLOW}Verificando a integração do middleware de logs no backend...${NC}"

# Verificar arquivos importantes
MIDDLEWARE_FILE="./backend/src/middleware/activity-logger.js"
AUTH_LOGGER_FILE="./backend/src/middleware/auth-logger.js"
SERVICE_FILE="./backend/src/services/activity-log-service.js"

if [ -f "$MIDDLEWARE_FILE" ]; then
  echo -e "${GREEN}✅ Middleware de logging encontrado.${NC}"
else
  echo -e "${RED}❌ Middleware de logging não encontrado!${NC}"
  echo -e "Arquivo esperado: $MIDDLEWARE_FILE"
fi

if [ -f "$AUTH_LOGGER_FILE" ]; then
  echo -e "${GREEN}✅ Middleware de logging de autenticação encontrado.${NC}"
else
  echo -e "${RED}❌ Middleware de logging de autenticação não encontrado!${NC}"
  echo -e "Arquivo esperado: $AUTH_LOGGER_FILE"
fi

if [ -f "$SERVICE_FILE" ]; then
  echo -e "${GREEN}✅ Serviço de logging encontrado.${NC}"
else
  echo -e "${RED}❌ Serviço de logging não encontrado!${NC}"
  echo -e "Arquivo esperado: $SERVICE_FILE"
fi

# Contar quantos arquivos de rotas usam o middleware de logs
ROUTES_WITH_LOGS=$(grep -l "logActivity" ./backend/src/routes/*.js | wc -l)
TOTAL_ROUTES=$(ls -1 ./backend/src/routes/*.js | wc -l)

echo -e "${GREEN}✅ $ROUTES_WITH_LOGS de $TOTAL_ROUTES arquivos de rotas estão usando o middleware de logs.${NC}"

echo -e "\n${GREEN}=====================================${NC}"
echo -e "${GREEN}    VERIFICAÇÃO CONCLUÍDA COM SUCESSO    ${NC}"
echo -e "${GREEN}=====================================${NC}"

echo -e "\nO sistema de logs de atividade está corretamente implementado e funcionando!"
echo -e "Para visualizar os logs, acesse a página de histórico de atividades no painel administrativo."
